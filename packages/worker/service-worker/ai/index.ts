// import { handleGoogleAI } from "./google"
import { DataSpace } from "@/worker/web-worker/DataSpace"
import { IData } from "./interface"
import { handleOpenAI } from "./openai"
import { handleWebLLM } from "./webllm"
import { ALL_PROVIDERS, LLMProviderType } from "@/lib/ai/helper"

export const pathname = "/api/chat"
export default async function handle(event: FetchEvent, ctx?: {
  getDataspace: (space: string) => Promise<DataSpace | null>
}) {
  const data = (await event.request.json()) as IData
  const { type } = data
  if (!ALL_PROVIDERS.includes(type as LLMProviderType)) {
    return handleWebLLM(data)
  }
  return handleOpenAI(data, ctx)
}
