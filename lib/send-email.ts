import {
  EMAIL_PROVIDER,
  MAGICLINK_SENDER_EMAIL,
  MAGICLINK_SENDER_NAME,
} from "@/config/emails"
import { sendWithPostmark } from "@/lib/email/providers/postmark"
import { sendWithResend } from "@/lib/email/providers/resend"
import { sendWithSes } from "@/lib/email/providers/ses"

interface SendEmailValues {
  to: string
  from?: string
  subject: string
  body: string
}

export async function sendEmail({
  to,
  from = `${MAGICLINK_SENDER_NAME} <${MAGICLINK_SENDER_EMAIL}>`,
  subject,
  body,
}: SendEmailValues) {
  switch (EMAIL_PROVIDER) {
    case "resend":
      return sendWithResend({
        to,
        from,
        subject,
        body,
      })

    case "postmark":
      return sendWithPostmark({ to, from, subject, body })

    case "ses":
      return sendWithSes({
        to,
        from,
        subject,
        body,
      })

    default: {
      const exhaustiveCheck: never = EMAIL_PROVIDER
      throw new Error(`Unsupported email provider: ${exhaustiveCheck}`)
    }
  }
}
