import { useQueryStates } from "nuqs"
import { workflowsParams } from "@/workflows/params"

export const useWorkflowsParams = () => {
  return useQueryStates(workflowsParams)
}
