import Link from "next/link"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "flex h-full flex-col items-center justify-center",
        "gap-8 px-6 pt-14 text-center",
        "mx-auto max-w-4xl",
      )}
    >
      {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID is intentional in this Server Component */}
      <h1
        id="hero-heading"
        className={cn(
          "text-5xl md:text-7xl",
          "font-bold tracking-tight leading-tight",
          "text-silver",
        )}
      >
        Your SaaS, ready to ship
      </h1>
      <p
        className={cn(
          "max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground",
        )}
      >
        Orca gives you authentication, billing, and the rest of the plumbing
        already wired together, so you can build the part that matters.
      </p>
      <div className={cn("flex flex-col items-center gap-3", "sm:flex-row")}>
        <Link
          href="/login"
          className={cn(
            "inline-flex items-center gap-2",
            "rounded-lg bg-primary text-primary-foreground",
            "px-6 py-3 font-semibold",
            "transition-opacity hover:opacity-90",
          )}
        >
          Get started free
        </Link>

        <Link
          href="/pricing"
          className={cn(
            "inline-flex items-center gap-2",
            "rounded-lg border border-border bg-background",
            "px-6 py-3 font-semibold text-foreground",
            "transition-colors hover:bg-muted",
          )}
        >
          View pricing
        </Link>
      </div>
    </section>
  )
}
