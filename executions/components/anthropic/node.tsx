"use client"

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { fetchAnthropicRealtimeToken } from "@/executions/components/anthropic/actions"
import {
  AnthropicDialog,
  type AnthropicFormValues,
} from "@/executions/components/anthropic/dialog"
import { BaseExecutionNode } from "@/executions/components/base-execution-node"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { anthropicChannel } from "@/inngest/channels/anthropic"
import anthropicModels from "@/lib/ai/models/anthropic-models.json"

type AnthropicNodeData = {
  variableName?: string
  model?: string
  systemPrompt?: string
  userPrompt?: string
}

type AnthropicNodeType = Node<AnthropicNodeData>

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: anthropicChannel(),
    token: fetchAnthropicRealtimeToken,
  })

  const nodeData = props.data
  const description = nodeData?.userPrompt
    ? `${nodeData.model || anthropicModels.models[0] || "anthropic"}: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured"
  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          }
        }
        return node
      }),
    )
  }

  return (
    <>
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        availableModels={anthropicModels.models}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

AnthropicNode.displayName = "Anthropic Node"
