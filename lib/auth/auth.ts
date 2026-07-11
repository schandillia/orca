import { checkout, polar, portal } from "@polar-sh/better-auth"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink } from "better-auth/plugins"
import { BRAND_NAME } from "@/config/app"
import { MAGICLINK_SENDER_EMAIL, MAGICLINK_SENDER_NAME } from "@/config/emails"
import { MAGIC_LINK_EXPIRATION_SECONDS } from "@/config/time"
import { db, schema } from "@/db/drizzle"
import { renderMagicLinkEmail } from "@/emails/magic-link"
import { env } from "@/env"
import { polarClient } from "@/lib/polar"
import { sendEmail } from "@/lib/send-email"

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
        await sendEmail({
          to: email,
          from: `${MAGICLINK_SENDER_NAME} <${MAGICLINK_SENDER_EMAIL}>`,
          subject: `Your ${BRAND_NAME} login link`,
          body: await renderMagicLinkEmail(url),
        })
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "7e1a7860-45e3-4f71-b249-389df0412d23",
              slug: "pro",
            },
          ],
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
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

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
