import { BaseTable, BaseTableImpl } from "./base"
import { ChatTableName, MessageTableName, ChangelogTableName } from "@/lib/sqlite/const"
import { EidosDataEventChannelMsgType } from "@/lib/const"
import { DataUpdateSignalType } from "@/lib/const"

export type ChatMessage = {
  id: string
  chat_id: string
  role: string
  content: string
  created_at?: string
}

export class MessageTable extends BaseTableImpl<ChatMessage> implements BaseTable<ChatMessage> {
  name = MessageTableName
  createTableSql = `
  CREATE TABLE IF NOT EXISTS ${MessageTableName} (
    id TEXT PRIMARY KEY,
    chat_id TEXT,
    role TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES ${ChatTableName}(id)
  );

  CREATE TRIGGER IF NOT EXISTS ${MessageTableName}_insert_trigger
  AFTER INSERT ON ${MessageTableName}
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
        '${MessageTableName}',
        '${DataUpdateSignalType.Insert}',
        '${EidosDataEventChannelMsgType.MetaTableUpdateSignalType}',
        json_object(
            'id', NEW.id,
            'chat_id', NEW.chat_id,
            'role', NEW.role,
            'content', NEW.content,
            'created_at', NEW.created_at
        ),
        0
    );
  END;
  `

  async deleteMessagesByChatId(chatId: string) {
    const sql = `DELETE FROM ${this.name} WHERE chat_id = ?`;
    await this.dataSpace.exec2(sql, [chatId]);
  }

  async clearMessages(chatId: string) {
    const sql = `DELETE FROM ${this.name} WHERE chat_id = ?`;
    await this.dataSpace.exec2(sql, [chatId]);
  }
}
