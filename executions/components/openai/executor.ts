import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import Handlebars from "handlebars"
import { NonRetriableError } from "inngest"
import { db } from "@/db/drizzle"
import type { NodeExecutor } from "@/executions/types"
import { openaiChannel } from "@/inngest/channels/openai"
import { decrypt } from "@/lib/encryption"

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
  credentialId?: string
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
  userId,
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
  if (!data.credentialId) {
    await publish("openai-error", openaiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("OpenAI node: Credentials not configured")
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "Never make things up. Stick to facts. Keep it under 100 words. And no flattery."
  const userPrompt = Handlebars.compile(data.userPrompt)(context)

  const credentialId = data.credentialId
  const credentialRecord = await step.run("get-credential", () => {
    return db.query.credential.findFirst({
      where: (credential, { eq, and }) =>
        and(eq(credential.id, credentialId), eq(credential.userId, userId)),
    })
  })
  if (!credentialRecord) {
    await publish("openai-error", openaiChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("OpenAI node: Credential not found")
  }
  const openai = createOpenAI({
    apiKey: decrypt(credentialRecord.value),
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
