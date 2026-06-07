import * as SQLite from 'expo-sqlite';
import { DDL } from './schema';
import { seedDatabaseIfEmpty } from './seed';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync('rassid.db');
  await db.execAsync(DDL);
  await seedDatabaseIfEmpty(db);
  dbInstance = db;
  return db;
}

export function resetDatabaseInstance(): void {
  dbInstance = null;
}
