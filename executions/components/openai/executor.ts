import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import Handlebars from "handlebars"
import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/executions/types"
import { openaiChannel } from "@/inngest/channels/openai"

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

type OpenAIData = {
  variableName?: string
  model?: string
  systemPrompt?: string
  userPrompt?: string
}

export const openaiExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish("openai-loading", openaiChannel().status, {
    nodeId,
    status: "loading",
  })
  if (!data.variableName) {
    await publish("openai-error", openaiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("OpenAI node: Variable name not configured")
  }
  if (!data.userPrompt) {
    await publish("openai-error", openaiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("OpenAI node: User prompt not configured")
  }
  if (!data.model) {
    await publish("openai-error", openaiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("OpenAI node: Model not configured")
  }
  // TODO: Throw if credentials are missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "Never make things up. Stick to facts. Keep it under 100 words. And no flattery."
  const userPrompt = Handlebars.compile(data.userPrompt)(context)

  // TODO: Fetch user credentials
  const credentialValue = process.env.OPENAI_API_KEY
  const openai = createOpenAI({
    apiKey: credentialValue,
  })

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model),
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

    await publish("openai-success", openaiChannel().status, {
      nodeId,
      status: "success",
    })
    return {
      ...context,
      [data.variableName]: { aiResponse: text },
    }
  } catch (error) {
    await publish("openai-error", openaiChannel().status, {
      nodeId,
      status: "error",
    })
    throw error
  }
}
