import { useState } from "react"

import { shortenId } from "@/lib/utils"
import { useCurrentPathInfo } from "@/hooks/use-current-pathinfo"
import { useDataView, useDataViewById } from "@/hooks/use-data-view"

import { Table } from "../table"

export const View = ({ nodeId }: { nodeId: string }) => {
  const [sql, setSql] = useState("")
  const { isDataViewExist } = useDataViewById(nodeId!)

  const { space } = useCurrentPathInfo()
  const { createDataView } = useDataView()
  const handleCreate = () => {
    console.log("Creating view with SQL:", sql)
    createDataView(shortenId(nodeId), sql)
  }

  if (!isDataViewExist) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Create New View</h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="sql"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SQL Query
            </label>
            <textarea
              id="sql"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your SQL query here..."
            />
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create View
          </button>
        </div>
      </div>
    )
  }

  return <Table tableName={`vw_${nodeId}`} space={space} />
}
