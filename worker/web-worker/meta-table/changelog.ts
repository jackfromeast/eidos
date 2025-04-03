import { BaseTable, BaseTableImpl } from "./base"
import { DataUpdateSignalType, EidosDataEventChannelMsgType } from "@/lib/const"
import { ChangelogTableName } from "@/lib/sqlite/const"
import { uuidv7 } from "@/lib/utils"

export interface IChangelog {
    id: string
    table_name: string
    type: DataUpdateSignalType
    event_type: EidosDataEventChannelMsgType
    new_data?: string // JSON string of new data
    old_data?: string // JSON string of old data
    created_at: string
    is_processed: boolean // 标记是否已被处理
}

export class ChangelogTable extends BaseTableImpl implements BaseTable<IChangelog> {
    name = ChangelogTableName


    createTableSql = `
    CREATE TABLE IF NOT EXISTS ${this.name} (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      type TEXT NOT NULL,
      event_type TEXT NOT NULL,
      new_data TEXT,
      old_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_processed INTEGER NOT NULL DEFAULT 0,
      UNIQUE(id)
    );`
    // CREATE INDEX IF NOT EXISTS idx_changelogs_created_at ON ${this.name}(created_at);
    // CREATE INDEX IF NOT EXISTS idx_changelogs_is_processed ON ${this.name}(is_processed);
    async add(data: Omit<IChangelog, "id" | "created_at" | "is_processed">) {
        return await super.add({
            ...data,
            id: uuidv7(),
            is_processed: false
        })
    }

    async getUnprocessedLogs(limit: number = 100): Promise<IChangelog[]> {
        return await this.list(
            { is_processed: false },
            {
                limit,
                orderBy: "created_at",
                order: "ASC"
            }
        )
    }

    async markAsProcessed(ids: string[]) {
        if (!ids.length) return

        const sql = `
    UPDATE ${this.name} 
    SET is_processed = 1 
    WHERE id IN (${ids.map(() => '?').join(',')})
    `
        await this.dataSpace.exec2(sql, ids)
    }

    async cleanup(beforeDate: string) {
        const sql = `
    DELETE FROM ${this.name}
    WHERE is_processed = 1 
    AND created_at < ?
    `
        await this.dataSpace.exec2(sql, [beforeDate])
    }
} 