"use client"

import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { GoWorkflow } from "react-icons/go"
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components"
import type { Workflow } from "@/db/schemas/workflow-schema"
import { useEntitySearch } from "@/hooks/use-entity-search"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "@/workflows/hooks/use-workflows"
import { useWorkflowsParams } from "@/workflows/hooks/use-workflows-params"

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
  const workflows = useSuspenseWorkflows()

  return (
    <div className="flex flex-1 flex-col">
      <EntityList
        items={workflows.data.items}
        getKey={(workflow) => workflow.id}
        renderItem={(workflow) => <WorkflowItem data={workflow} />}
        emptyView={<WorkflowsNotFound />}
      />

      {workflows.data.totalPages > 1 && (
        <WorkflowsPagination
          page={workflows.data.page}
          totalPages={workflows.data.totalPages}
          isFetching={workflows.isFetching}
        />
      )}
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

interface WorkflowsPaginationProps {
  page: number
  totalPages: number
  isFetching: boolean
}

export function WorkflowsPagination({
  page,
  totalPages,
  isFetching,
}: WorkflowsPaginationProps) {
  const [params, setParams] = useWorkflowsParams()

  return (
    <EntityPagination
      disabled={isFetching}
      totalPages={totalPages}
      page={page}
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
    <EntityContainer header={<WorkflowsHeader />} search={<WorkflowsSearch />}>
      {children}
    </EntityContainer>
  )
}

export function WorkflowsLoading() {
  return <LoadingView message="Loading workflows..." />
}

export function WorkflowsError() {
  return <ErrorView message="Error loading workflows" />
}

export function WorkflowsNotFound() {
  const router = useRouter()
  const createWorkflow = useCreateWorkflow()
  const { handleError, modal } = useUpgradeModal()
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error)
      },
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`)
      },
    })
  }
  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        isCreating={createWorkflow.isPending}
        message="No workflows found. Create a new one?"
      />
    </>
  )
}

export function WorkflowItem({ data }: { data: Workflow }) {
  const removeWorkflow = useRemoveWorkflow()
  const handleRemove = () => {
    removeWorkflow.mutate({ id: data.id })
  }
  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <GoWorkflow className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  )
}
