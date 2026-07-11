import { createTRPCRouter } from "@/trpc/init"
import { workflowsRouter } from "@/workflows/server/routers"

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
})

export type AppRouter = typeof appRouter
