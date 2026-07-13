"use client"

import { IconPlus } from "@tabler/icons-react"
import type { NodeProps } from "@xyflow/react"
import { memo } from "react"
import { PlaceholderNode } from "@/components/react-flow/placeholder-node"
import { WorkflowNode } from "@/components/workflow-node"

export const InitialNode = memo((props: NodeProps) => {
  return (
    <WorkflowNode showToolbar={false}>
      <PlaceholderNode {...props} onClick={() => {}}>
        <div className="flex cursor-pointer items-center justify-center">
          <IconPlus className="size-4" />
        </div>
      </PlaceholderNode>
    </WorkflowNode>
  )
})

InitialNode.displayName = "Initial Node"
