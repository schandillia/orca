"use client"

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconLoader,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components"
import type { Execution } from "@/db/schemas/workflow-schema"
import { ExecutionStatus } from "@/db/schemas/workflow-schema"
import { useSuspenseExecutions } from "@/executions/hooks/use-executions"
import { useExecutionsParams } from "@/executions/hooks/use-executions-params"

export function ExecutionsList() {
  const executions = useSuspenseExecutions()

  return (
    <div className="flex flex-1 flex-col">
      <EntityList
        items={executions.data.items}
        getKey={(item) => item.execution.id}
        renderItem={(item) => (
          <ExecutionItem
            data={{
              ...item.execution,
              workflow: item.workflow,
            }}
          />
        )}
        emptyView={<ExecutionsNotFound />}
      />

      {executions.data.totalPages > 1 && (
        <ExecutionsPagination
          page={executions.data.page}
          totalPages={executions.data.totalPages}
          isFetching={executions.isFetching}
        />
      )}
    </div>
  )
}

export function ExecutionsHeader() {
  return (
    <EntityHeader title="Executions" description="View your workflow history" />
  )
}

interface ExecutionsPaginationProps {
  page: number
  totalPages: number
  isFetching: boolean
}

export function ExecutionsPagination({
  page,
  totalPages,
  isFetching,
}: ExecutionsPaginationProps) {
  const [params, setParams] = useExecutionsParams()

  return (
    <EntityPagination
      disabled={isFetching}
      totalPages={totalPages}
      page={page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  )
}

export function ExecutionsContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EntityContainer header={<ExecutionsHeader />}>{children}</EntityContainer>
  )
}

export function ExecutionsLoading() {
  return <LoadingView message="Loading executions..." />
}

export function ExecutionsError() {
  return <ErrorView message="Error loading executions" />
}

export function ExecutionsNotFound() {
  return <EmptyView message="No executions found. Create a new one?" />
}

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <IconCircleCheck className="size-5 text-green-600" />
    case ExecutionStatus.COMPLETED_WITH_ERRORS:
      return <IconAlertTriangle className="size-5 text-yellow-600" />
    case ExecutionStatus.FAILED:
      return <IconCircleX className="size-5 text-red-600" />
    case ExecutionStatus.RUNNING:
      return <IconLoader className="size-5 animate-spin text-blue-600" />
    default:
      return <IconAlertTriangle className="size-5 text-muted-foreground" />
  }
}

const formatStatus = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.COMPLETED_WITH_ERRORS:
      return "Completed with errors"
    default:
      return status.charAt(0) + status.slice(1).toLowerCase()
  }
}

export function ExecutionItem({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string
      name: string
    }
  }
}) {
  const duration = data.completedAt
    ? Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.startedAt).getTime()) /
          1000,
      )
    : null

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt, { addSuffix: true })}
      {duration !== null && <> &bull; Took {duration}s </>}
    </>
  )
  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
    />
  )
}
