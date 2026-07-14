import Handlebars from "handlebars"
import { NonRetriableError } from "inngest"
import ky, { type Options as KyOptions } from "ky"
import type { NodeExecutor } from "@/executions/types"

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

type HttpRequestData = {
  variableName: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: string
}

export const HttpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish "loading" state for http request

  if (!data.endpoint) {
    // TODO: Publish "error" state for HTTP request
    throw new NonRetriableError("HTTP Request node: No endpoint configured")
  }

  if (!data.variableName) {
    // TODO: Publish "error" state for HTTP request
    throw new NonRetriableError(
      "HTTP Request node: Variable name not configured",
    )
  }

  if (!data.method) {
    // TODO: Publish "error" state for HTTP request
    throw new NonRetriableError("HTTP Request node: Method not configured")
  }

  const result = await step.run("http-request", async () => {
    let endpoint: string
    try {
      const template = Handlebars.compile(data.endpoint)
      endpoint = template(context)

      if (!endpoint || typeof endpoint !== "string") {
        throw new Error("Endpoint template must resolve to a non-empty string")
      }
    } catch (error) {
      throw new NonRetriableError(
        `HTTP Request node: Failed to resolve endpoint template: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }

    const method = data.method

    const options: KyOptions = { method }

    if (["POST", "PUT", "PATCH"].includes(method)) {
      let resolved: string

      try {
        const template = Handlebars.compile(data.body || "{}")
        resolved = template(context)

        JSON.parse(resolved)
      } catch (error) {
        throw new NonRetriableError(
          `HTTP Request node: Failed to resolve request body: ${
            error instanceof Error ? error.message : String(error)
          }`,
        )
      }

      options.body = resolved
      options.headers = {
        "Content-Type": "application/json",
      }
    }

    let response: Response

    try {
      response = await ky(endpoint, options)
    } catch (error) {
      throw new NonRetriableError(
        `HTTP Request node: Request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
    const contentType = response.headers.get("content-type")
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text()

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    }

    return {
      ...context,
      [data.variableName]: responsePayload,
    }
  })

  // const result = await step.run("http-request", async () => context)

  // TODO: Publish "success" state for http request

  return result
}
