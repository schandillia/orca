import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"
import { env } from "@/env"

const ses = new SESv2Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

interface SendSesEmailValues {
  to: string
  from: string
  subject: string
  body: string
}

export async function sendWithSes({
  to,
  from,
  subject,
  body,
}: SendSesEmailValues) {
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: body,
            },
          },
        },
      },
    }),
  )
}
