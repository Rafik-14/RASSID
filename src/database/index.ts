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

  // ONE TIME FIX: If the local database was seeded with the old invalid string IDs, wipe it so it can re-seed with UUIDs
  try {
    const badStore = await db.getFirstAsync<{ store_id: string }>("SELECT store_id FROM stores WHERE store_id = 'store-epicerie-port'");
    if (badStore) {
      console.warn("Wiping local database due to invalid seed IDs...");
      await db.execAsync(`
        PRAGMA foreign_keys = OFF;
        DROP TABLE IF EXISTS transaction_items;
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS stores;
        DROP TABLE IF EXISTS sync_meta;
        PRAGMA foreign_keys = ON;
      `);
      // Reset version so it runs migrations if needed
      await db.execAsync('PRAGMA user_version = 0');
    }
  } catch (e) {
    // Table might not exist yet, that's fine
  }

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
