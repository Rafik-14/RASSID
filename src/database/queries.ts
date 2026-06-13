import { getDatabase } from './index';
import type {
  Store,
  Product,
  Transaction,
  TransactionItem,
  DashboardKpis,
  HistoryFilter,
  TxType,
} from '@/types';
import { isoNow } from '@/utils/dates';
import { computeTxHash } from '@/utils/hash';
import * as Crypto from 'expo-crypto';
import { getSession } from '@/api/supabase';

export async function getAllStores(search = ''): Promise<Store[]> {
  const db = await getDatabase();
  const q = `%${search.trim()}%`;
  return db.getAllAsync<Store>(
    `SELECT * FROM stores WHERE is_deleted = 0
     AND (name LIKE ? OR neighborhood LIKE ?)
     ORDER BY current_balance DESC, name ASC`,
    [q, q]
  );
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Store>(
    'SELECT * FROM stores WHERE store_id = ? AND is_deleted = 0',
    [storeId]
  );
}

export async function getOverdueStores(minDays = 10): Promise<Store[]> {
  const db = await getDatabase();
  return db.getAllAsync<Store>(
    `SELECT * FROM stores
     WHERE is_deleted = 0
       AND current_balance > 0
       AND last_payment_date IS NOT NULL
       AND CAST(julianday('now') - julianday(last_payment_date) AS INTEGER) >= ?
     ORDER BY current_balance DESC`,
    [minDays]
  );
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const db = await getDatabase();
  const receivables = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(current_balance), 0) as total FROM stores WHERE is_deleted = 0 AND current_balance > 0`
  );
  const stores = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM stores WHERE is_deleted = 0`
  );
  const today = new Date().toISOString().slice(0, 10);
  const cash = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM transactions
     WHERE tx_type = 2 AND date(created_at) = date(?)`,
    [today]
  );
  return {
    totalReceivables: receivables?.total ?? 0,
    activeStores: stores?.count ?? 0,
    cashCollectedToday: cash?.total ?? 0,
  };
}

export async function getMonthlyChartData(
  txType: TxType
): Promise<{ total: number; points: number[] }> {
  const db = await getDatabase();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const totalRow = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM transactions
     WHERE tx_type = ? AND created_at >= ?`,
    [txType, monthStart.toISOString()]
  );

  const rows = await db.getAllAsync<{ day: number; total: number }>(
    `SELECT CAST(strftime('%d', created_at) AS INTEGER) as day,
            SUM(ABS(amount)) as total
     FROM transactions WHERE tx_type = ? AND created_at >= ?
     GROUP BY date(created_at) ORDER BY created_at ASC LIMIT 10`,
    [txType, monthStart.toISOString()]
  );

  const points = rows.length > 0 ? rows.map((r) => r.total) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...points, 1);

  return {
    total: totalRow?.total ?? 0,
    points: points.map((v) => Math.round((v / max) * 100)),
  };
}

export async function getStoreTransactions(
  storeId: string,
  filter: HistoryFilter = 'all'
): Promise<Transaction[]> {
  const db = await getDatabase();
  let sql = 'SELECT * FROM transactions WHERE store_id = ?';
  const params: (string | number)[] = [storeId];

  if (filter === 'livraison') {
    sql += ' AND tx_type = 1';
  } else if (filter === 'paiement') {
    sql += ' AND tx_type = 2';
  } else if (filter === 'retour') {
    sql += ' AND tx_type = 3';
  } else if (filter === 'avoir') {
    sql += ' AND tx_type = 4';
  }

  sql += ' ORDER BY created_at DESC';
  return db.getAllAsync<Transaction>(sql, params);
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Product>('SELECT * FROM products WHERE barcode = ?', [barcode]);
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDatabase();
  return db.getAllAsync<Product>('SELECT * FROM products ORDER BY name');
}

async function getLastTxHash(storeId: string, dbOrTxn?: any): Promise<string | null> {
  const conn = dbOrTxn ?? await getDatabase();
  const row = await conn.getFirstAsync(
    `SELECT hash_signature FROM transactions WHERE store_id = ? ORDER BY created_at DESC LIMIT 1`,
    [storeId]
  ) as { hash_signature: string } | null;
  return row?.hash_signature ?? null;
}

async function getStoreByIdTxn(storeId: string, dbOrTxn: any): Promise<Store | null> {
  return dbOrTxn.getFirstAsync(
    'SELECT * FROM stores WHERE store_id = ? AND is_deleted = 0',
    [storeId]
  ) as Promise<Store | null>;
}

export interface CreateTransactionInput {
  storeId: string;
  txType: TxType;
  amount: number;
  note?: string;
  referenceNo?: string;
  items?: { productId: string; quantity: number; priceAtTime: number }[];
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const db = await getDatabase();
  let resultTx: Transaction | null = null;
  
  await db.withExclusiveTransactionAsync(async (txn: any) => {
    const session = await getSession();
    const repId = session?.user?.id ?? '';
    const txId = Crypto.randomUUID();
    const createdAt = isoNow();
    const parentHash = await getLastTxHash(input.storeId, txn);
    const signedAmount =
      input.txType === 1 ? Math.abs(input.amount) : -Math.abs(input.amount);

    const hash = await computeTxHash(
      txId,
      input.storeId,
      input.txType,
      signedAmount,
      createdAt,
      parentHash
    );

    // Use txn instead of db for the write operations to avoid deadlock
    await txn.runAsync(
      `INSERT INTO transactions (tx_id, store_id, rep_id, tx_type, amount, reference_no, note,
        hash_signature, parent_hash, sync_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        txId,
        input.storeId,
        repId,
        input.txType,
        signedAmount,
        input.referenceNo ?? null,
        input.note ?? null,
        hash,
        parentHash,
        createdAt,
      ]
    );

    if (input.items?.length) {
      for (const item of input.items) {
        await txn.runAsync(
          `INSERT INTO transaction_items (item_id, tx_id, product_id, quantity, price_at_time)
           VALUES (?, ?, ?, ?, ?)`,
          [Crypto.randomUUID(), txId, item.productId, item.quantity, item.priceAtTime]
        );
      }
    }

    const balanceDelta = signedAmount;
    const store = await getStoreByIdTxn(input.storeId, txn);
    if (store) {
      const newBalance = store.current_balance + balanceDelta;
      if (newBalance < 0) {
        throw new Error('Le montant du paiement ne peut pas dépasser la dette actuelle.');
      }
      let lastDelivery = store.last_delivery_date;
      let lastPayment = store.last_payment_date;
      let totalDelivered = store.total_delivered;
      let totalCollected = store.total_collected;

      if (input.txType === 1) {
        lastDelivery = createdAt;
        totalDelivered += Math.abs(signedAmount);
      } else if (input.txType === 2) {
        lastPayment = createdAt;
        totalCollected += Math.abs(signedAmount);
      }

      await txn.runAsync(
        `UPDATE stores SET current_balance = ?, last_delivery_date = ?, last_payment_date = ?,
          total_delivered = ?, total_collected = ?, sync_status = 'pending'
         WHERE store_id = ?`,
        [newBalance, lastDelivery, lastPayment, totalDelivered, totalCollected, input.storeId]
      );
    }

    const tx = await txn.getFirstAsync('SELECT * FROM transactions WHERE tx_id = ?', [
      txId,
    ]);
    resultTx = tx as Transaction;
  });

  return resultTx!;
}

export async function voidTransaction(originalTx: Transaction): Promise<Transaction> {
  const db = await getDatabase();
  let resultTx: Transaction | null = null;
  
  await db.withExclusiveTransactionAsync(async (txn: any) => {
    // Check if already voided
    const existing = await txn.getFirstAsync('SELECT * FROM transactions WHERE reference_no = ?', [`VOID-${originalTx.tx_id}`]);
    if (existing) throw new Error('Transaction déjà annulée.');

    const session = await getSession();
    const repId = session?.user?.id ?? '';
    const txId = Crypto.randomUUID();
    const createdAt = isoNow();
    const parentHash = await getLastTxHash(originalTx.store_id, txn);
    
    const reverseAmount = -originalTx.amount;

    const hash = await computeTxHash(
      txId,
      originalTx.store_id,
      originalTx.tx_type,
      reverseAmount,
      createdAt,
      parentHash
    );

    await txn.runAsync(
      `INSERT INTO transactions (tx_id, store_id, rep_id, tx_type, amount, reference_no, note,
        hash_signature, parent_hash, sync_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        txId,
        originalTx.store_id,
        repId,
        originalTx.tx_type,
        reverseAmount,
        `VOID-${originalTx.tx_id}`,
        `Annulation`,
        hash,
        parentHash,
        createdAt,
      ]
    );

    const balanceDelta = reverseAmount;
    const store = await getStoreByIdTxn(originalTx.store_id, txn);
    if (store) {
      const newBalance = store.current_balance + balanceDelta;
      if (newBalance < 0) {
        throw new Error('L\'annulation entraînerait un solde négatif.');
      }
      await txn.runAsync(
        `UPDATE stores SET current_balance = ?, sync_status = 'pending' WHERE store_id = ?`,
        [newBalance, originalTx.store_id]
      );
    }
    
    resultTx = await txn.getFirstAsync('SELECT * FROM transactions WHERE tx_id = ?', [txId]);
  });
  
  return resultTx as unknown as Transaction;
}

export async function getTransactionItems(txId: string): Promise<TransactionItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<TransactionItem>(
    `SELECT ti.*, p.name as product_name FROM transaction_items ti
     LEFT JOIN products p ON p.product_id = ti.product_id WHERE ti.tx_id = ?`,
    [txId]
  );
}

export async function getPendingSyncCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM transactions WHERE sync_status = 'pending'`
  );
  return row?.count ?? 0;
}

export async function createStore(data: {
  name: string;
  neighborhood: string;
  contact_person: string;
  phone: string;
  address?: string;
}): Promise<Store> {
  const db = await getDatabase();
  const storeId = Crypto.randomUUID();
  const session = await getSession();
  const repId = session?.user?.id ?? '';
  await db.runAsync(
    `INSERT INTO stores (store_id, rep_id, name, neighborhood, contact_person, phone, address, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [storeId, repId, data.name, data.neighborhood, data.contact_person, data.phone, data.address ?? '']
  );
  return (await getStoreById(storeId))!;
}

export async function createProduct(data: {
  name: string;
  barcode: string;
  unitPrice: number;
  categoryId?: number;
}): Promise<Product> {
  const db = await getDatabase();
  const productId = Crypto.randomUUID();
  await db.runAsync(
    `INSERT INTO products (product_id, barcode, name, unit_price, category_id)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, data.barcode, data.name, data.unitPrice, data.categoryId ?? 0]
  );
  const row = await db.getFirstAsync<Product>('SELECT * FROM products WHERE product_id = ?', [productId]);
  return row!;
}

export async function updateStore(storeId: string, data: {
  name: string;
  neighborhood: string;
  contact_person: string;
  phone: string;
  address?: string;
}): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE stores SET name = ?, neighborhood = ?, contact_person = ?, phone = ?, address = ?,
     sync_status = 'pending' WHERE store_id = ?`,
    [data.name, data.neighborhood, data.contact_person, data.phone, data.address ?? '', storeId]
  );
}

export async function softDeleteStore(storeId: string): Promise<void> {
  const db = await getDatabase();
  const store = await getStoreById(storeId);
  if (store && store.current_balance > 0) {
    throw new Error('Impossible de supprimer un magasin avec une dette en cours.');
  }
  await db.runAsync(
    `UPDATE stores SET is_deleted = 1, sync_status = 'pending' WHERE store_id = ?`,
    [storeId]
  );
}

export async function getGlobalTransactions(txType: number, limit: number = 100): Promise<Transaction[]> {
  const db = await getDatabase();
  return db.getAllAsync<Transaction>(
    `SELECT t.*, s.name as store_name 
     FROM transactions t
     LEFT JOIN stores s ON t.store_id = s.store_id
     WHERE t.tx_type = ?
     ORDER BY t.created_at DESC
     LIMIT ?`,
    [txType, limit]
  );
}
