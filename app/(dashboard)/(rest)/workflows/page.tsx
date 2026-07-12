import type { SearchParams } from "nuqs/server"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { requireAuth } from "@/lib/auth/auth-utils"
import { HydrateClient } from "@/trpc/server"
import {
  WorkflowsContainer,
  WorkflowsList,
} from "@/workflows/components/workflows"
import { workflowsParamsLoader } from "@/workflows/server/params-loader"
import { prefetchWorkflows } from "@/workflows/server/prefetch"

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: Props) {
  await requireAuth()
  const params = await workflowsParamsLoader(searchParams)
  prefetchWorkflows(params)
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
