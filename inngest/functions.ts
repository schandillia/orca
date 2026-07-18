import { and, eq } from "drizzle-orm"
import { NonRetriableError } from "inngest"
import { MAX_RETRIES } from "@/config/background-jobs"
import { db } from "@/db/drizzle"
import {
  ExecutionStatus,
  execution,
  type NodeOutput,
  type NodeType,
  workflow,
} from "@/db/schemas/workflow-schema"
import { getExecutor } from "@/executions/lib/executor-registry"
import { inngest } from "@/inngest/client"
import { groupIntoLevels } from "@/inngest/utils"

// const createTelemetryOptions = (functionId: string) => ({
//   isEnabled: true,
//   functionId,
//   recordInputs: true,
//   recordOutputs: true,
// })

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: MAX_RETRIES,
    triggers: {
      event: "workflows/execute.workflow",
    },
    onFailure: async ({ event, step }) => {
      const inngestEventId = event.data.event.id

      if (!inngestEventId) {
        throw new NonRetriableError("Missing Inngest event ID")
      }

      return await step.run("update-execution-failed", async () => {
        await db
          .update(execution)
          .set({
            status: ExecutionStatus.FAILED,
            error: event.data.error.message,
            errorStack: event.data.error.stack,
          })
          .where(eq(execution.inngestEventId, inngestEventId))
      })
    },
  },
  async ({ event, step }) => {
    const inngestEventId = event.id
    const workflowId = event.data.workflowId

    if (!inngestEventId || !workflowId)
      throw new NonRetriableError("Missing event ID or workflow ID")

    await step.run("create-execution", async () => {
      const [newExecution] = await db
        .insert(execution)
        .values({
          id: crypto.randomUUID(),
          workflowId,
          inngestEventId,
        })
        .returning()

      return newExecution
    })

    const { levels, dependencies, userId } = await step.run(
      "prepare-workflow",
      async () => {
        const existingWorkflow = await db.query.workflow.findFirst({
          where: eq(workflow.id, workflowId),
          with: {
            nodes: true,
            connections: true,
          },
        })
        if (!existingWorkflow) throw new NonRetriableError("Workflow not found")

        const { levels, dependencies } = groupIntoLevels(
          existingWorkflow.nodes,
          existingWorkflow.connections,
        )

        return {
          levels,
          dependencies,
          userId: existingWorkflow.userId,
        }
      },
    )

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {}
    const nodeErrors: {
      nodeId: string
      nodeName: string
      variableName: string
      message: string
      stack?: string
    }[] = []
    const nodeOutputs: NodeOutput[] = []

    // Execute each level's nodes concurrently; wait for the full level
    // before moving to the next, so dependents always see prior results.
    const failedNodeIds = new Set<string>()

    for (const level of levels) {
      const runnableNodes = level.filter((node) => {
        const preds = dependencies[node.id] || []
        const blocked = preds.some((p) => failedNodeIds.has(p))
        if (blocked) failedNodeIds.add(node.id) // propagate the skip downstream
        return !blocked
      })

      const results = await Promise.allSettled(
        runnableNodes.map((node) => {
          const executor = getExecutor(node.type as NodeType)
          return executor({
            data: node.data as Record<string, unknown>,
            nodeId: node.id,
            context,
            step,
            publish: step.realtime.publish,
            userId,
          })
        }),
      )

      results.forEach((result, i) => {
        const node = runnableNodes[i]

        if (result.status === "fulfilled") {
          context = { ...context, ...result.value }

          const variableName = (node.data as { variableName: string })
            .variableName
          const output = result.value[variableName]
          if (output != null && Object.keys(output).length > 0) {
            nodeOutputs.push({
              nodeId: node.id,
              nodeName: node.name,
              variableName,
              output,
            })
          }
        } else {
          failedNodeIds.add(node.id)

          const error =
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason))

          nodeErrors.push({
            nodeId: node.id,
            nodeName: node.name,
            variableName: (node.data as { variableName: string }).variableName,
            message: error.message,
            stack: error.stack,
          })
        }
      })
    }

    await step.run("update-execution", async () => {
      await db
        .update(execution)
        .set({
          status:
            failedNodeIds.size > 0
              ? ExecutionStatus.COMPLETED_WITH_ERRORS
              : ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: nodeOutputs,
          nodeErrors,
        })
        .where(
          and(
            eq(execution.inngestEventId, inngestEventId),
            eq(execution.workflowId, workflowId),
          ),
        )
    })

    return { workflowId, result: context }
  },
)
