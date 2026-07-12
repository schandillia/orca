import { initTRPC, TRPCError } from "@trpc/server"
import { headers } from "next/headers"
import superjson from "superjson"
import { auth } from "@/lib/auth/auth"
import { polarClient } from "@/lib/polar"

export const createTRPCContext = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return {
    session,
  }
}

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
  })

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const baseProcedure = t.procedure

export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    })
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.session,
    },
  })
})

export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    })
    if (
      !customer.activeSubscriptions ||
      customer.activeSubscriptions.length === 0
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Active subscription required",
      })
    }
    return next({ ctx: { ...ctx, customer } })
  },
)
