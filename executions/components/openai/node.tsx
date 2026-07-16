"use client"

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "@/executions/components/base-execution-node"
import { fetchOpenAIRealtimeToken } from "@/executions/components/openai/actions"
import {
  OpenAIDialog,
  type OpenAIFormValues,
} from "@/executions/components/openai/dialog"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { openaiChannel } from "@/inngest/channels/openai"
import openaiModels from "@/lib/ai/models/openai-models.json"

type OpenAINodeData = {
  variableName?: string
  credentialId?: string
  model?: string
  systemPrompt?: string
  userPrompt?: string
}

type OpenAINodeType = Node<OpenAINodeData>

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: openaiChannel(),
    token: fetchOpenAIRealtimeToken,
  })

  const nodeData = props.data
  const description = nodeData?.userPrompt
    ? `${nodeData.model || openaiModels.models[0] || "openai"}: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured"
  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: OpenAIFormValues) => {
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
      <OpenAIDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        availableModels={openaiModels.models}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="OpenAI"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

OpenAINode.displayName = "OpenAI Node"
