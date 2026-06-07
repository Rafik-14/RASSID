import { getDatabase } from '@/database';
import { getSupabase } from '@/api/supabase';
import { hasSupabase } from '@/config/env';
import type { Transaction } from '@/types';

export interface SyncResult {
  success: boolean;
  synced: number;
  message: string;
}

export async function getPendingTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  return db.getAllAsync<Transaction>(
    `SELECT t.*, s.name as store_name FROM transactions t
     LEFT JOIN stores s ON s.store_id = t.store_id
     WHERE t.sync_status = 'pending' ORDER BY t.created_at ASC`
  );
}

export async function pushSyncQueue(): Promise<SyncResult> {
  if (!hasSupabase) {
    return {
      success: false,
      synced: 0,
      message: 'Configure EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans .env.local',
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, synced: 0, message: 'Client Supabase indisponible' };
  }

  const pending = await getPendingTransactions();
  if (pending.length === 0) {
    await recordHandshake();
    return { success: true, synced: 0, message: 'Rien à synchroniser' };
  }

  const payload = pending.map((t) => ({
    tx_id: t.tx_id,
    store_id: t.store_id,
    tx_type: t.tx_type,
    amount: t.amount,
    reference_no: t.reference_no,
    note: t.note,
    hash_signature: t.hash_signature,
    parent_hash: t.parent_hash,
    created_at: t.created_at,
  }));

  const { error } = await supabase.rpc('sync_transactions_batch', { payload });

  if (error) {
    return { success: false, synced: 0, message: error.message };
  }

  const db = await getDatabase();
  const ids = pending.map((t) => t.tx_id);
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE transactions SET sync_status = 'synced' WHERE tx_id IN (${placeholders})`,
    ids
  );
  await db.runAsync(`UPDATE stores SET sync_status = 'synced' WHERE sync_status = 'pending'`);
  await recordHandshake();

  return {
    success: true,
    synced: pending.length,
    message: `${pending.length} opération(s) synchronisée(s)`,
  };
}

async function recordHandshake(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_server_handshake', ?)`,
    [new Date().toISOString()]
  );
}

export async function getLastHandshake(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = 'last_server_handshake'`
  );
  return row?.value ?? null;
}
