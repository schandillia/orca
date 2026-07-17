"use client"

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "@/executions/components/base-execution-node"
import { fetchSlackRealtimeToken } from "@/executions/components/slack/actions"
import {
  SlackDialog,
  type SlackFormValues,
} from "@/executions/components/slack/dialog"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { slackChannel } from "@/inngest/channels/slack"

type SlackNodeData = {
  webhookUrl?: string
  content?: string
}

type SlackNodeType = Node<SlackNodeData>

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: slackChannel(),
    token: fetchSlackRealtimeToken,
  })

  const nodeData = props.data
  const description = nodeData?.content
    ? `Send ${nodeData.content.slice(0, 50)}...`
    : "Not configured"
  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: SlackFormValues) => {
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
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/slack.svg"
        name="Slack"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

SlackNode.displayName = "Slack Node"
