import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Editor, EditorError, EditorLoading } from "@/editor/components/editor"
import EditorHeader from "@/editor/components/editor-header"
import { requireAuth } from "@/lib/auth/auth-utils"
import { HydrateClient } from "@/trpc/server"
import { prefetchWorkflow } from "@/workflows/server/prefetch"

interface PageProps {
  params: Promise<{
    workflowId: string
  }>
}

export default async function Page({ params }: PageProps) {
  await requireAuth()
  const { workflowId } = await params
  prefetchWorkflow(workflowId)

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <EditorHeader workflowId={workflowId} />
          <main className="flex-1">
            <Editor workflowId={workflowId} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}
