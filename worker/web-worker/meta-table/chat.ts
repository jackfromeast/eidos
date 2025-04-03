import { ChangelogTableName, ChatTableName } from "@/lib/sqlite/const"
import { BaseTable, BaseTableImpl } from "./base"
import { EidosDataEventChannelMsgType } from "@/lib/const"
import { DataUpdateSignalType } from "@/lib/const"

export type Chat = {
  id: string
  created_at: string
  title: string
  user_id: string
  project_id: string // script(extension) id
}


export class ChatTable extends BaseTableImpl<Chat> implements BaseTable<Chat> {
  name = ChatTableName
  createTableSql = `
  CREATE TABLE IF NOT EXISTS ${ChatTableName} (
    id TEXT PRIMARY KEY,
    title TEXT,
    user_id TEXT,
    project_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TRIGGER IF NOT EXISTS ${ChatTableName}_insert_trigger
  AFTER INSERT ON ${ChatTableName}
  BEGIN
    INSERT INTO ${ChangelogTableName} (
        id,
        table_name,
        type,
        event_type,
        new_data,
        is_processed
    ) VALUES (
        uuid7(),
        '${ChatTableName}',
        '${DataUpdateSignalType.Insert}',
        '${EidosDataEventChannelMsgType.MetaTableUpdateSignalType}',
        json_object(
            'id', NEW.id,
            'title', NEW.title,
            'user_id', NEW.user_id,
            'project_id', NEW.project_id,
            'created_at', NEW.created_at
        ),
        0
    );
  END;
  `

  async getChatIdsByProjectId(projectId: string): Promise<string[]> {
    const sql = `SELECT id FROM ${this.name} WHERE project_id = ?`;
    const result = await this.dataSpace.exec2(sql, [projectId]);
    return result.map((row: any) => row.id);
  }

  async delete(chatId: string) {
    await this.dataSpace.db.transaction(async () => {
      await this.dataSpace.message.deleteMessagesByChatId(chatId);
      const sql = `DELETE FROM ${this.name} WHERE id = ?`;
      await this.dataSpace.exec2(sql, [chatId]);
    });
  }
}

