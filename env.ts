import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  onValidationError: (error) => {
    console.error(
      "Invalid environment variables:",
      JSON.stringify(error, null, 2),
    )
    throw new Error("Invalid environment variables")
  },

  server: {
    // Database
    DATABASE_URL: z.url(),
  },

  client: {},

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
})
