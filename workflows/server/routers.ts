import { TRPCError } from "@trpc/server"
import { and, count, desc, eq, ilike } from "drizzle-orm"
import { generateSlug } from "random-word-slugs"
import z from "zod"
import { PAGINATION } from "@/config/pagination"
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
    .mutation(async ({ ctx, input }) => {
      const [deletedWorkflow] = await db
        .delete(workflow)
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        )
        .returning()
      return deletedWorkflow
    }),
  updateName: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedWorkflow] = await db
        .update(workflow)
        .set({
          name: input.name,
        })
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        )
        .returning()
      return updatedWorkflow
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await db.query.workflow.findFirst({
        where: and(
          eq(workflow.id, input.id),
          eq(workflow.userId, ctx.auth.user.id),
        ),
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        })
      }

      return result
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input
      const where = search
        ? and(
            eq(workflow.userId, ctx.auth.user.id),
            ilike(workflow.name, `%${search}%`),
          )
        : eq(workflow.userId, ctx.auth.user.id)

      const [items, [{ count: totalCount }]] = await Promise.all([
        db.query.workflow.findMany({
          where,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          orderBy: desc(workflow.updatedAt),
        }),
        db
          .select({
            count: count(),
          })
          .from(workflow)
          .where(where),
      ])

      const totalPages = Math.ceil(totalCount / pageSize)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      }
    }),
})
