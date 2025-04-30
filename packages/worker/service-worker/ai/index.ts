// import { handleGoogleAI } from "./google"
import { DataSpace } from "@/worker/web-worker/DataSpace"
import { IData } from "./interface"
import { handleOpenAI } from "./openai"

export const pathname = "/api/chat"
export default async function handle(event: FetchEvent, ctx?: {
  getDataspace: (space: string) => Promise<DataSpace | null>
}) {
  const data = (await event.request.json()) as IData
  const { type } = data
  return handleOpenAI(data, ctx)
}
