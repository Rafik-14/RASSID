import { getDatabase } from '@/database';
import { getSupabase } from '@/api/supabase';
import { hasSupabase } from '@/config/env';
import { getLastHandshake } from './syncService';

export async function pullFromServer(): Promise<{ pulled: number; message: string }> {
  if (!hasSupabase) return { pulled: 0, message: 'Supabase non configuré' };

  const supabase = getSupabase();
  if (!supabase) return { pulled: 0, message: 'Client indisponible' };

  const db = await getDatabase();
  const lastSync = await getLastHandshake();
  let pulled = 0;

  // Pull products (always full sync — product catalog is small)
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*');

  if (!prodError && products) {
    for (const p of products) {
      await db.runAsync(
        `INSERT OR REPLACE INTO products (product_id, barcode, name, unit_price, category_id)
         VALUES (?, ?, ?, ?, ?)`,
        [p.product_id, p.barcode, p.name, p.unit_price, p.category_id ?? 0]
      );
    }
    pulled += products.length;
  }

  // Pull stores updated since last sync
  let storeQuery = supabase.from('stores').select('*');
  if (lastSync) {
    storeQuery = storeQuery.gte('updated_at', lastSync);
  }
  const { data: stores, error: storeError } = await storeQuery;

  if (!storeError && stores) {
    for (const s of stores) {
      await db.runAsync(
        `INSERT OR REPLACE INTO stores
         (store_id, rep_id, name, neighborhood, contact_person, phone, address,
          current_balance, total_delivered, total_collected,
          last_delivery_date, last_payment_date, sync_status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
        [s.store_id, s.rep_id ?? '', s.name, s.neighborhood, s.contact_person, s.phone,
         s.address, s.current_balance, s.total_delivered, s.total_collected,
         s.last_delivery_date, s.last_payment_date, s.is_deleted ? 1 : 0]
      );
    }
    pulled += stores.length;
  }

  return { pulled, message: `${pulled} élément(s) récupéré(s)` };
}
