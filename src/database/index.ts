import * as SQLite from 'expo-sqlite';
import { DDL } from './schema';
import { seedDatabaseIfEmpty } from './seed';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const CURRENT_VERSION = 2; // Increment this when adding migrations

// Each migration runs sequentially
const MIGRATIONS: Record<number, string[]> = {
  1: [
    // Original schema
  ],
  2: [
    `ALTER TABLE stores ADD COLUMN rep_id TEXT DEFAULT ''`,
    `ALTER TABLE transactions ADD COLUMN rep_id TEXT DEFAULT ''`,
  ],
};

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync('rassid.db');

  // Enable WAL mode
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Run DDL for fresh database
  await db.execAsync(DDL);

  // Check current version
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion === 0) {
    // Fresh install, already ran DDL, just set version
    await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
  } else {
    // Run migrations
    for (let v = currentVersion + 1; v <= CURRENT_VERSION; v++) {
      const stmts = MIGRATIONS[v];
      if (stmts) {
        for (const sql of stmts) {
          try {
            await db.execAsync(sql);
          } catch (e: any) {
            // Ignore duplicate column errors if they somehow ran
            if (!e.message.includes('duplicate column')) {
              console.error(`Migration v${v} failed:`, e);
            }
          }
        }
      }
      await db.execAsync(`PRAGMA user_version = ${v}`);
    }
  }

  await seedDatabaseIfEmpty(db);
  dbInstance = db;
  return db;
}

export function resetDatabaseInstance(): void {
  dbInstance = null;
}
