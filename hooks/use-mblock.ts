import { useEffect, useState } from "react"

import { useSqlite } from "./use-sqlite"
import { IExtension } from "@/worker/web-worker/meta-table/extension"

export const useMblock = (id?: string) => {
    const [block, setBlock] = useState<IExtension | null>(null)
    const { sqlite } = useSqlite()
    useEffect(() => {
        if (!sqlite || !id) {
            return
        }
        sqlite.script.get(id).then(setBlock)
    }, [sqlite, id])
    return block
}