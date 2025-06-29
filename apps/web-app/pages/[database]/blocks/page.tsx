import { useParams } from "react-router-dom"

import { BlockApp } from "@/components/block-renderer/block-app"

export const BlocksPage = () => {
  const { database, id } = useParams()
  if (!id) {
    return <div>Block not found</div>
  }
  return <BlockApp url={`block://${id}@${database}`} height={"100%"} />
}
