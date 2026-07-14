import { IconPointer } from "@tabler/icons-react"
import type { NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseTriggerNode } from "@/triggers/components/base-trigger-node"
import { ManualTriggerDialog } from "@/triggers/components/manual-trigger/dialog"

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const nodeStatus = "initial"
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
