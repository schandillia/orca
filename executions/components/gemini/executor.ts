import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import Handlebars from "handlebars"
import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/executions/types"
import { geminiChannel } from "@/inngest/channels/gemini"

Handlebars.registerHelper("json", (context) => {
  try {
    const jsonString = JSON.stringify(context, null, 2)
    return new Handlebars.SafeString(jsonString)
  } catch (error) {
    throw new Error(
      `Failed to serialize context to JSON: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
})

type GeminiData = {
  variableName?: string
  model?: string
  systemPrompt?: string
  userPrompt?: string
}

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish("gemini-loading", geminiChannel().status, {
    nodeId,
    status: "loading",
  })
  if (!data.variableName) {
    await publish("gemini-error", geminiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("Gemini node: Variable name not configured")
  }
  if (!data.userPrompt) {
    await publish("gemini-error", geminiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("Gemini node: User prompt not configured")
  }
  if (!data.model) {
    await publish("gemini-error", geminiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("Gemini node: Model not configured")
  }
  // TODO: Throw if credentials are missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant."
  const userPrompt = Handlebars.compile(data.userPrompt)(context)

  // TODO: Fetch user credentials
  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const google = createGoogleGenerativeAI({
    apiKey: credentialValue,
  })

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    })
    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : ""

    await publish("gemini-success", geminiChannel().status, {
      nodeId,
      status: "success",
    })
    return {
      ...context,
      [data.variableName]: { aiResponse: text },
    }
  } catch (error) {
    await publish("gemini-error", geminiChannel().status, {
      nodeId,
      status: "error",
    })
    throw error
  }
}
