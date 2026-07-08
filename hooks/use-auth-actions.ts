"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/auth-client"

export function useAuthActions() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }

  return { handleSignOut }
}
