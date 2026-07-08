import { BRAND_DOMAIN, BRAND_NAME } from "@/config/app"

export type EmailProvider = "resend" | "postmark" | "ses"

export const EMAIL_PROVIDER: EmailProvider = "resend"

export const MAGICLINK_SENDER_NAME = `${BRAND_NAME} Accounts`

export const MAGICLINK_SENDER_EMAIL = `accounts@${BRAND_DOMAIN}`
