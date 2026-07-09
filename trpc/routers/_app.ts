import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { db } from "@/db/drizzle"
import { inngest } from "@/inngest/client"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const appRouter = createTRPCRouter({
  testAI: protectedProcedure.mutation(async () => {
    await inngest.send({ name: "execute/ai" })
    return { success: true, message: "Job queued" }
  }),
  getWorkflows: protectedProcedure.query(async () => {
    return await db.query.workflow.findMany()
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "amit@schandillia.com",
      },
    })
    return { success: true, message: "Job queued" }
  }),
})

export type AppRouter = typeof appRouter
