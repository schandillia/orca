import type { NodeExecutor } from "@/executions/types"
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger"

type ManualTriggerData = Record<string, unknown>

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish("manual-trigger-loading", manualTriggerChannel().status, {
    nodeId,
    status: "loading",
  })

  const result = await step.run("manual-trigger", async () => context)

  await publish("manual-trigger-loading", manualTriggerChannel().status, {
    nodeId,
    status: "success",
  })

  return result
}
