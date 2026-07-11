import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { requireAuth } from "@/lib/auth/auth-utils"
import { HydrateClient } from "@/trpc/server"
import {
  WorkflowsContainer,
  WorkflowsList,
} from "@/workflows/components/workflows"
import { prefetchWorkflows } from "@/workflows/server/prefetch"

export default async function Page() {
  await requireAuth()
  prefetchWorkflows()
  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <Suspense fallback={<p>Loading...</p>}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  )
}
