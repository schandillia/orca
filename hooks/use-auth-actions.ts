"use client"

import { usePathname } from "next/navigation"
import { authClient } from "@/lib/auth/auth-client"
import { publicRoutes } from "@/routes"

export function useAuthActions() {
  const pathname = usePathname()

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (publicRoutes.has(pathname)) {
            window.location.href = pathname
            return
          }

          const callbackUrl = pathname + window.location.search

          window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        },
      },
    })
  }

  return { handleSignOut }
}
