"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"

export type Provider = {
  label: string
  onClick: () => void
  content: ReactNode
}

interface SocialLoginProps {
  readonly providers: readonly Provider[]
  readonly disabled?: boolean
}

export function SocialLogin({ providers, disabled = false }: SocialLoginProps) {
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
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </Field>
  )
}
