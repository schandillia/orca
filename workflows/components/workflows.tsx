"use client"

import { useRouter } from "next/navigation"
import {
  EntityContainer,
  EntityHeader,
  EntityPagination,
  EntitySearch,
} from "@/components/entity-components"
import { useEntitySearch } from "@/hooks/use-entity-search"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { useWorkflowsParams } from "@/hooks/use-workflows-params"
import {
  useCreateWorkflow,
  useSuspenseWorkflows,
} from "@/workflows/hooks/use-workflows"

export function WorkflowsSearch() {
  const [params, setParams] = useWorkflowsParams()
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  })
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  )
}

export function WorkflowsList() {
  const { data } = useSuspenseWorkflows()
  return (
    <div className="flex flex-1 justify-center items-center">
      <p>{JSON.stringify(data, null, 2)}</p>
    </div>
  )
}

export function WorkflowsHeader({ disabled }: { disabled?: boolean }) {
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

export function WorkflowsPagination() {
  const workflows = useSuspenseWorkflows()
  const [params, setParams] = useWorkflowsParams()

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
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
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  )
}
