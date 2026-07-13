"use client"

import { IconPlus } from "@tabler/icons-react"
import type { NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { NodeSelector } from "@/components/node-selector"
import { PlaceholderNode } from "@/components/react-flow/placeholder-node"
import { WorkflowNode } from "@/components/workflow-node"

export const InitialNode = memo((props: NodeProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false)
  return (
    <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
      <WorkflowNode showToolbar={false}>
        <PlaceholderNode {...props} onClick={() => setSelectorOpen(true)}>
          <div className="flex cursor-pointer items-center justify-center">
            <IconPlus className="size-4" />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  )
})

InitialNode.displayName = "Initial Node"
