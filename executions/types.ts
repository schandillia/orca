import type { GetStepTools, Inngest } from "inngest"

export type WorkflowContext = Record<string, unknown>

export type StepTools = GetStepTools<Inngest.Any>

export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData
  nodeId: string
  context: WorkflowContext
  step: StepTools
  // publish: TODO Add realtime later
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>,
) => Promise<WorkflowContext>

// biome-ignore lint/suspicious/noExplicitAny: registry needs a type-erased executor to hold heterogeneous NodeExecutor<T> variants
export type AnyNodeExecutor = NodeExecutor<any>
