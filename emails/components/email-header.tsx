import { Column, Img, Row, Text } from "@react-email/components"
import { BRAND_DOMAIN, BRAND_LOGO_PATH, BRAND_NAME } from "@/config/app"

const logoUrl = `https://${BRAND_DOMAIN}${BRAND_LOGO_PATH}`

export function EmailHeader() {
  return (
    <Row className="mb-6">
      <Column>
        <Img src={logoUrl} alt={BRAND_NAME} width="32" height="32" />
      </Column>

      <Column align="right">
        <Text className="text-sm text-zinc-500">{BRAND_NAME}</Text>
      </Column>
    </Row>
  )
}
