import { and, eq } from "drizzle-orm"
import { generateSlug } from "random-word-slugs"
import z from "zod"
import { db } from "@/db/drizzle"
import { workflow } from "@/db/schemas/workflow-schema"
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init"

export const workflowsRouter = createTRPCRouter({
  create: premiumProcedure.mutation(async ({ ctx }) => {
    const [newWorkflow] = await db
      .insert(workflow)
      .values({
        id: crypto.randomUUID(),
        name: generateSlug(3),
        userId: ctx.auth.user.id,
      })
      .returning()

    return newWorkflow
  }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return db
        .delete(workflow)
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        )
        .returning()
    }),
  updateName: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return db
        .update(workflow)
        .set({
          name: input.name,
        })
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        )
        .returning()
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(({ ctx, input }) => {
      return db.query.workflow.findFirst({
        where: and(
          eq(workflow.id, input.id),
          eq(workflow.userId, ctx.auth.user.id),
        ),
      })
    }),
  getMany: protectedProcedure.query(({ ctx }) => {
    return db.query.workflow.findMany({
      where: eq(workflow.userId, ctx.auth.user.id),
    })
  }),
})
