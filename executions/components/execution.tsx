"use client"

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconLoader2,
  IconX,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ExecutionStatus } from "@/db/schemas/workflow-schema"
import { useSuspenseExecution } from "@/executions/hooks/use-executions"
import { cn } from "@/lib/utils"

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <IconCircleCheck className="size-5 text-green-600" />
    case ExecutionStatus.COMPLETED_WITH_ERRORS:
      return <IconAlertTriangle className="size-5 text-yellow-600" />
    case ExecutionStatus.FAILED:
      return <IconX className="size-5 text-red-600" />
    case ExecutionStatus.RUNNING:
      return <IconLoader2 className="size-5 animate-spin text-blue-600" />
    default:
      return <IconAlertTriangle className="size-5 text-muted-foreground" />
  }
}

const formatStatus = (status: ExecutionStatus, failedNodeCount = 0) => {
  switch (status) {
    case ExecutionStatus.COMPLETED_WITH_ERRORS:
      return `Completed with errors (${failedNodeCount} failed node${
        failedNodeCount === 1 ? "" : "s"
      })`
    default:
      return status.charAt(0) + status.slice(1).toLowerCase()
  }
}

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId)
  const [showStackTrace, setShowStackTrace] = useState(false)
  const [expandedNodeStacks, setExpandedNodeStacks] = useState<
    Record<string, boolean>
  >({})

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000,
      )
    : null
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>
              {formatStatus(
                execution.status,
                execution.nodeErrors?.length ?? 0,
              )}
            </CardTitle>
            <CardDescription>
              Execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              className="text-sm hover:underline text-primary"
              href={`/workflows/${execution.workflowId}`}
            >
              {execution.workflow.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">
              {formatStatus(
                execution.status,
                execution.nodeErrors?.length ?? 0,
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Started</p>
            <p className="text-sm">
              {formatDistanceToNow(execution.startedAt, {
                addSuffix: true,
              })}
            </p>
          </div>
          {execution.completedAt ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">
                {formatDistanceToNow(execution.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : null}
          {duration !== null ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">{duration}s</p>
            </div>
          ) : null}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Event ID
            </p>
            <p className="text-sm">{execution.inngestEventId}</p>
          </div>
        </div>
        {execution.nodeErrors &&
          Array.isArray(execution.nodeErrors) &&
          execution.nodeErrors.length > 0 && (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-red-900">Failed nodes</p>
              </div>

              {execution.nodeErrors.map((error) => (
                <div
                  key={error.nodeId}
                  className="rounded-3xl border border-red-200 bg-red-100 p-3"
                >
                  <p className="text-sm font-medium text-red-900">
                    {error.nodeName}
                    {error.variableName ? (
                      <span className="font-normal text-red-700">
                        {" "}
                        ({error.variableName})
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 font-mono text-sm wrap-anywhere text-red-800">
                    {error.message}
                  </p>
                  {error.stack && (
                    <Collapsible
                      open={expandedNodeStacks[error.nodeId] ?? false}
                      onOpenChange={(open) =>
                        setExpandedNodeStacks((prev) => ({
                          ...prev,
                          [error.nodeId]: open,
                        }))
                      }
                    >
                      <CollapsibleTrigger
                        className={cn(
                          buttonVariants({
                            variant: "destructive",
                            size: "sm",
                          }),
                          "mt-3",
                        )}
                      >
                        {expandedNodeStacks[error.nodeId]
                          ? "Hide stack trace"
                          : "Show stack trace"}
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <pre className="mt-2 overflow-auto rounded-3xl bg-red-200 p-2 font-mono text-xs text-red-900">
                          {error.stack}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              ))}
            </div>
          )}
        {execution.error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-red-900 mb-2">Error</p>
              <p className="text-sm text-red-800 font-mono">
                {execution.error}
              </p>
            </div>
            {execution.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger className="inline-flex h-9 items-center justify-center rounded-3xl px-3 text-sm font-medium text-red-900 hover:bg-red-100">
                  {showStackTrace ? "Hide stack trace" : "Show stack trace"}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-xs font-mono text-red-800 overflow-auto mt-2 p-2 bg-red-100 rounded">
                    {execution.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
        {execution.output != null &&
          typeof execution.output === "object" &&
          Object.keys(execution.output).length > 0 && (
            <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-4 space-y-3">
              <p className="text-sm font-medium text-green-900">Outputs</p>

              {execution.output.map((nodeOutput) => (
                <div
                  key={nodeOutput.nodeId}
                  className="rounded-3xl border border-green-200 bg-green-100 p-3"
                >
                  <p className="text-sm font-medium text-green-900">
                    {nodeOutput.nodeName}
                    {nodeOutput.variableName ? (
                      <span className="font-normal text-green-700">
                        {" "}
                        ({nodeOutput.variableName})
                      </span>
                    ) : null}
                  </p>

                  <p className="mt-1 font-mono text-sm whitespace-pre-wrap wrap-anywhere text-green-800">
                    {JSON.stringify(nodeOutput.output, null, 2)}
                  </p>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  )
}
