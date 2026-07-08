import { Resend } from "resend"
import { env } from "@/env"

if (!env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set")
}

const resend = new Resend(env.RESEND_API_KEY)

interface SendResendEmailValues {
  to: string
  from: string
  subject: string
  body: string
}

export async function sendWithResend({
  to,
  from,
  subject,
  body,
}: SendResendEmailValues) {
  await resend.emails.send({
    from,
    to,
    subject,
    html: body,
  })
}
