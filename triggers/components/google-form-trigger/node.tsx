import type { NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger"
import { BaseTriggerNode } from "@/triggers/components/base-trigger-node"
import { fetchGoogleFormTriggerRealtimeToken } from "@/triggers/components/google-form-trigger/actions"
import { GoogleFormTriggerDialog } from "@/triggers/components/google-form-trigger/dialog"

export const GoogleFormTrigger = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: googleFormTriggerChannel(),
    token: fetchGoogleFormTriggerRealtimeToken,
  })
  const handleOpenSettings = () => setDialogOpen(true)

  return (
    <>
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/googleform.svg"
        name="Google Form"
        description="When form is submitted"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})
