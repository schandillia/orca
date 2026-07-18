import { TRPCError } from "@trpc/server"
import { and, count, desc, eq, ilike } from "drizzle-orm"
import z from "zod"
import { PAGINATION } from "@/config/pagination"
import { db } from "@/db/drizzle"
import { CredentialType, credential } from "@/db/schemas/workflow-schema"
import { encrypt } from "@/lib/encryption"
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init"

export const credentialsRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, value, type } = input
      const [newCredential] = await db
        .insert(credential)
        .values({
          id: crypto.randomUUID(),
          name,
          value: encrypt(value),
          type,
          userId: ctx.auth.user.id,
        })
        .returning()

      return newCredential
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [deletedCredential] = await db
        .delete(credential)
        .where(
          and(
            eq(credential.id, input.id),
            eq(credential.userId, ctx.auth.user.id),
          ),
        )
        .returning()
      return deletedCredential
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, value } = input
      const existingCredential = await db.query.credential.findFirst({
        where: and(
          eq(credential.id, id),
          eq(credential.userId, ctx.auth.user.id),
        ),
      })
      if (!existingCredential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credential not found",
        })
      }
      const [updatedCredential] = await db
        .update(credential)
        .set({
          name,
          type,
          value: encrypt(value),
        })
        .where(
          and(eq(credential.id, id), eq(credential.userId, ctx.auth.user.id)),
        )
        .returning()

      return updatedCredential
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const credentialRecord = await db.query.credential.findFirst({
        where: and(
          eq(credential.id, input.id),
          eq(credential.userId, ctx.auth.user.id),
        ),
      })

      if (!credentialRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credential not found",
        })
      }

      return credentialRecord
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
            eq(credential.userId, ctx.auth.user.id),
            ilike(credential.name, `%${search}%`),
          )
        : eq(credential.userId, ctx.auth.user.id)

      const [items, [{ count: totalCount }]] = await Promise.all([
        db.query.credential.findMany({
          where,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          orderBy: desc(credential.updatedAt),
        }),
        db
          .select({
            count: count(),
          })
          .from(credential)
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
  getByType: protectedProcedure
    .input(
      z.object({
        type: z.enum(CredentialType),
      }),
    )
    .query(({ ctx, input }) => {
      const { type } = input

      return db.query.credential.findMany({
        where: and(
          eq(credential.type, type),
          eq(credential.userId, ctx.auth.user.id),
        ),
        orderBy: desc(credential.updatedAt),
      })
    }),
})
