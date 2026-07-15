import type { NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger"
import { BaseTriggerNode } from "@/triggers/components/base-trigger-node"
import { fetchStripeTriggerRealtimeToken } from "@/triggers/components/stripe-trigger/actions"
import { StripeTriggerDialog } from "@/triggers/components/stripe-trigger/dialog"

export const StripeTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: stripeTriggerChannel(),
    token: fetchStripeTriggerRealtimeToken,
  })
  const handleOpenSettings = () => setDialogOpen(true)

  return (
    <>
      <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe"
        description="When a Stripe event is captured"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})
