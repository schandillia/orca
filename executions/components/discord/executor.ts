import Handlebars from "handlebars"
import { decode } from "html-entities"
import { NonRetriableError } from "inngest"
import ky from "ky"
import type { NodeExecutor } from "@/executions/types"
import { discordChannel } from "@/inngest/channels/discord"

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

type DiscordData = {
  variableName?: string
  webhookUrl?: string
  content?: string
  username?: string
}

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish("discord-loading", discordChannel().status, {
    nodeId,
    status: "loading",
  })
  if (!data.content) {
    await publish("discord-error", discordChannel().status, {
      nodeId,
      status: "error",
    })
    throw new NonRetriableError(
      "Discord node: Some message content is required",
    )
  }

  const rawContent = Handlebars.compile(data.content)(context)
  const content = decode(rawContent)
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) {
        await publish("discord-error", discordChannel().status, {
          nodeId,
          status: "error",
        })
        throw new NonRetriableError("Discord node: Webhook URL is required")
      }
      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000), // Discord's max message length
          username,
        },
      })
      if (!data.variableName) {
        await publish("discord-error", discordChannel().status, {
          nodeId,
          status: "error",
        })
        throw new NonRetriableError(
          "Discord node: Variable name not configured",
        )
      }
      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      }
    })
    await publish("discord-success", discordChannel().status, {
      nodeId,
      status: "success",
    })
    return result
  } catch (error) {
    await publish("discord-error", discordChannel().status, {
      nodeId,
      status: "error",
    })
    throw error
  }
}
