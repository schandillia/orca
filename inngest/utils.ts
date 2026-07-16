import toposort from "toposort"
import type { Connection, Node } from "@/db/schemas/workflow-schema"
import { inngest } from "@/inngest/client"

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  // If no connections, return nodes as-is (they’re all independent)
  if (connections.length === 0) return nodes

  // Create edges array for toposort
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ])

  // Add nodes with no connections as self-edges to ensure they're included
  const connectedNodeIds = new Set<string>()

  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId)
    connectedNodeIds.add(conn.toNodeId)
  }
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id])
    }
  }
  // Perform topological sort
  let sortedNodeIds: string[]
  try {
    sortedNodeIds = toposort(edges)
    // Remove duplicates (from self-edges)
    sortedNodeIds = [...new Set(sortedNodeIds)]
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle")
    }
    throw error
  }
  // Map sorted IDs back to node objects
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  return sortedNodeIds.map((id) => {
    const node = nodeMap.get(id)
    if (!node) throw new Error(`Node ${id} not found`)
    return node
  })
}

type WorkflowExecutionData = {
  workflowId: string
} & Record<string, unknown>

export const sendWorkflowExecution = async (data: WorkflowExecutionData) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
  })
}

export type LevelsResult = {
  levels: Node[][]
  dependencies: Record<string, string[]>
}

export const groupIntoLevels = (
  nodes: Node[],
  connections: Connection[],
): LevelsResult => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const dependencies: Record<string, string[]> = {}

  for (const node of nodes) {
    dependencies[node.id] = []
  }
  for (const conn of connections) {
    dependencies[conn.toNodeId]?.push(conn.fromNodeId)
  }

  const depthCache = new Map<string, number>()

  const computeDepth = (
    nodeId: string,
    visiting = new Set<string>(),
  ): number => {
    if (depthCache.has(nodeId)) return depthCache.get(nodeId) as number
    if (visiting.has(nodeId)) throw new Error("Workflow contains a cycle")

    visiting.add(nodeId)
    const preds = dependencies[nodeId] || []
    const depth =
      preds.length === 0
        ? 0
        : Math.max(...preds.map((p) => computeDepth(p, visiting))) + 1
    visiting.delete(nodeId)

    depthCache.set(nodeId, depth)
    return depth
  }

  const levels: Node[][] = []
  for (const node of nodes) {
    const depth = computeDepth(node.id)
    levels[depth] = levels[depth] || []
    levels[depth].push(node)
  }

  // Map back through nodeMap in case of any id mismatches, filter out gaps
  const cleanLevels = levels
    .filter(Boolean)
    .map((level) => level.map((n) => nodeMap.get(n.id) as Node))

  return { levels: cleanLevels, dependencies }
}
