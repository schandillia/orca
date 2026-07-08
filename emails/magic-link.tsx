import {
  Button,
  Container,
  Heading,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { render } from "@react-email/render"
import { BRAND_DOMAIN, BRAND_LOGO_PATH, BRAND_NAME } from "@/config/app"
import { MAGIC_LINK_EXPIRATION_SECONDS } from "@/config/time"
import { EmailLayout } from "@/emails/components/email-layout"

interface MagicLinkEmailProps {
  url: string
}

const logoUrl = `https://${BRAND_DOMAIN}${BRAND_LOGO_PATH}`

function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  const expiresInMinutes = Math.floor(MAGIC_LINK_EXPIRATION_SECONDS / 60)

  return (
    <EmailLayout>
      <Tailwind>
        <Container className="rounded-xl bg-zinc-100 p-10 text-center">
          <Img
            src={logoUrl}
            alt={BRAND_NAME}
            width="32"
            height="32"
            className="mx-auto mb-4"
          />

          <Heading className="text-2xl font-bold">
            Log in to {BRAND_NAME}
          </Heading>

          <Text className="text-sm text-zinc-600">
            {`Click the button below to log in. This link expires in ${expiresInMinutes} ${expiresInMinutes === 1 ? "minute" : "minutes"}.`}
          </Text>

          <Section className="my-6">
            <Button
              href={url}
              className="rounded-lg bg-zinc-900 px-6 py-3 font-bold text-white no-underline"
            >
              Log in
            </Button>
          </Section>

          <Text className="text-xs text-zinc-500">
            If you didn’t request this, you can safely ignore this email.
          </Text>
        </Container>
      </Tailwind>
    </EmailLayout>
  )
}

MagicLinkEmail.PreviewProps = {
  url: "https://orca.com/magic-link?token=preview-token-123",
} satisfies MagicLinkEmailProps

export default MagicLinkEmail

export const renderMagicLinkEmail = (url: string) =>
  render(<MagicLinkEmail url={url} />)
