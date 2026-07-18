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
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    POSTMARK_API_KEY: z.string().min(1).optional(),
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    INNGEST_DEV: z.literal("1").optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    SENTRY_ORG: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
    POLAR_ACCESS_TOKEN: z.string().min(1),
    ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "Must be a 64-character hex string"),
  },

  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    POSTMARK_API_KEY: process.env.POSTMARK_API_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    INNGEST_DEV: process.env.INNGEST_DEV,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
})
