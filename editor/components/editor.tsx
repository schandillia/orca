"use client"

import { ErrorView, LoadingView } from "@/components/entity-components"
import { useSuspenseWorkflow } from "@/workflows/hooks/use-workflows"

export function EditorLoading() {
  return <LoadingView message="Loading editor..." />
}

export function EditorError() {
  return <ErrorView message="Error loading editor" />
}

interface EditorProps {
  workflowId: string
}

export function Editor({ workflowId }: EditorProps) {
  const { data: workflow } = useSuspenseWorkflow(workflowId)

  return <p>{JSON.stringify(workflow, null, 2)}</p>
}
