import type { NodeTypes } from "@xyflow/react"
import { InitialNode } from "@/components/initial-node"
import { NodeType } from "@/db/schemas/workflow-schema"

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes

export type RegisteredNodeType = keyof typeof nodeComponents
