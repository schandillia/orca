"use client"

import { useRef, useState } from "react"
import { FaGithub, FaGoogle } from "react-icons/fa"
import { LoginFormHeader } from "@/components/auth/login-form-header"
import { type Provider, SocialLogin } from "@/components/auth/social-login"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { BRAND_NAME, DEFAULT_LOGIN_REDIRECT } from "@/config/app"
import { authClient, signIn } from "@/lib/auth/auth-client"
import { cn } from "@/lib/utils"

interface LoginFormProps extends React.ComponentProps<"div"> {
  callbackURL?: string
  onSuccess?: () => void
}

const SOCIAL_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    icon: FaGoogle,
  },
  {
    id: "github",
    label: "GitHub",
    icon: FaGithub,
  },
] as const

type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]["id"]
type LoadingAction = "magic" | SocialProvider

export function LoginForm({
  className,
  callbackURL = DEFAULT_LOGIN_REDIRECT,
  onSuccess,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loadingAction, setLoadingAction] = useState<LoadingAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)

  async function withLoading(action: LoadingAction, fn: () => Promise<void>) {
    if (isLoadingRef.current) return

    isLoadingRef.current = true
    setLoadingAction(action)
    setError(null)

    try {
      await fn()
    } finally {
      isLoadingRef.current = false
      setLoadingAction(null)
    }
  }

  function handleError(err?: { message?: string } | null) {
    setError(err?.message ?? "Something went wrong. Please try again.")
  }

  async function handleSocialLogin(provider: SocialProvider) {
    await withLoading(provider, async () => {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
      })

      if (error) handleError(error)
      else onSuccess?.()
    })
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    await withLoading("magic", async () => {
      const { error } = await signIn.magicLink({ email, callbackURL })

      if (error) handleError(error)
      else setSent(true)
    })
  }

  const socialProviders: Provider[] = SOCIAL_PROVIDERS.map(
    ({ id, label, icon: Icon }) => ({
      label,
      onClick: () => handleSocialLogin(id),
      content: (
        <LoadingSwap isLoading={loadingAction === id}>
          <Icon className="size-4" />
        </LoadingSwap>
      ),
    }),
  )

  const isDisabled = loadingAction !== null

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <span className="sr-only" aria-live="polite">
        {loadingAction ? "Signing in, please wait." : ""}
      </span>

      {sent ? (
        <div className="p-6 text-center md:p-8">
          <p>
            Check <strong>{email}</strong> for your login link.
          </p>
          <Button
            type="button"
            variant="link"
            className="mt-4 h-auto p-0"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form className="p-6 md:p-8" onSubmit={handleSubmit}>
          <FieldGroup>
            <LoginFormHeader />
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>

              <Input
                id="email"
                type="email"
                placeholder="albert@einstein.com"
                autoComplete="email"
                required
                disabled={isDisabled}
                value={email}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={isDisabled}>
                <LoadingSwap isLoading={loadingAction === "magic"}>
                  Continue
                </LoadingSwap>
              </Button>

              {error && (
                <p
                  id="login-error"
                  className="text-sm text-destructive"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}
            </Field>

            <div className="relative flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>Or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <SocialLogin providers={socialProviders} disabled={isDisabled} />
          </FieldGroup>
        </form>
      )}

      {!sent && (
        <FieldDescription className="px-6 pb-6 text-center text-xs">
          Your use of {BRAND_NAME} is subject to our{" "}
          <a href="/terms">Terms of Service</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </FieldDescription>
      )}
    </div>
  )
}
