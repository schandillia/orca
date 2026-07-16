import { credentialsRouter } from "@/credentials/server/routers"
import { createTRPCRouter } from "@/trpc/init"
import { workflowsRouter } from "@/workflows/server/routers"

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
})

export type AppRouter = typeof appRouter
