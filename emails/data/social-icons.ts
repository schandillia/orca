import { BRAND_DOMAIN, SOCIAL_LINKS } from "@/config/app"

export const SOCIAL_ICONS = [
  {
    href: SOCIAL_LINKS.x,
    src: `https://${BRAND_DOMAIN}/email/icons/x.png`,
    alt: "X",
  },
  {
    href: SOCIAL_LINKS.linkedin,
    src: `https://${BRAND_DOMAIN}/email/icons/linkedin.png`,
    alt: "LinkedIn",
  },
  {
    href: SOCIAL_LINKS.youtube,
    src: `https://${BRAND_DOMAIN}/email/icons/youtube.png`,
    alt: "YouTube",
  },
  {
    href: SOCIAL_LINKS.github,
    src: `https://${BRAND_DOMAIN}/email/icons/github.png`,
    alt: "GitHub",
  },
] as const
