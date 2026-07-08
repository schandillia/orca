import { DEFAULT_USER_NAME } from "@/config/app"
import { cn } from "@/lib/utils"

interface UserInfoProps {
  user: {
    name?: string | null
    email?: string | null
  }
  showEmail?: boolean
  className?: string
}

export function UserInfo({ user, showEmail = true, className }: UserInfoProps) {
  return (
    <div className={cn("flex flex-col min-w-0 leading-tight", className)}>
      <span className="text-sm font-medium truncate">
        {user.name || DEFAULT_USER_NAME}
      </span>
      {showEmail && (
        <span className="text-xs text-muted-foreground truncate">
          {user.email}
        </span>
      )}
    </div>
  )
}
