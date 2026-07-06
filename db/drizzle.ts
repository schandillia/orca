import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as authSchema from "@/db/schemas/auth-schema"
import { env } from "@/env"

const client = postgres(env.DATABASE_URL)

export const schema = {
  ...authSchema,
}

export const db = drizzle(client, { schema })
