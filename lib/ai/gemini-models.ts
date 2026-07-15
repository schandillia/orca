import { GoogleGenAI } from "@google/genai"

let cachedModels: string[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 1000 * 60 * 60 // 1 hour

export async function getAvailableGeminiModels(): Promise<string[]> {
  const now = Date.now()
  if (cachedModels && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedModels
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })

  const modelNames: string[] = []
  const pager = await ai.models.list()
  let page = pager.page

  while (page.length > 0) {
    for (const model of page) {
      if (model.name && model.supportedActions?.includes("generateContent")) {
        modelNames.push(model.name.replace("models/", ""))
      }
    }
    page = pager.hasNextPage() ? await pager.nextPage() : []
  }

  cachedModels = modelNames
  cacheTimestamp = now
  return modelNames
}
