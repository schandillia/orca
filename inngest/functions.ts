import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { MAX_RETRIES } from "@/config/background-jobs"
import { inngest } from "@/inngest/client"

const google = createGoogleGenerativeAI()
const openai = createOpenAI()
const anthropic = createAnthropic()

const createTelemetryOptions = (functionId: string) => ({
  isEnabled: true,
  functionId,
  recordInputs: true,
  recordOutputs: true,
})

export const execute = inngest.createFunction(
  {
    id: "execute-ai",
    retries: MAX_RETRIES,
    triggers: {
      event: "execute/ai",
    },
  },
  async ({ step }) => {
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant",
        prompt: "Write a ghost story",
        experimental_telemetry: createTelemetryOptions("gemini-generate-text"),
      },
    )
    const { steps: openAISteps } = await step.ai.wrap(
      "openAI-generate-text",
      generateText,
      {
        model: openai("gpt-5.5"),
        system: "You are a helpful assistant",
        prompt: "Write a ghost story",
        experimental_telemetry: createTelemetryOptions("openAI-generate-text"),
      },
    )
    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-sonnet-4-5"),
        system: "You are a helpful assistant",
        prompt: "Write a ghost story",
        experimental_telemetry: createTelemetryOptions(
          "anthropic-generate-text",
        ),
      },
    )
    return { geminiSteps, openAISteps, anthropicSteps }
  },
)
