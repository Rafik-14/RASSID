import type { SQLiteDatabase } from 'expo-sqlite';

const STORES = [
  {
    store_id: '11111111-1111-1111-1111-111111111111',
    name: 'Épicerie du Port',
    neighborhood: 'Bab El Oued',
    contact_person: 'Rachid Benali',
    phone: '+213 555 12 34',
    address: '12 Rue du Port, Bab El Oued',
    current_balance: 12400,
    total_delivered: 84500,
    total_collected: 72100,
    last_delivery_date: '2026-05-20T10:00:00.000Z',
    last_payment_date: '2026-05-12T14:00:00.000Z',
  },
  {
    store_id: '22222222-2222-2222-2222-222222222222',
    name: 'Superette Meriem',
    neighborhood: 'Hussein Dey',
    contact_person: 'Meriem Haddad',
    phone: '+213 555 98 76',
    address: '45 Bd Colonel Amirouche',
    current_balance: 7800,
    total_delivered: 52000,
    total_collected: 44200,
    last_delivery_date: '2026-05-18T09:00:00.000Z',
    last_payment_date: '2026-05-14T11:00:00.000Z',
  },
  {
    store_id: '33333333-3333-3333-3333-333333333333',
    name: 'Mini Marché Boualem',
    neighborhood: 'Kouba',
    contact_person: 'Boualem Kaci',
    phone: '+213 555 44 22',
    address: '8 Cité Kouba',
    current_balance: 0,
    total_delivered: 31000,
    total_collected: 31000,
    last_delivery_date: '2026-05-21T08:00:00.000Z',
    last_payment_date: '2026-05-21T16:00:00.000Z',
  },
  {
    store_id: '44444444-4444-4444-4444-444444444444',
    name: 'Grocerie Haddad',
    neighborhood: 'El Harrach',
    contact_person: 'Karim Haddad',
    phone: '+213 555 33 11',
    address: '22 Rue des Frères',
    current_balance: 3200,
    total_delivered: 28000,
    total_collected: 24800,
    last_delivery_date: '2026-05-19T10:00:00.000Z',
    last_payment_date: '2026-05-08T12:00:00.000Z',
  },
  {
    store_id: '55555555-5555-5555-5555-555555555555',
    name: 'Boulangerie Kamel',
    neighborhood: 'Bir Mourad Raïs',
    contact_person: 'Kamel Boudiaf',
    phone: '+213 555 66 55',
    address: '5 Rue Didouche Mourad',
    current_balance: 5600,
    total_delivered: 41000,
    total_collected: 35400,
    last_delivery_date: '2026-05-17T07:00:00.000Z',
    last_payment_date: '2026-05-16T15:00:00.000Z',
  },
];

const PRODUCTS = [
  { product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', barcode: '6130001001001', name: 'Huile 1L', unit_price: 450, category_id: 1 },
  { product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', barcode: '6130001001002', name: 'Farine 1kg', unit_price: 120, category_id: 1 },
  { product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', barcode: '6130001001003', name: 'Sucre 1kg', unit_price: 180, category_id: 1 },
  { product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', barcode: '6130001001004', name: 'Lait 1L', unit_price: 150, category_id: 2 },
  { product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', barcode: '6130001001005', name: 'Pâtes 500g', unit_price: 95, category_id: 1 },
];

export async function seedDatabaseIfEmpty(db: SQLiteDatabase): Promise<void> {
  if (!__DEV__) return; // Never seed in production

  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM stores WHERE is_deleted = 0'
  );
  if ((row?.count ?? 0) > 0) return;

  for (const s of STORES) {
    await db.runAsync(
      `INSERT INTO stores (store_id, name, neighborhood, contact_person, phone, address,
        current_balance, total_delivered, total_collected, last_delivery_date, last_payment_date, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')`,
      [
        s.store_id, s.name, s.neighborhood, s.contact_person, s.phone, s.address,
        s.current_balance, s.total_delivered, s.total_collected,
        s.last_delivery_date, s.last_payment_date,
      ]
    );
  }

  for (const p of PRODUCTS) {
    await db.runAsync(
      `INSERT INTO products (product_id, barcode, name, unit_price, category_id) VALUES (?, ?, ?, ?, ?)`,
      [p.product_id, p.barcode, p.name, p.unit_price, p.category_id]
    );
  }

  // Sample history for Épicerie du Port
  const txs = [
    {
      tx_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      store_id: '11111111-1111-1111-1111-111111111111',
      tx_type: 1,
      amount: 8500,
      note: 'Huile · Farine · Sucre',
      created_at: '2026-05-22T09:30:00.000Z',
      hash: 'seed-hash-1',
    },
    {
      tx_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
      store_id: '11111111-1111-1111-1111-111111111111',
      tx_type: 2,
      amount: -5000,
      note: 'Paiement espèces — Reçu complet',
      created_at: '2026-05-18T11:00:00.000Z',
      hash: 'seed-hash-2',
    },
    {
      tx_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
      store_id: '11111111-1111-1111-1111-111111111111',
      tx_type: 3,
      amount: -1800,
      note: 'Lait périmé · 12 unités',
      created_at: '2026-05-15T14:00:00.000Z',
      hash: 'seed-hash-3',
    },
    {
      tx_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
      store_id: '11111111-1111-1111-1111-111111111111',
      tx_type: 4,
      amount: -500,
      note: 'Remise fidélité',
      created_at: '2026-05-15T14:05:00.000Z',
      hash: 'seed-hash-4',
    },
  ];

  let parent: string | null = null;
  for (const t of txs) {
    await db.runAsync(
      `INSERT INTO transactions (tx_id, store_id, tx_type, amount, note, hash_signature, parent_hash, sync_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
      [t.tx_id, t.store_id, t.tx_type, t.amount, t.note, t.hash, parent, t.created_at]
    );
    parent = t.hash;
  }

  await db.runAsync(
    `INSERT INTO sync_meta (key, value) VALUES ('last_server_handshake', ?)`,
    [new Date().toISOString()]
  );
}
