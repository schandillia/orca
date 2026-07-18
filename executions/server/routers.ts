import { TRPCError } from "@trpc/server"
import { and, count, desc, eq } from "drizzle-orm"
import z from "zod"
import { PAGINATION } from "@/config/pagination"
import { db } from "@/db/drizzle"
import { execution, workflow } from "@/db/schemas/workflow-schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const executionsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [result] = await db
        .select({
          execution,
          workflow: {
            id: workflow.id,
            name: workflow.name,
          },
        })
        .from(execution)
        .innerJoin(workflow, eq(execution.workflowId, workflow.id))
        .where(
          and(
            eq(execution.id, input.id),
            eq(workflow.userId, ctx.auth.user.id),
          ),
        )

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Execution not found",
        })
      }

      return {
        ...result.execution,
        workflow: result.workflow,
      }
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input
      const [items, [{ count: totalCount }]] = await Promise.all([
        db
          .select({
            execution,
            workflow: {
              id: workflow.id,
              name: workflow.name,
            },
          })
          .from(execution)
          .innerJoin(workflow, eq(execution.workflowId, workflow.id))
          .where(eq(workflow.userId, ctx.auth.user.id))
          .orderBy(desc(execution.startedAt))
          .limit(pageSize)
          .offset((page - 1) * pageSize),

        db
          .select({
            count: count(),
          })
          .from(execution)
          .innerJoin(workflow, eq(execution.workflowId, workflow.id))
          .where(eq(workflow.userId, ctx.auth.user.id)),
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
