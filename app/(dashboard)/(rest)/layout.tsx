import AppHeader from "@/components/layout/app-header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  )
}
