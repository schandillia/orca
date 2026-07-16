"use server"

import { getClientSubscriptionToken } from "inngest/react"
import { openaiChannel } from "@/inngest/channels/openai"
import { inngest } from "@/inngest/client"

export async function fetchOpenAIRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: openaiChannel(),
    topics: ["status"],
  })
}
