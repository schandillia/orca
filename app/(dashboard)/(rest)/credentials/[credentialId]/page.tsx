import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { CredentialView } from "@/app/(dashboard)/(rest)/credentials/components/credential"
import {
  CredentialsError,
  CredentialsLoading,
} from "@/app/(dashboard)/(rest)/credentials/components/credentials"
import { prefetchCredential } from "@/credentials/server/prefetch"
import { requireAuth } from "@/lib/auth/auth-utils"
import { HydrateClient } from "@/trpc/server"

interface PageProps {
  params: Promise<{
    credentialId: string
  }>
}

export default async function Page({ params }: PageProps) {
  await requireAuth()
  const { credentialId } = await params
  prefetchCredential(credentialId)

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-xl w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<CredentialsError />}>
            <Suspense fallback={<CredentialsLoading />}>
              <CredentialView credentialId={credentialId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  )
}
