import { IconPointer } from "@tabler/icons-react"
import type { NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { useNodeStatus } from "@/executions/hooks/use-node-status"
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger"
import { BaseTriggerNode } from "@/triggers/components/base-trigger-node"
import { fetchManualTriggerRealtimeToken } from "@/triggers/components/manual-trigger/actions"
import { ManualTriggerDialog } from "@/triggers/components/manual-trigger/dialog"

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: manualTriggerChannel(),
    token: fetchManualTriggerRealtimeToken,
  })
  const handleOpenSettings = () => setDialogOpen(true)

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={IconPointer}
        name="When clicking ‘Execute workflow’"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})
