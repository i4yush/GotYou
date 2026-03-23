import { MMKV } from 'react-native-mmkv';
import { getDatabase } from './database';

const DB_VERSION_KEY = 'db_version';
const storage = new MMKV({ id: 'replyai-storage' });

type Migration = {
  version: number;
  up: (db: ReturnType<typeof getDatabase>) => void;
};

const migrations: Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.execute(`
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          app TEXT NOT NULL,
          sender TEXT NOT NULL,
          tone TEXT NOT NULL DEFAULT 'casual',
          style_note TEXT,
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
      `);
      db.execute(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conv_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          text TEXT NOT NULL,
          ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          FOREIGN KEY (conv_id) REFERENCES conversations(id) ON DELETE CASCADE
        );
      `);
      db.execute(`
        CREATE TABLE IF NOT EXISTS suggestions_cache (
          conv_id INTEGER NOT NULL,
          suggestions TEXT NOT NULL,
          ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
      `);
    },
  },
];

export function runMigrations(): void {
  const db = getDatabase();
  const currentVersion = storage.getNumber(DB_VERSION_KEY) ?? 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      migration.up(db);
      storage.set(DB_VERSION_KEY, migration.version);
    }
  }
}
