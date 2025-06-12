import { useCurrentPathInfo } from "@/hooks/use-current-pathinfo"
import { useDataViewById } from "@/hooks/use-data-view"

import { Table } from "../table"
import { DataViewPlaceholder } from "./placeholder"

export const DataView = ({ nodeId }: { nodeId: string }) => {
  const { isDataViewExist, reload } = useDataViewById(nodeId!)

  const { space } = useCurrentPathInfo()

  if (!isDataViewExist) {
    return <DataViewPlaceholder nodeId={nodeId} onCreated={reload} />
  }

  return <Table tableName={`vw_${nodeId}`} space={space} />
}
