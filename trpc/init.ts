import { initTRPC, TRPCError } from "@trpc/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"

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
  .create()

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
