export const SCHEMA_VERSION = 1;

export const DDL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS stores (
  store_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  current_balance INTEGER NOT NULL DEFAULT 0,
  total_delivered INTEGER NOT NULL DEFAULT 0,
  total_collected INTEGER NOT NULL DEFAULT 0,
  last_delivery_date TEXT,
  last_payment_date TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_balance ON stores(current_balance DESC);

CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY NOT NULL,
  barcode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  category_id INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

CREATE TABLE IF NOT EXISTS transactions (
  tx_id TEXT PRIMARY KEY NOT NULL,
  store_id TEXT NOT NULL,
  tx_type INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  reference_no TEXT,
  note TEXT,
  hash_signature TEXT NOT NULL,
  parent_hash TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

CREATE INDEX IF NOT EXISTS idx_tx_store ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_sync ON transactions(sync_status);

CREATE TABLE IF NOT EXISTS transaction_items (
  item_id TEXT PRIMARY KEY NOT NULL,
  tx_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_time INTEGER NOT NULL,
  FOREIGN KEY (tx_id) REFERENCES transactions(tx_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS media (
  media_id TEXT PRIMARY KEY NOT NULL,
  tx_id TEXT NOT NULL,
  local_path TEXT,
  cloud_url TEXT,
  media_type TEXT NOT NULL,
  compressed INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (tx_id) REFERENCES transactions(tx_id)
);

CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
