import { NodeType } from "@/db/schemas/workflow-schema"
import { HttpRequestExecutor } from "@/executions/components/http-request/executor"
import type { NodeExecutor } from "@/executions/types"
import { manualTriggerExecutor } from "@/triggers/components/manual-trigger/executor"

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
}

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type]

  if (!executor) throw new Error(`No executor found for node type: ${type}`)

  return executor
}
