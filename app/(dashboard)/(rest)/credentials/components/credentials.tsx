"use client"

import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "@/credentials/hooks/use-credentials"
import { useCredentialsParams } from "@/credentials/hooks/use-credentials-params"
import type { Credential } from "@/db/schemas/workflow-schema"
import { CredentialType } from "@/db/schemas/workflow-schema"
import { useEntitySearch } from "@/hooks/use-entity-search"

export function CredentialsSearch() {
  const [params, setParams] = useCredentialsParams()
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  })
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  )
}

export function CredentialsList() {
  const credentials = useSuspenseCredentials()

  return (
    <div className="flex flex-1 flex-col">
      <EntityList
        items={credentials.data.items}
        getKey={(credential) => credential.id}
        renderItem={(credential) => <CredentialItem data={credential} />}
        emptyView={<CredentialsNotFound />}
      />

      {credentials.data.totalPages > 1 && (
        <CredentialsPagination
          page={credentials.data.page}
          totalPages={credentials.data.totalPages}
          isFetching={credentials.isFetching}
        />
      )}
    </div>
  )
}

export function CredentialsHeader({ disabled }: { disabled?: boolean }) {
  return (
    <EntityHeader
      title="credentials"
      description="Create and manage credentials"
      newButtonLabel="New Credential"
      newButtonHref="/credentials/new"
      disabled={disabled}
    />
  )
}

interface CredentialsPaginationProps {
  page: number
  totalPages: number
  isFetching: boolean
}

export function CredentialsPagination({
  page,
  totalPages,
  isFetching,
}: CredentialsPaginationProps) {
  const [params, setParams] = useCredentialsParams()

  return (
    <EntityPagination
      disabled={isFetching}
      totalPages={totalPages}
      page={page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  )
}

export function CredentialsContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
    >
      {children}
    </EntityContainer>
  )
}

export function CredentialsLoading() {
  return <LoadingView message="Loading credentials..." />
}

export function CredentialsError() {
  return <ErrorView message="Error loading credentials" />
}

export function CredentialsNotFound() {
  const router = useRouter()
  const handleCreate = () => {
    router.push("/credentials/new")
  }
  return (
    <EmptyView
      onNew={handleCreate}
      message="No credentials found. Create a new one?"
    />
  )
}

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logos/openai.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
  [CredentialType.GEMINI]: "/logos/gemini.svg",
}

export function CredentialItem({ data }: { data: Credential }) {
  const removeCredential = useRemoveCredential()
  const handleRemove = () => {
    removeCredential.mutate({ id: data.id })
  }
  const logo = credentialLogos[data.type] || "/logos/openai.svg"
  return (
    <EntityItem
      href={`/credentials/${data.id}`}
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
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  )
}
