import { IconPointer } from "@tabler/icons-react"
import type { NodeProps } from "@xyflow/react"
import { memo } from "react"
import { BaseTriggerNode } from "@/triggers/components/base-trigger-node"

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={IconPointer}
        name="When clicking ‘Execute workflow’"
        // status={nodeStatus}
      />
    </>
  )
})
