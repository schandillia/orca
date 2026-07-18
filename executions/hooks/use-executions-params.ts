import { useQueryStates } from "nuqs"
import { executionsParams } from "@/executions/params"

export const useExecutionsParams = () => {
  return useQueryStates(executionsParams)
}
