import { TRPCError } from "@trpc/server"
import type { Edge, Node } from "@xyflow/react"
import { and, count, desc, eq, ilike } from "drizzle-orm"
import { generateSlug } from "random-word-slugs"
import z from "zod"
import { PAGINATION } from "@/config/pagination"
import { db } from "@/db/drizzle"
import { NodeType, node, workflow } from "@/db/schemas/workflow-schema"
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init"

export const workflowsRouter = createTRPCRouter({
  create: premiumProcedure.mutation(async ({ ctx }) => {
    return db.transaction(async (tx) => {
      const workflowId = crypto.randomUUID()

      const [newWorkflow] = await tx
        .insert(workflow)
        .values({
          id: workflowId,
          name: generateSlug(3),
          userId: ctx.auth.user.id,
        })
        .returning()

      await tx.insert(node).values({
        id: crypto.randomUUID(),
        workflowId,
        type: NodeType.INITIAL,
        position: { x: 0, y: 0 },
        name: NodeType.INITIAL,
      })

      return newWorkflow
    })
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
        with: {
          nodes: true,
          connections: true,
        },
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        })
      }

      const nodes: Node[] = result.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }))
      const edges: Edge[] = result.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }))

      return {
        id: result.id,
        name: result.name,
        nodes,
        edges,
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
