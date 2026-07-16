import { createLoader } from "nuqs/server"
import { credentialsParams } from "@/credentials/params"

export const credentialsParamsLoader = createLoader(credentialsParams)
