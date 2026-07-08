import { Img, Link, Row, Section, Text } from "@react-email/components"
import {
  BRAND_TAGLINE,
  COMPANY_ADDRESS_LINE1,
  COMPANY_ADDRESS_LINE2,
} from "@/config/app"
import { SOCIAL_ICONS } from "@/emails/data/social-icons"

export function EmailFooter() {
  return (
    <Section className="mt-8 text-center">
      <Text className="text-sm text-zinc-400">{BRAND_TAGLINE}</Text>

      <Row className="my-4 w-auto">
        <table className="mx-auto">
          <tbody>
            <tr>
              {SOCIAL_ICONS.map((icon) => (
                <td key={icon.alt} className="px-2">
                  <Link href={icon.href}>
                    <Img src={icon.src} alt={icon.alt} width="18" height="18" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Row>

      <Text className="mt-10 text-center text-xs leading-5 text-zinc-400">
        {COMPANY_ADDRESS_LINE1}
        <br />
        {COMPANY_ADDRESS_LINE2}
      </Text>
    </Section>
  )
}
