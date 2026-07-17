"use client"

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "@/executions/components/base-execution-node"
import { fetchDiscordRealtimeToken } from "@/executions/components/discord/actions"
import {
  DiscordDialog,
  type DiscordFormValues,
} from "@/executions/components/discord/dialog"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { discordChannel } from "@/inngest/channels/discord"

type DiscordNodeData = {
  webhookUrl?: string
  content?: string
  username?: string
}

type DiscordNodeType = Node<DiscordNodeData>

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: discordChannel(),
    token: fetchDiscordRealtimeToken,
  })

  const nodeData = props.data
  const description = nodeData?.content
    ? `Send ${nodeData.content.slice(0, 50)}...`
    : "Not configured"
  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: DiscordFormValues) => {
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
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/discord.svg"
        name="Discord"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

DiscordNode.displayName = "Discord Node"
