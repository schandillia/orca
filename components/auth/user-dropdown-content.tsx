"use client"

import {
  IconAdjustmentsHorizontal,
  IconCode,
  IconLayoutDashboard,
  IconLogout,
  IconSettings,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserInfo } from "@/components/auth/user-info"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// import type { Role } from "@/db/types/roles"
// import { isAdmin } from "@/lib/auth/permissions"

interface UserDropdownContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
    tier?: string | null
  }
  onSignOut: () => void
  variant?: "navbar" | "sidebar"
}

const menuItems = [
  { href: "/profile", label: "Profile", icon: IconUser },
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  {
    href: "/preferences",
    label: "Preferences",
    icon: IconAdjustmentsHorizontal,
  },
  { href: "/settings", label: "Settings", icon: IconSettings },
  { href: "/security", label: "Security", icon: IconShieldLock },
  { href: "/developer", label: "Developer", icon: IconCode },
]

const baseItemClass = "cursor-pointer py-1"

export function UserDropdownContent({
  user,
  onSignOut,
  variant = "navbar",
}: UserDropdownContentProps) {
  const isSidebar = variant === "sidebar"

  const align = isSidebar ? "start" : "end"
  const side = isSidebar ? "top" : "bottom"

  const pathname = usePathname()
  const filteredItems = menuItems.filter(
    (item) => !pathname.startsWith(item.href),
  )

  return (
    <DropdownMenuContent align={align} side={side} className="w-48 space-y-2">
      {/* Show only in navbar */}
      {!isSidebar && (
        <>
          <div className="px-2 py-1.5 flex flex-col gap-1.5">
            <UserInfo user={user} />
          </div>
          <DropdownMenuSeparator />
        </>
      )}

      {filteredItems.map((item) => {
        const Icon = item.icon
        return (
          <DropdownMenuItem
            key={item.href}
            render={<Link href={item.href} />}
            className={cn("flex items-center gap-2", baseItemClass)}
          >
            <Icon aria-hidden="true" className="size-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        )
      })}

      {/* {isAdmin(user.role as Role) && !pathname.startsWith("/admin") && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className={baseItemClass}>
            <Link href="/admin" className="flex items-center gap-2">
              <ShieldIcon aria-hidden="true" className="size-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        </>
      )} */}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className={`${baseItemClass} text-destructive focus:text-destructive flex items-center gap-2`}
        onClick={onSignOut}
      >
        <IconLogout aria-hidden="true" className="size-4" />
        <span>Sign out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
