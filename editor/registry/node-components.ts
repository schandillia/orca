import type { NodeTypes } from "@xyflow/react"
import { InitialNode } from "@/components/initial-node"
import { NodeType } from "@/db/schemas/workflow-schema"
import { HttpRequestNode } from "@/executions/components/http-request/node"
import { GoogleFormTrigger } from "@/triggers/components/google-form-trigger/node"
import { ManualTriggerNode } from "@/triggers/components/manual-trigger/node"

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
} as const satisfies NodeTypes

export type RegisteredNodeType = keyof typeof nodeComponents
