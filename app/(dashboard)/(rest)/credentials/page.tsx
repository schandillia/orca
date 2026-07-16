import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import {
  CredentialsContainer,
  CredentialsError,
  CredentialsList,
  CredentialsLoading,
} from "@/app/(dashboard)/(rest)/credentials/components/credentials"
import { credentialsParamsLoader } from "@/credentials/server/params-loader"
import { prefetchCredentials } from "@/credentials/server/prefetch"
import { requireAuth } from "@/lib/auth/auth-utils"
import { HydrateClient } from "@/trpc/server"

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: Props) {
  await requireAuth()
  const params = await credentialsParamsLoader(searchParams)
  prefetchCredentials(params)
  return (
    <CredentialsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<CredentialsError />}>
          <Suspense fallback={<CredentialsLoading />}>
            <CredentialsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </CredentialsContainer>
  )
}
