import path from 'node:path';

import Database from 'better-sqlite3';

const databasePath = path.resolve(process.cwd(), 'bot_memory.db');
const db = new Database(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'model')),
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE INDEX IF NOT EXISTS idx_messages_channel_id
    ON messages(channel_id, id);
`);

const insertMessage = db.prepare(`
  INSERT INTO messages (channel_id, role, content)
  VALUES (?, ?, ?)
`);

const selectHistory = db.prepare(`
  SELECT role, content
  FROM messages
  WHERE channel_id = ?
  ORDER BY id DESC
  LIMIT ?
`);

const clearHistory = db.prepare(`
  DELETE FROM messages
  WHERE channel_id = ?
`);

export const memory = {
  save(channelId, role, content) {
    if (role !== 'user' && role !== 'model') {
      throw new Error(`Unsupported message role: ${role}`);
    }

    insertMessage.run(channelId, role, content);
  },

  getHistory(channelId, limit) {
    const rows = selectHistory.all(channelId, limit);

    return rows.reverse().map((row) => ({
      role: row.role,
      parts: [{ text: row.content }],
    }));
  },

  clear(channelId) {
    clearHistory.run(channelId);
    return true;
  },
};
