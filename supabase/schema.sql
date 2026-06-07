-- RASSID Supabase schema (Phase 1 sync)
-- Run in Supabase SQL editor after creating your project

CREATE TABLE IF NOT EXISTS stores (
  store_id UUID PRIMARY KEY,
  rep_id TEXT DEFAULT '',
  name VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(100) DEFAULT '',
  contact_person VARCHAR(100) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  address TEXT DEFAULT '',
  current_balance INTEGER NOT NULL DEFAULT 0,
  total_delivered INTEGER NOT NULL DEFAULT 0,
  total_collected INTEGER NOT NULL DEFAULT 0,
  last_delivery_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  sync_status VARCHAR(20) DEFAULT 'pending',
  is_deleted BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit_price INTEGER NOT NULL,
  category_id SMALLINT DEFAULT 0,
  photo_url TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  tx_id UUID PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(store_id),
  rep_id TEXT DEFAULT '',
  tx_type SMALLINT NOT NULL,
  amount INTEGER NOT NULL,
  reference_no VARCHAR(50),
  note TEXT,
  hash_signature TEXT NOT NULL,
  parent_hash TEXT,
  sync_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_items (
  item_id UUID PRIMARY KEY,
  tx_id UUID NOT NULL REFERENCES transactions(tx_id),
  product_id UUID NOT NULL REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  price_at_time INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tx_store ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Batch sync RPC (called from mobile app)
CREATE OR REPLACE FUNCTION sync_transactions_batch(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
  inserted INT := 0;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(payload)
  LOOP
    INSERT INTO transactions (
      tx_id, store_id, rep_id, tx_type, amount, reference_no, note,
      hash_signature, parent_hash, sync_status, created_at
    ) VALUES (
      (item->>'tx_id')::UUID,
      (item->>'store_id')::UUID,
      auth.uid()::TEXT,
      (item->>'tx_type')::SMALLINT,
      (item->>'amount')::INTEGER,
      item->>'reference_no',
      item->>'note',
      item->>'hash_signature',
      item->>'parent_hash',
      'synced',
      (item->>'created_at')::TIMESTAMPTZ
    )
    ON CONFLICT (tx_id) DO NOTHING;

    IF FOUND THEN
      inserted := inserted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('inserted', inserted);
END;
$$;

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Stores: users can only access their own stores
CREATE POLICY "Users can view their own stores"
  ON stores FOR SELECT
  USING (rep_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own stores"
  ON stores FOR INSERT
  WITH CHECK (rep_id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own stores"
  ON stores FOR UPDATE
  USING (rep_id = auth.uid()::TEXT);

-- Transactions: users can only access their own
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (rep_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (rep_id = auth.uid()::TEXT);

-- Transaction items: access via transaction ownership
CREATE POLICY "Users can view their own transaction items"
  ON transaction_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.tx_id = transaction_items.tx_id
      AND t.rep_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can insert their own transaction items"
  ON transaction_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.tx_id = transaction_items.tx_id
      AND t.rep_id = auth.uid()::TEXT
    )
  );

-- Products: all authenticated users can read, only admins can write
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

