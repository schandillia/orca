import { NodeType } from "@/db/schemas/workflow-schema"
import { anthropicExecutor } from "@/executions/components/anthropic/executor"
import { geminiExecutor } from "@/executions/components/gemini/executor"
import { httpRequestExecutor } from "@/executions/components/http-request/executor"
import { openaiExecutor } from "@/executions/components/openai/executor"
import type { NodeExecutor } from "@/executions/types"
import { googleFormTriggerExecutor } from "@/triggers/components/google-form-trigger/executor"
import { manualTriggerExecutor } from "@/triggers/components/manual-trigger/executor"
import { stripeTriggerExecutor } from "@/triggers/components/stripe-trigger/executor"

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openaiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
}

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type]

  if (!executor) throw new Error(`No executor found for node type: ${type}`)

  return executor
}
