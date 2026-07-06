import { config } from "dotenv"

config({ path: ".env" })

import { defineConfig } from "drizzle-kit"
import { env } from "@/env"

export default defineConfig({
  schema: "./db/schemas/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
