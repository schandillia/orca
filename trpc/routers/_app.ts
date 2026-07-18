import { credentialsRouter } from "@/credentials/server/routers"
import { executionsRouter } from "@/executions/server/routers"
import { createTRPCRouter } from "@/trpc/init"
import { workflowsRouter } from "@/workflows/server/routers"

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
})

export type AppRouter = typeof appRouter
