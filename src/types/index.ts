export type TxType = 1 | 2 | 3 | 4; // Livraison, Paiement, Retour, Avoir

export const TX_LABELS: Record<TxType, string> = {
  1: 'Livraison',
  2: 'Paiement',
  3: 'Retour',
  4: 'Avoir',
};

export type SyncStatus = 'pending' | 'synced' | 'conflict';

export interface Store {
  store_id: string;
  rep_id: string;
  name: string;
  neighborhood: string;
  contact_person: string;
  phone: string;
  address: string;
  current_balance: number;
  total_delivered: number;
  total_collected: number;
  last_delivery_date: string | null;
  last_payment_date: string | null;
  sync_status: SyncStatus;
  is_deleted: number;
}

export interface Product {
  product_id: string;
  barcode: string;
  name: string;
  unit_price: number;
  category_id: number;
  photo_url: string | null;
}

export interface Transaction {
  tx_id: string;
  store_id: string;
  rep_id: string;
  tx_type: TxType;
  amount: number;
  reference_no: string | null;
  note: string | null;
  hash_signature: string;
  parent_hash: string | null;
  sync_status: SyncStatus;
  created_at: string;
  store_name?: string;
}

export interface TransactionItem {
  item_id: string;
  tx_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  product_name?: string;
}

export interface DashboardKpis {
  totalReceivables: number;
  activeStores: number;
  cashCollectedToday: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export type HistoryFilter = 'all' | 'livraison' | 'paiement' | 'retour' | 'avoir';

export type OperationType = 'livraison' | 'paiement' | 'retour' | 'avoir';

export const operationToTxType: Record<OperationType, TxType> = {
  livraison: 1,
  paiement: 2,
  retour: 3,
  avoir: 4,
};
