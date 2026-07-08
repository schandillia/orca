// emails/components/email-layout.tsx

import { Body, Container, Head, Html, Tailwind } from "@react-email/components"
import type { ReactNode } from "react"
import { EmailFooter } from "@/emails/components/email-footer"
import { EmailHeader } from "@/emails/components/email-header"

interface EmailLayoutProps {
  children: ReactNode
}

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-150 p-5">
            <EmailHeader />

            {children}

            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
