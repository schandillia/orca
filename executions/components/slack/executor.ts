import Handlebars from "handlebars"
import { decode } from "html-entities"
import { NonRetriableError } from "inngest"
import ky from "ky"
import type { NodeExecutor } from "@/executions/types"
import { slackChannel } from "@/inngest/channels/slack"

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

type SlackData = {
  variableName?: string
  webhookUrl?: string
  content?: string
}

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish("slack-loading", slackChannel().status, {
    nodeId,
    status: "loading",
  })
  if (!data.content) {
    await publish("slack-error", slackChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError("Slack node: Some message content is required")
  }

  const rawContent = Handlebars.compile(data.content)(context)
  const content = decode(rawContent)

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookUrl) {
        await publish("slack-error", slackChannel().status, {
          nodeId,
          status: "error",
        })
        throw new NonRetriableError("Slack node: Webhook URL is required")
      }
      await ky.post(data.webhookUrl, {
        json: {
          text: content,
        },
      })
      if (!data.variableName) {
        await publish("slack-error", slackChannel().status, {
          nodeId,
          status: "error",
        })
        throw new NonRetriableError("Slack node: Variable name not configured")
      }
      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      }
    })
    await publish("slack-success", slackChannel().status, {
      nodeId,
      status: "success",
    })
    return result
  } catch (error) {
    await publish("slack-error", slackChannel().status, {
      nodeId,
      status: "error",
    })
    throw error
  }
}
