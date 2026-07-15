"use client"

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useEffect, useState } from "react"
import { BaseExecutionNode } from "@/executions/components/base-execution-node"
import {
  fetchAvailableGeminiModels,
  fetchGeminiRealtimeToken,
} from "@/executions/components/gemini/actions"
import {
  GeminiDialog,
  type GeminiFormValues,
} from "@/executions/components/gemini/dialog"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { geminiChannel } from "@/inngest/channels/gemini"

type GeminiNodeData = {
  variableName?: string
  model?: string
  systemPrompt?: string
  userPrompt?: string
}

type GeminiNodeType = Node<GeminiNodeData>

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: geminiChannel(),
    token: fetchGeminiRealtimeToken,
  })

  useEffect(() => {
    fetchAvailableGeminiModels().then(setAvailableModels)
  }, [])

  const nodeData = props.data
  const description = nodeData?.userPrompt
    ? `${nodeData.model || availableModels[0] || "gemini"}: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured"
  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: GeminiFormValues) => {
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
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        availableModels={availableModels}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

GeminiNode.displayName = "Gemini Node"
