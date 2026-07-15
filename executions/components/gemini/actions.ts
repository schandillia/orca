"use server"

import { getClientSubscriptionToken } from "inngest/react"
import { geminiChannel } from "@/inngest/channels/gemini"
import { inngest } from "@/inngest/client"
import { getAvailableGeminiModels } from "@/lib/ai/gemini-models"

export async function fetchGeminiRealtimeToken() {
  return getClientSubscriptionToken(inngest, {
    channel: geminiChannel(),
    topics: ["status"],
  })
}

export async function fetchAvailableGeminiModels() {
  return getAvailableGeminiModels()
}
