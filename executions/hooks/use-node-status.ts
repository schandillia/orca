import { useRealtime } from "inngest/react"
import { useEffect, useState } from "react"
import type { NodeStatus } from "@/components/react-flow/node-status-indicator"
import type { fetchHttpRequestRealtimeToken } from "@/executions/components/http-request/actions"
import type { httpRequestChannel } from "@/inngest/channels/http-request"

interface UseNodeStatusOptions {
  nodeId: string
  channel: ReturnType<typeof httpRequestChannel>
  token: typeof fetchHttpRequestRealtimeToken
}

export function useNodeStatus({
  nodeId,
  channel,
  token,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial")

  const { messages } = useRealtime({
    channel,
    topics: ["status"] as const,
    token,
  })

  useEffect(() => {
    const message = messages.byTopic.status

    if (message?.kind !== "data") return
    if (message.data.nodeId !== nodeId) return

    setStatus(message.data.status)
  }, [messages.byTopic.status, nodeId])

  return status
}
