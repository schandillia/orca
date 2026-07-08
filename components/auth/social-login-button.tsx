"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"

export type Provider = {
  label: string
  onClick: () => void
  content: ReactNode
}

interface SocialLoginButtonProps {
  readonly providers: readonly Provider[]
  readonly disabled?: boolean
}

export function SocialLoginButton({
  providers,
  disabled = false,
}: SocialLoginButtonProps) {
  return (
    <Field className="grid grid-cols-2 gap-4">
      {providers.map(({ label, onClick, content }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={onClick}
        >
          {content}
          {label}
        </Button>
      ))}
    </Field>
  )
}
