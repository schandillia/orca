import { db } from "@/db/drizzle"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const appRouter = createTRPCRouter({
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.account.findMany({
      where: (account, { eq }) => eq(account.userId, ctx.auth.user.id),
    })
  }),
})

export type AppRouter = typeof appRouter
