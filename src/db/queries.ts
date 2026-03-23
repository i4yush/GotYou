import { getDatabase } from './database';

export interface Message {
  id: number;
  conv_id: number;
  role: string;
  text: string;
  ts: number;
}

export interface Conversation {
  id: number;
  app: string;
  sender: string;
  tone: string;
  style_note: string | null;
  updated_at: number;
}

export function upsertConversation(app: string, sender: string): number {
  const db = getDatabase();

  const existing = db.execute(
    'SELECT id FROM conversations WHERE app = ? AND sender = ? LIMIT 1',
    [app, sender]
  );

  if (existing.rows && existing.rows.length > 0) {
    const convId = existing.rows.item(0).id as number;
    db.execute(
      'UPDATE conversations SET updated_at = strftime(\'%s\', \'now\') WHERE id = ?',
      [convId]
    );
    return convId;
  }

  const result = db.execute(
    'INSERT INTO conversations (app, sender) VALUES (?, ?)',
    [app, sender]
  );
  return result.insertId as number;
}

export function insertMessage(convId: number, role: string, text: string): void {
  const db = getDatabase();
  db.execute(
    'INSERT INTO messages (conv_id, role, text) VALUES (?, ?, ?)',
    [convId, role, text]
  );
}

export function getRecentMessages(convId: number, limit: number = 20): Message[] {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM messages WHERE conv_id = ? ORDER BY ts DESC LIMIT ?',
    [convId, limit]
  );
  const messages: Message[] = [];
  if (result.rows) {
    for (let i = result.rows.length - 1; i >= 0; i--) {
      messages.push(result.rows.item(i) as Message);
    }
  }
  return messages;
}

export function updateTone(convId: number, tone: string, styleNote?: string): void {
  const db = getDatabase();
  db.execute(
    'UPDATE conversations SET tone = ?, style_note = ? WHERE id = ?',
    [tone, styleNote ?? null, convId]
  );
}

export function getAllConversations(): Conversation[] {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM conversations ORDER BY updated_at DESC'
  );
  const conversations: Conversation[] = [];
  if (result.rows) {
    for (let i = 0; i < result.rows.length; i++) {
      conversations.push(result.rows.item(i) as Conversation);
    }
  }
  return conversations;
}

export function getConversationById(convId: number): Conversation | null {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM conversations WHERE id = ? LIMIT 1',
    [convId]
  );
  if (result.rows && result.rows.length > 0) {
    return result.rows.item(0) as Conversation;
  }
  return null;
}

export function deleteConversation(convId: number): void {
  const db = getDatabase();
  db.execute('DELETE FROM messages WHERE conv_id = ?', [convId]);
  db.execute('DELETE FROM suggestions_cache WHERE conv_id = ?', [convId]);
  db.execute('DELETE FROM conversations WHERE id = ?', [convId]);
}

export function nukeAll(): void {
  const db = getDatabase();
  db.execute('DELETE FROM suggestions_cache');
  db.execute('DELETE FROM messages');
  db.execute('DELETE FROM conversations');
}

export function cacheSuggestions(convId: number, suggestions: string[]): void {
  const db = getDatabase();
  db.execute('DELETE FROM suggestions_cache WHERE conv_id = ?', [convId]);
  db.execute(
    'INSERT INTO suggestions_cache (conv_id, suggestions) VALUES (?, ?)',
    [convId, JSON.stringify(suggestions)]
  );
}
