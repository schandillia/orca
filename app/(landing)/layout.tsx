import { LoginModalProvider } from "@/components/auth/login-modal-provider"
import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { getServerSession } from "@/lib/auth/get-server-session"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <LoginModalProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="absolute inset-x-0 top-0 z-50">
          <Navbar session={session} seeThru />
        </header>

        <main className="flex-1 text-foreground">{children}</main>

        <Footer />
      </div>
    </LoginModalProvider>
  )
}
