import { getDatabase } from '@/database';
import { getSupabase } from '@/api/supabase';
import { hasSupabase } from '@/config/env';
import type { Store, Transaction } from '@/types';
import { pullFromServer } from './pullSync';

export interface SyncResult {
  success: boolean;
  synced: number;
  message: string;
}

export interface TransactionWithItems extends Transaction {
  items?: TransactionItem[];
}

export async function getPendingTransactions(): Promise<TransactionWithItems[]> {
  const db = await getDatabase();
  const txs = await db.getAllAsync<TransactionWithItems>(
    `SELECT t.*, s.name as store_name FROM transactions t
     LEFT JOIN stores s ON s.store_id = t.store_id
     WHERE t.sync_status = 'pending' ORDER BY t.created_at ASC`
  );
  if (txs.length === 0) return [];
  
  const txIds = txs.map(t => `'${t.tx_id}'`).join(',');
  const allItems = await db.getAllAsync<TransactionItem>(
    `SELECT * FROM transaction_items WHERE tx_id IN (${txIds})`
  );
  
  return txs.map(tx => ({
    ...tx,
    items: allItems.filter(i => i.tx_id === tx.tx_id)
  }));
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

  const pendingStores = await db.getAllAsync<Store>(
    `SELECT * FROM stores WHERE sync_status = 'pending' AND is_deleted = 0`
  );

  if (pendingStores.length > 0) {
    const { error: storeError } = await supabase
      .from('stores')
      .upsert(
        pendingStores.map((s) => ({
          store_id: s.store_id,
          rep_id: s.rep_id,
          name: s.name,
          neighborhood: s.neighborhood,
          contact_person: s.contact_person,
          phone: s.phone,
          address: s.address,
          current_balance: s.current_balance,
          total_delivered: s.total_delivered,
          total_collected: s.total_collected,
          last_delivery_date: s.last_delivery_date,
          last_payment_date: s.last_payment_date,
          sync_status: 'synced',
        })),
        { onConflict: 'store_id' }
      );

    if (storeError) {
      return { success: false, synced: 0, message: `Erreur sync magasins: ${storeError.message}` };
    }

    const storeIds = pendingStores.map((s) => s.store_id);
    const ph = storeIds.map(() => '?').join(',');
    await db.runAsync(
      `UPDATE stores SET sync_status = 'synced' WHERE store_id IN (${ph})`,
      storeIds
    );
  }

  const pending = await getPendingTransactions();
  if (pending.length === 0 && pendingStores.length === 0) {
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
    items: t.items?.map(i => ({
      item_id: i.item_id,
      product_id: i.product_id,
      quantity: i.quantity,
      price_at_time: i.price_at_time
    })) || []
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

  await recordHandshake();
  await pullFromServer();

  return {
    success: true,
    synced: pending.length + pendingStores.length,
    message: `${pending.length + pendingStores.length} élément(s) synchronisé(s)`,
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
