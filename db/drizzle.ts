import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as authSchema from "@/db/schemas/auth-schema"
import * as relations from "@/db/schemas/relations"
import * as workflowSchema from "@/db/schemas/workflow-schema"
import { env } from "@/env"

const client = postgres(env.DATABASE_URL)

export const schema = {
  ...authSchema,
  ...workflowSchema,
  ...relations,
}

export const db = drizzle(client, { schema })
