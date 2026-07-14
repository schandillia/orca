import { eq } from "drizzle-orm"
import { NonRetriableError } from "inngest"
import { MAX_RETRIES } from "@/config/background-jobs"
import { db } from "@/db/drizzle"
import { type NodeType, workflow } from "@/db/schemas/workflow-schema"
import { getExecutor } from "@/executions/lib/executor-registry"
import { inngest } from "@/inngest/client"
import { topologicalSort } from "@/inngest/utils"

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

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const existingWorkflow = await db.query.workflow.findFirst({
        where: eq(workflow.id, workflowId),
        with: {
          nodes: true,
          connections: true,
        },
      })
      if (!existingWorkflow) throw new NonRetriableError("Workflow not found")

      return topologicalSort(
        existingWorkflow.nodes,
        existingWorkflow.connections,
      )
    })

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {}

    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType)
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish: step.realtime.publish,
      })
    }

    return { workflowId, result: context }
  },
)
