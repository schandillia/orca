import * as postmark from "postmark"
import { env } from "@/env"

if (!env.POSTMARK_API_KEY) {
  throw new Error("POSTMARK_API_KEY is not set")
}

const client = new postmark.ServerClient(env.POSTMARK_API_KEY)

interface SendPostmarkEmailValues {
  to: string
  from: string
  subject: string
  body: string
}

export async function sendWithPostmark({
  to,
  from,
  subject,
  body,
}: SendPostmarkEmailValues): Promise<void> {
  await client.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    HtmlBody: body,
  })
}
