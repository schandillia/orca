import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ExecutionView } from "@/executions/components/execution"
import {
  ExecutionsError,
  ExecutionsLoading,
} from "@/executions/components/executions"
import { prefetchExecution } from "@/executions/server/prefetch"
import { requireAuth } from "@/lib/auth/auth-utils"
import { HydrateClient } from "@/trpc/server"

interface PageProps {
  params: Promise<{
    executionId: string
  }>
}

export default async function Page({ params }: PageProps) {
  await requireAuth()
  const { executionId } = await params

  prefetchExecution(executionId)

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-xl w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  )
}
