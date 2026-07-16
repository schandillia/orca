import { useQueryStates } from "nuqs"
import { credentialsParams } from "@/credentials/params"

export const useCredentialsParams = () => {
  return useQueryStates(credentialsParams)
}
