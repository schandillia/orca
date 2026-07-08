"use client"

import { useLoginModal } from "@/components/auth/login-modal-provider"
import { UserAvatar } from "@/components/auth/user-avatar"
import { UserDropdownContent } from "@/components/auth/user-dropdown-content"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthActions } from "@/hooks/use-auth-actions"
import type { Session } from "@/lib/auth/auth"

interface UserButtonProps {
  session: Session | null
}

export function UserButton({ session }: UserButtonProps) {
  const { openModal } = useLoginModal()
  const { handleSignOut } = useAuthActions()

  const user = session?.user

  if (!user) {
    return <Button onClick={openModal}>Log in</Button>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all"
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <UserDropdownContent
        user={user}
        onSignOut={handleSignOut}
        variant="navbar"
      />
    </DropdownMenu>
  )
}
