import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function getInitials(
  name: string | null | undefined,
  email: string
): string {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

// Extend the default Avatar props so it accepts standard attributes
interface UserAvatarProps extends React.ComponentPropsWithoutRef<
  typeof Avatar
> {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export const UserAvatar = React.forwardRef<
  React.ComponentRef<typeof Avatar>,
  UserAvatarProps
>(({ user, className, ...props }, ref) => {
  const email = user.email || ""

  return (
    <Avatar ref={ref} className={cn("size-8", className)} {...props}>
      <AvatarImage src={user.image ?? undefined} alt={user.name || email} />
      <AvatarFallback className="text-xs">
        {getInitials(user.name, email)}
      </AvatarFallback>
    </Avatar>
  )
})

// Always add a displayName when using forwardRef for better debugging
UserAvatar.displayName = "UserAvatar"
