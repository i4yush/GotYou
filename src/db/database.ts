import { open, type DB } from '@op-engineering/op-sqlite';

let db: DB | null = null;

export function getDatabase(): DB {
  if (!db) {
    db = open({ name: 'replyai.db' });
  }
  return db;
}
