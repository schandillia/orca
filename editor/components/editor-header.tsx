"use client"

import { IconDeviceFloppy } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  useSuspenseWorkflow,
  useUpdateWorkflowName,
} from "@/workflows/hooks/use-workflows"

interface EditorHeaderProps {
  workflowId: string
}

export function EditorSaveButton({ workflowId }: EditorHeaderProps) {
  return (
    <div className="ml-auto">
      <Button size="sm" onClick={() => {}} disabled={false}>
        <IconDeviceFloppy className="size-4" />
        Save
      </Button>
    </div>
  )
}

export function EditorNameInput({ workflowId }: EditorHeaderProps) {
  const { data: workflow } = useSuspenseWorkflow(workflowId)
  const updateWorkflow = useUpdateWorkflowName()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(workflow.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name)
    }
  }, [workflow.name])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (name === workflow.name) {
      setIsEditing(false)
      return
    }
    try {
      await updateWorkflow.mutateAsync({
        id: workflowId,
        name,
      })
    } catch {
      setName(workflow.name)
    } finally {
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setName(workflow.name)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        disabled={updateWorkflow.isPending}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-25 px-2"
      />
    )
  }

  return (
    <BreadcrumbItem
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:text-foreground transition-colors"
    >
      {workflow.name}
    </BreadcrumbItem>
  )
}

export function EditorBreadcrumbs({ workflowId }: EditorHeaderProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/workflows">Workflows</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function EditorHeader({ workflowId }: EditorHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <EditorBreadcrumbs workflowId={workflowId} />
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  )
}
