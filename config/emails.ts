import { BRAND_DOMAIN, BRAND_NAME, DOMAIN_ACTIVE } from "@/config/app"

export type EmailProvider = "resend" | "postmark" | "ses"

export const EMAIL_PROVIDER: EmailProvider = "resend"
const SENDER_EMAIL_FALLBACK = "onboarding@resend.dev"

export const MAGICLINK_SENDER_NAME = `${BRAND_NAME} Accounts`

export const MAGICLINK_SENDER_EMAIL = DOMAIN_ACTIVE
  ? `accounts@${BRAND_DOMAIN}`
  : SENDER_EMAIL_FALLBACK
