import { eq } from "drizzle-orm"
import { NonRetriableError } from "inngest"
import { MAX_RETRIES } from "@/config/background-jobs"
import { db } from "@/db/drizzle"
import { type NodeType, workflow } from "@/db/schemas/workflow-schema"
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
  },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId

    if (!workflowId) throw new NonRetriableError("Missing workflow ID")

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
        } else {
          failedNodeIds.add(node.id)
        }
      })
    }

    return { workflowId, result: context }
  },
)
