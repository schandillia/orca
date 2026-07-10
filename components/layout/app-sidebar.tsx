"use client"

import {
  IconCreditCard,
  IconFolderOpen,
  IconHistory,
  IconKey,
  IconLogout,
  IconStar,
} from "@tabler/icons-react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BRAND_NAME } from "@/config/app"
import { useAuthActions } from "@/hooks/use-auth-actions"
import { useHasActiveSubscription } from "@/hooks/use-subscription"
import { authClient } from "@/lib/auth/auth-client"

const menuItems = [
  {
    title: "Main",
    items: [
      {
        title: "Workflows",
        icon: IconFolderOpen,
        url: "/workflows",
      },
      {
        title: "Credentials",
        icon: IconKey,
        url: "/credentials",
      },
      {
        title: "Executions",
        icon: IconHistory,
        url: "/executions",
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription()
  const { handleSignOut } = useAuthActions()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="gap-x-4 h-10 px-4"
              render={<Link href="/" />}
            >
              {/* biome-ignore lint/performance/noImgElement: SVGs don't benefit from next/image */}
              <img
                src="/brand-logo.svg"
                alt=""
                aria-hidden="true"
                width={1}
                height={1}
                className="w-6 h-auto"
              />
              <span className="font-semibold text-lg tracking-tight">
                {BRAND_NAME}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={
                        item.url === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.url)
                      }
                      className="gap-x-4 h-10 px-4"
                      render={<Link href={item.url} />}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {!hasActiveSubscription && !isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Upgrade to Pro"
                className="gap-x-4 h-10 px-4"
                onClick={() => authClient.checkout({ slug: "pro" })}
              >
                <IconStar className="size-4" />
                <span>Upgrade to Pro</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billing Portal"
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.customer.portal()}
            >
              <IconCreditCard className="size-4" />
              <span>Billing Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="gap-x-4 h-10 px-4 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <IconLogout className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
