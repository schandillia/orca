import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="absolute inset-x-0 top-0 z-50">
        <Navbar seeThru />
      </header>

      <main className="flex-1 text-foreground">{children}</main>

      <Footer />
    </div>
  )
}
