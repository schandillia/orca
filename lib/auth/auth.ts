import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink } from "better-auth/plugins"
import { MAGIC_LINK_EXPIRATION_SECONDS } from "@/config/time"
import { db, schema } from "@/db/drizzle"
import { env } from "@/env"

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    magicLink({
      expiresIn: MAGIC_LINK_EXPIRATION_SECONDS,
      sendMagicLink: async ({ email, url }) => {
        // await sendEmail({
        //   to: email,
        //   subject: `Your ${siteConfig.brand.name} login link`,
        //   body: await renderMagicLinkEmail(url),
        // })
      },
    }),
  ],
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
})
