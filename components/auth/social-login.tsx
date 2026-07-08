"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"

type Provider = {
  label: string
  onClick: () => void
  content: ReactNode
}

interface SocialLoginProps {
  providers: Provider[]
  disabled?: boolean
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
