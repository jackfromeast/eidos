import { useCurrentPathInfo } from "@/hooks/use-current-pathinfo"
import { useSqlite, useSqliteStore } from "@/hooks/use-sqlite"
import { useTableOperation } from "@/hooks/use-table"
import { useUiColumns } from "@/hooks/use-ui-columns"
import {
    EidosDataEventChannelMsg,
    EidosDataEventChannelMsgType,
    EidosDataEventChannelName
} from "@/lib/const"
import { FieldType } from "@/lib/fields/const"
import { SelectProperty } from "@/lib/fields/select"
import { transformSql } from "@/lib/sqlite/sql-parser"
import { IView } from "@/lib/store/IView"
import { getRawTableNameById } from "@/lib/utils"
import { IField } from "lib/store/interface"
import { useCallback, useEffect, useMemo, useState } from "react"
import { uuidv7 } from "@/lib/utils"

export type KanbanItem = {
    id: string
    status: string
    [key: string]: any
}

export type StatusCount = {
    status: string
    count: number
    color?: string
}

export const useKanbanViewData = (view: IView) => {
    const { table_id: tableId, query, properties } = view
    const tableName = getRawTableNameById(tableId)
    const { sqlite } = useSqlite()
    const { setRows } = useSqliteStore()
    const [items, setItems] = useState<KanbanItem[]>([])
    const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
    const [loading, setLoading] = useState(false)
    const { space } = useCurrentPathInfo()
    const { nameRawIdMap, fieldRawColumnNameFieldMap, uiColumns } = useUiColumns(tableName, space)

    const groupByField = properties?.groupByField || 'status'

    const groupByFieldInstance = fieldRawColumnNameFieldMap[groupByField]
    const sql = useMemo(() => {
        const defaultQuery = `select * from ${tableName}`
        const q = query.trim().length ? query : defaultQuery
        const sql = transformSql(q, tableName, nameRawIdMap)
        return sql
    }, [query, tableName, nameRawIdMap])

    const fetchStatusCounts = useCallback(async () => {
        if (!sqlite || !tableName) return

        const countSql = `
            SELECT 
                COALESCE(${groupByField}, 'Todo') as status,
                COUNT(*) as count 
            FROM (${sql}) as filtered_data
            GROUP BY ${groupByField}
            ORDER BY count DESC
        `
        try {
            const counts = await sqlite.sql2`${countSql}`
            if (groupByFieldInstance?.type === FieldType.Select) {
                // combo statusCounts and groupByFieldInstance.options
                const options = (groupByFieldInstance as IField<SelectProperty>).property.options
                const statusCountsWithOptions = options.map(option => {
                    const count = counts.find(count => count.status === option.name)
                    return {
                        status: option.name,
                        count: count?.count || 0,
                        color: option.color
                    }
                })
                setStatusCounts(statusCountsWithOptions)
            } else {
                console.warn("groupByField is not a select field", {
                    fieldRawColumnNameFieldMap,
                    groupByFieldInstance,
                    groupByField,
                    uiColumns
                })
                setStatusCounts(counts)
            }
        } catch (error) {
            console.error('Error fetching status counts:', error)
        }
    }, [sqlite, tableName, groupByField, groupByFieldInstance, fieldRawColumnNameFieldMap, uiColumns, sql])



    const updateItemStatus = async (itemId: string, newStatus: string) => {
        const oldStatus = items.find(item => item.id === itemId)?.status
        if (oldStatus === newStatus) {
            return
        }
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, [groupByField]: newStatus, status: newStatus } : item
            )
        )
        await sqlite?.table(tableId).rows.update(itemId, { [groupByField]: newStatus }, {
            useFieldId: true
        })
        await fetchStatusCounts()

    }

    useEffect(() => {
        if (sqlite && nameRawIdMap.size && tableName) {
            setLoading(true)
            Promise.all([
                sqlite.sql2`${sql}`,
                fetchStatusCounts()
            ]).then(([data]) => {
                setRows(tableId, data)
                setItems(
                    data.map((item: any) => ({
                        id: item._id,
                        status: item[groupByField] || "Todo",
                        ...item,
                    }))
                )
                setLoading(false)
            })
        }
    }, [sqlite, sql, tableName, view.id, nameRawIdMap, setRows, tableId, groupByField])

    useEffect(() => {
        const bc = new BroadcastChannel(EidosDataEventChannelName)
        const handleMsg = async (e: MessageEvent<EidosDataEventChannelMsg>) => {
            const { type, payload } = e.data
            if (
                type === EidosDataEventChannelMsgType.DataUpdateSignalType &&
                payload.table === tableName
            ) {
                const { _new, _old } = payload
                const isUpdate = _new && _old
                const isDelete = !_new && _old
                const isCreate = _new && !_old

                if (isUpdate) {
                    setItems((prevItems) =>
                        prevItems.map((item) =>
                            item.id === _new._id ? { ...item, [groupByField]: _new[groupByField], status: _new[groupByField] } : item
                        )
                    )
                } else if (isDelete) {
                    setItems((prevItems) =>
                        prevItems.filter((item) => item.id !== _old._id)
                    )
                } else if (isCreate) {
                    setItems((prevItems) => [...prevItems, { ..._new, id: _new._id, status: _new[groupByField] }])
                }
                await fetchStatusCounts()
            }
        }
        bc.addEventListener("message", handleMsg)
        return () => {
            bc.removeEventListener("message", handleMsg)
            bc.close()
        }
    }, [tableName, groupByField, fetchStatusCounts])

    return {
        items,
        loading,
        statusCounts,
        updateItemStatus: updateItemStatus,
    }
}

export const useKanbanItemOperations = (
    tableId: string,
    space: string,
    groupByField?: string
) => {
    const { addRow } = useTableOperation(getRawTableNameById(tableId), space)

    const createItem = async (title: string, status: string) => {
        if (!title || !groupByField) return

        return await addRow(
            uuidv7(),
            {
                title: title,
                [groupByField]: status,
            },
            {
                useFieldId: true,
            }
        )
    }
    return {
        createItem,
    }
}

