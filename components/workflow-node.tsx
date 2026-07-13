"use client"

import { IconSettings, IconTrash } from "@tabler/icons-react"
import { NodeToolbar, Position } from "@xyflow/react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface WorkflowNodeProps {
  children: ReactNode
  showToolbar?: boolean
  onDelete?: () => void
  onSettings?: () => void
  name?: string
  description?: string
}

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size="sm" variant="ghost" onClick={onSettings}>
            <IconSettings className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <IconTrash className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-50 text-center"
        >
          <p className="font-medium">{name}</p>
          {description && (
            <p className="text-muted-foreground text-sm truncate">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}{" "}
    </>
  )
}
