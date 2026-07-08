import Link from "next/link"
import { UserButton } from "@/components/auth/user-button"
import type { Session } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
]

interface NavbarProps {
  session: Session | null
  seeThru?: boolean
}

export function Navbar({ session, seeThru = false }: NavbarProps) {
  return (
    <header
      className={cn(
        "top-0 z-50 w-full transition-colors",
        seeThru
          ? "fixed inset-x-0 border-transparent bg-transparent backdrop-blur-sm"
          : "sticky border-b border-border bg-background/80 backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Orca" className="flex items-center gap-2">
          {/* biome-ignore lint: Using <img> intentionally */}
          <img
            src="/brand-logo.svg"
            alt=""
            aria-hidden="true"
            width="397"
            height="397"
            className="h-7 w-auto"
          />
          <span className="font-extrabold text-2xl tracking-tight">Orca</span>
        </Link>
        <div className="flex items-center gap-6 font-bold">
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6"
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <UserButton session={session} />
          {/* <>
            {session && <NotificationBell />}
            <UserButton session={session} />
          </> */}
        </div>
      </div>
    </header>
  )
}
