import { requireAuth } from "@/lib/auth/auth-utils"

export default async function Page() {
  await requireAuth()
  return <div>credentials page</div>
}
