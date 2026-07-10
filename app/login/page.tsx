import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"
import { DEFAULT_LOGIN_REDIRECT } from "@/config/app"
import { requireUnauth } from "@/lib/auth/auth-utils"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  await requireUnauth()

  const params = await searchParams
  const rawCallbackUrl = params?.callbackUrl

  const callbackURL = rawCallbackUrl?.startsWith("/")
    ? rawCallbackUrl
    : DEFAULT_LOGIN_REDIRECT

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* image column — hidden on mobile, visible on md+ */}
            <div className="relative hidden min-h-87.5 bg-muted md:block">
              {/* biome-ignore lint/performance/noImgElement: Using a static SVG is intentional */}
              <img
                src="/login-image.svg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <LoginForm callbackURL={callbackURL} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
