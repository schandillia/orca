import { Inngest } from "inngest"
import { BRAND_NAME } from "@/config/app"

export const inngest = new Inngest({ id: BRAND_NAME.toLowerCase() })
