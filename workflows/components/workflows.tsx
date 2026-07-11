"use client"

import { useRouter } from "next/navigation"
import { EntityContainer, EntityHeader } from "@/components/entity-components"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import {
  useCreateWorkflow,
  useSuspenseWorkflows,
} from "@/workflows/hooks/use-workflows"

export const WorkflowsList = () => {
  const { data } = useSuspenseWorkflows()
  return (
    <div className="flex flex-1 justify-center items-center">
      <p>{JSON.stringify(data, null, 2)}</p>
    </div>
  )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow()
  const router = useRouter()
  const { handleError, modal } = useUpgradeModal()
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`)
      },
      onError: (error) => {
        handleError(error)
      },
    })
  }

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  )
}

export function WorkflowsContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  )
}
