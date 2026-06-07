# RASSID — Detailed Implementation Guide

> **Purpose:** This document provides step-by-step, code-level instructions for making the RASSID app production-ready. Each task includes exact file paths, line numbers, code to change, and new files to create.
>
> **Project root:** `c:\Users\surface\Desktop\main\RASSID3.0\RASSID3.0\RASSID\RASSID`
>
> **Tech stack:** React Native (Expo SDK 54), TypeScript, SQLite (expo-sqlite), Supabase, React Navigation

---

## Phase 1 — Critical Blockers

---

### 1.1 Gate Seed Data Behind `__DEV__`

**File:** `src/database/seed.ts`

The function `seedDatabaseIfEmpty()` inserts 5 fake stores, 5 products, and 4 sample transactions on every fresh install. This must only run in development.

**Change:** Wrap the entire function body with a `__DEV__` check.

```diff
 export async function seedDatabaseIfEmpty(db: SQLiteDatabase): Promise<void> {
+  if (!__DEV__) return; // Never seed in production
+
   const row = await db.getFirstAsync<{ count: number }>(
     'SELECT COUNT(*) as count FROM stores WHERE is_deleted = 0'
   );
   if ((row?.count ?? 0) > 0) return;
   // ... rest stays the same
 }
```

> **Note:** `__DEV__` is a global boolean provided by React Native. It's `true` in development and `false` in production builds.

---

### 1.2 Remove Hardcoded Fallback Values

#### 1.2.1 DashboardScreen.tsx (`src/screens/DashboardScreen.tsx`)

**Lines 147-161:** Replace fake fallback values with `0`.

```diff
 <ChartCard
   title="LIVRAISONS"
-  trend={8.4}
-  amount={livraisonChart.total || 127000}
+  trend={0}
+  amount={livraisonChart.total}
   subtitle="marchandises livrées ce mois"
-  data={livraisonChart.points.length ? livraisonChart.points : [40, 52, 38, 60, 48, 70, 65]}
+  data={livraisonChart.points}
   color={c.red}
 />

 <ChartCard
   title="PAIEMENTS REÇUS"
-  trend={-4.1}
-  amount={paiementChart.total || 98000}
+  trend={0}
+  amount={paiementChart.total}
   subtitle="encaissé ce mois"
-  data={paiementChart.points.length ? paiementChart.points : [20, 32, 28, 36, 40, 48, 52]}
+  data={paiementChart.points}
   color={c.green}
 />
```

**Also:** The `ChartCard` component (`src/components/ChartCard.tsx`) has `trend` as a prop but never renders the trend badge (the `trendBadge` / `trendText` styles exist but are dead code). Either:
- **Option A:** Remove the `trend` prop entirely from `ChartCardProps` and delete the dead styles at lines 116-124
- **Option B:** Actually render the trend badge in the JSX. Add this after the title row (line 72):

```tsx
<View style={[styles.trendBadge, { backgroundColor: trendBg }]}>
  <Text style={[styles.trendText, { color: trendColor }]}>{trendText}</Text>
</View>
```

To compute real trends, you'd need to compare current period vs previous period data. For now, just remove the prop or pass `0`.

#### 1.2.2 DeliveriesScreen.tsx (`src/screens/DeliveriesScreen.tsx`)

**Line 40:** Remove the fake fallback.

```diff
-<AnimatedNumber value={monthTotal || 184500} style={styles.amountText} />
+<AnimatedNumber value={monthTotal} style={styles.amountText} />
```

#### 1.2.3 PaymentsScreen.tsx (`src/screens/PaymentsScreen.tsx`)

**Line 40:** Remove the fake fallback.

```diff
-<AnimatedNumber value={monthTotal || 96200} style={styles.amountText} />
+<AnimatedNumber value={monthTotal} style={styles.amountText} />
```

#### 1.2.4 KpiRow.tsx (`src/components/KpiRow.tsx`)

**Line 45:** The text `"2 en alerte"` is hardcoded. Make it dynamic.

**Step 1:** Add `overdueCount` to the `KpiRowProps` interface:

```diff
 interface KpiRowProps {
   totalDebt: number;
   storesCount: number;
   collectedToday: number;
+  overdueCount: number;
   onPressDebt: () => void;
   onPressStores: () => void;
   onPressCollected: () => void;
 }
```

**Step 2:** Destructure it and use it:

```diff
 export function KpiRow({
   totalDebt,
   storesCount,
   collectedToday,
+  overdueCount,
   onPressDebt,
   onPressStores,
   onPressCollected,
 }: KpiRowProps) {
```

```diff
-<Text style={styles.storesSubText}>2 en alerte</Text>
+<Text style={styles.storesSubText}>
+  {overdueCount > 0 ? `${overdueCount} en alerte` : 'Aucune alerte'}
+</Text>
```

**Step 3:** In `DashboardScreen.tsx`, pass the prop (after the existing `overdueCount` variable at line 73):

```diff
 <KpiRow
   totalDebt={kpis.totalReceivables}
   storesCount={kpis.activeStores}
   collectedToday={kpis.cashCollectedToday}
+  overdueCount={overdueCount}
   onPressDebt={() => navigation.navigate('OverdueAlerts')}
   onPressStores={() => navigation.navigate('Stores' as any)}
   onPressCollected={() => navigation.navigate('Payments' as any)}
 />
```

---

### 1.3 Add Global Error Boundary

**Create new file:** `src/components/ErrorBoundary.tsx`

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { c } from './tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: Send to crash reporting (Sentry) in Phase 5
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Une erreur est survenue</Text>
          <Text style={styles.subtitle}>
            L'application a rencontré un problème inattendu.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorText}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#F0F0F0',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(240,240,240,0.40)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#FF4D4D',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#7FE300',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#111111',
  },
});
```

**Then in `App.tsx`**, wrap the main app content. Add the import at the top:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
```

Then wrap `<RootNavigator />` (around line 210):

```diff
 <AppProvider>
   <NavigationContainer theme={navTheme}>
-    <RootNavigator />
+    <ErrorBoundary>
+      <RootNavigator />
+    </ErrorBoundary>
   </NavigationContainer>
 </AppProvider>
```

---

### 1.4 Add try/catch to All Screen Data Loading

Every screen that loads data in a `useCallback` → `useFocusEffect` pattern needs error handling. Here's the pattern to apply to **every** screen:

**Template:**

```tsx
const load = useCallback(async () => {
  try {
    // ... existing data loading code
  } catch (e: any) {
    console.error('Load error:', e);
    Toast.show({
      type: 'error',
      text1: 'Erreur de chargement',
      text2: e.message || 'Impossible de charger les données.',
    });
  }
}, [/* deps */]);
```

**Apply to these files — wrap the `load()` function body in try/catch:**

| File | Function | Line |
|------|----------|------|
| `src/screens/DashboardScreen.tsx` | `load` | ~37 |
| `src/screens/StoresScreen.tsx` | `load` | find the `useCallback` |
| `src/screens/StoreProfileScreen.tsx` | `load` | find the `useCallback` |
| `src/screens/StoreHistoryScreen.tsx` | `load` | ~60 |
| `src/screens/OverdueAlertsScreen.tsx` | `load` | ~31 |
| `src/screens/NewOperationScreen.tsx` | `load` | ~84 |
| `src/screens/DeliveriesScreen.tsx` | inside `useFocusEffect` | ~22 |
| `src/screens/PaymentsScreen.tsx` | inside `useFocusEffect` | ~22 |

Make sure `Toast` from `react-native-toast-message` is imported in each file.

---

### 1.5 Fix Sync Error Handling in DashboardScreen

**File:** `src/screens/DashboardScreen.tsx`, lines 63-66

```diff
 const handleSync = async () => {
-  const msg = await syncNow();
-  Toast.show({ type: 'success', text1: 'Synchronisation', text2: msg });
+  try {
+    const msg = await syncNow();
+    Toast.show({ type: 'success', text1: 'Synchronisation', text2: msg });
+  } catch (e: any) {
+    Toast.show({
+      type: 'error',
+      text1: 'Échec de la synchronisation',
+      text2: e.message || 'Erreur inconnue',
+    });
+  }
 };
```

---

### 1.6 EAS Build Configuration

#### 1.6.1 Get a real EAS project ID

Run this command in the project root:

```bash
npx eas-cli init
```

This will create a real project ID. Then update `app.json` line 57:

```diff
 "extra": {
   "eas": {
-    "projectId": "rassid-distribution-amine"
+    "projectId": "<THE-REAL-UUID-FROM-EAS-INIT>"
   }
 }
```

#### 1.6.2 Create `eas.json`

**Create new file:** `eas.json` in the project root:

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json"
      }
    }
  }
}
```

#### 1.6.3 Fix splash screen background

**File:** `app.json`, the splash background is `#FAF8F4` (light) but the status bar is `"light"` (white text). This causes white-on-white text. Change splash background to match the dark theme:

```diff
 "splash": {
   "image": "./assets/splash-icon.png",
   "resizeMode": "contain",
-  "backgroundColor": "#FAF8F4"
+  "backgroundColor": "#0A0A0A"
 },
```

Also update the adaptive icon background for Android:

```diff
 "adaptiveIcon": {
   "foregroundImage": "./assets/adaptive-icon.png",
-  "backgroundColor": "#FAF8F4"
+  "backgroundColor": "#0A0A0A"
 },
```

---

### 1.7 Wrap Transaction Creation in a Database Transaction

**File:** `src/database/queries.ts`, function `createTransaction` (~line 160)

The current code does separate `INSERT` (transaction) + `UPDATE` (store balance) without atomicity. Wrap in `db.withTransactionAsync()`:

```diff
 export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
   const db = await getDatabase();
   const txId = Crypto.randomUUID();
   const createdAt = isoNow();
   const parentHash = await getLastTxHash(input.storeId);
   const signedAmount =
     input.txType === 1 ? Math.abs(input.amount) : -Math.abs(input.amount);

   const hash = await computeTxHash(
     txId, input.storeId, input.txType, signedAmount, createdAt, parentHash
   );

+  await db.withTransactionAsync(async () => {
     await db.runAsync(
       `INSERT INTO transactions (tx_id, store_id, tx_type, amount, reference_no, note,
         hash_signature, parent_hash, sync_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
       [txId, input.storeId, input.txType, signedAmount,
        input.referenceNo ?? null, input.note ?? null, hash, parentHash, createdAt]
     );

     if (input.items?.length) {
       for (const item of input.items) {
         await db.runAsync(
           `INSERT INTO transaction_items (item_id, tx_id, product_id, quantity, price_at_time)
            VALUES (?, ?, ?, ?, ?)`,
           [Crypto.randomUUID(), txId, item.productId, item.quantity, item.priceAtTime]
         );
       }
     }

     const balanceDelta = signedAmount;
     const store = await getStoreById(input.storeId);
     if (store) {
       const newBalance = store.current_balance + balanceDelta;
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

       await db.runAsync(
         `UPDATE stores SET current_balance = ?, last_delivery_date = ?, last_payment_date = ?,
           total_delivered = ?, total_collected = ?, sync_status = 'pending'
          WHERE store_id = ?`,
         [newBalance, lastDelivery, lastPayment, totalDelivered, totalCollected, input.storeId]
       );
     }
+  });

   const tx = await db.getFirstAsync<Transaction>(
     'SELECT * FROM transactions WHERE tx_id = ?', [txId]
   );
   return tx!;
 }
```

---

## Phase 2 — Security & Authentication

---

### 2.1 Supabase Authentication

#### 2.1.1 Create a Login Screen

**Create new file:** `src/screens/LoginScreen.tsx`

This screen should:
- Show the RASSID logo at the top
- Have a phone number input (Algerian format: `+213 5XX XXX XXX` or `05XX XXX XXX`)
- A "Send OTP" button that calls `supabase.auth.signInWithOtp({ phone })`
- An OTP input that appears after sending
- A "Verify" button that calls `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`
- Store the session in SecureStore
- On success, navigate to the main app

**Alternative (simpler for MVP):** Email/password login:

```tsx
// In src/api/supabase.ts, the client already has persistSession: true
// Just add login methods:

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
```

#### 2.1.2 Add `rep_id` to Data Model

**File:** `src/types/index.ts` — Add `rep_id` field to Transaction and Store:

```diff
 export interface Transaction {
   tx_id: string;
   store_id: string;
+  rep_id: string;
   tx_type: TxType;
   // ...
 }

 export interface Store {
   store_id: string;
+  rep_id: string;
   name: string;
   // ...
 }
```

**File:** `src/database/schema.ts` (wherever DDL is) — add `rep_id TEXT` column to `stores` and `transactions` tables.

**File:** `src/database/queries.ts` — Include `rep_id` in all INSERT statements. Get it from Supabase auth session or from SecureStore.

#### 2.1.3 Integrate Login into App.tsx

In `App.tsx`, after the profile check and before biometric auth, check for Supabase session:

```tsx
// After profile setup check
if (hasSupabase) {
  const session = await getSession();
  if (!session) {
    setShowLogin(true);
    setReady(true);
    return;
  }
}
```

Add a `LoginScreen` render branch similar to `ProfileSetupScreen`.

---

### 2.2 Row-Level Security (RLS)

**File:** `supabase/schema.sql` — Add these at the end:

```sql
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
```

Also add `rep_id TEXT` column to `stores` and `transactions` tables in the schema:

```sql
ALTER TABLE stores ADD COLUMN IF NOT EXISTS rep_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS rep_id TEXT;
```

Update the `sync_transactions_batch` RPC to include `rep_id`:

```diff
 INSERT INTO transactions (
-  tx_id, store_id, tx_type, amount, reference_no, note,
+  tx_id, store_id, rep_id, tx_type, amount, reference_no, note,
   hash_signature, parent_hash, sync_status, created_at
 ) VALUES (
   (item->>'tx_id')::UUID,
   (item->>'store_id')::UUID,
+  auth.uid()::TEXT,
   (item->>'tx_type')::SMALLINT,
```

---

### 2.3 Root/Jailbreak Detection

**File:** `src/services/securityService.ts`

First, install the package:

```bash
npx expo install expo-device
```

Then update `isDeviceCompromised()`:

```diff
+import * as Device from 'expo-device';

-/** Placeholder for root/jailbreak detection */
-export function isDeviceCompromised(): boolean {
-  return false;
-}
+export function isDeviceCompromised(): boolean {
+  // expo-device provides basic checks
+  // For deeper root/jailbreak detection, use a native module like jail-monkey
+  // in a production dev build
+  if (!Device.isDevice) {
+    // Running on emulator/simulator — allow in dev, block in prod
+    return !__DEV__;
+  }
+  return false;
+}
```

> **Note:** For true root/jailbreak detection, install `jail-monkey` in a production dev build. This requires ejecting from Expo Go.

---

### 2.4 Biometric Auth Retry

**File:** `App.tsx`, the `!authed` branch (~line 200) currently shows a dead-end screen. Add a retry button:

```diff
 if (!authed) {
   return (
     <SafeAreaProvider onLayout={onLayout}>
       <View style={styles.splash}>
         <Text style={styles.logo}>RASSID</Text>
         <Text style={styles.lock}>Authentification requise</Text>
+        <TouchableOpacity
+          style={styles.syncButton}
+          onPress={async () => {
+            const ok = await authenticateUser();
+            setAuthed(ok);
+          }}
+          activeOpacity={0.8}
+        >
+          <Text style={styles.syncButtonText}>Réessayer</Text>
+        </TouchableOpacity>
       </View>
       <StatusBar style="light" />
     </SafeAreaProvider>
   );
 }
```

---

## Phase 3 — Data & Sync Infrastructure

---

### 3.1 Database Migration System

**File:** `src/database/index.ts`

Replace the current simple init with a migration system:

```ts
import * as SQLite from 'expo-sqlite';
import { seedDatabaseIfEmpty } from './seed';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const CURRENT_VERSION = 2; // Increment this when adding migrations

// Each migration runs sequentially
const MIGRATIONS: Record<number, string[]> = {
  1: [
    // Original schema — already in DDL, this is just for reference
    // Applied by DDL string for fresh installs
  ],
  2: [
    // Example: add rep_id column
    `ALTER TABLE stores ADD COLUMN IF NOT EXISTS rep_id TEXT DEFAULT ''`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS rep_id TEXT DEFAULT ''`,
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
  const currentVersion = versionRow?.user_version ?? 0;

  // Run migrations
  if (currentVersion < CURRENT_VERSION) {
    for (let v = currentVersion + 1; v <= CURRENT_VERSION; v++) {
      const stmts = MIGRATIONS[v];
      if (stmts) {
        for (const stmt of stmts) {
          try {
            await db.execAsync(stmt);
          } catch (e) {
            console.warn(`Migration v${v} statement failed:`, e);
          }
        }
      }
    }
    await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
  }

  await seedDatabaseIfEmpty(db);
  dbInstance = db;
  return db;
}

export function resetDatabaseInstance(): void {
  dbInstance = null;
}
```

> **Important:** Import the `DDL` string from `./schema` as before. The `MIGRATIONS` object only contains incremental changes. For fresh installs, the DDL creates everything at the latest version, then `PRAGMA user_version` is set to `CURRENT_VERSION`.

---

### 3.2 Sync Stores to Supabase

**File:** `src/services/syncService.ts`

Add store sync to `pushSyncQueue()`:

```diff
 export async function pushSyncQueue(): Promise<SyncResult> {
   // ... existing checks ...

+  // 1. Sync stores first
+  const db = await getDatabase();
+  const pendingStores = await db.getAllAsync<Store>(
+    `SELECT * FROM stores WHERE sync_status = 'pending' AND is_deleted = 0`
+  );
+
+  if (pendingStores.length > 0) {
+    const { error: storeError } = await supabase
+      .from('stores')
+      .upsert(
+        pendingStores.map(s => ({
+          store_id: s.store_id,
+          name: s.name,
+          neighborhood: s.neighborhood,
+          contact_person: s.contact_person,
+          phone: s.phone,
+          address: s.address,
+          current_balance: s.current_balance,
+          total_delivered: s.total_delivered,
+          total_collected: s.total_collected,
+          last_delivery_date: s.last_delivery_date,
+          last_payment_date: s.last_payment_date,
+          sync_status: 'synced',
+        })),
+        { onConflict: 'store_id' }
+      );
+
+    if (storeError) {
+      return { success: false, synced: 0, message: `Erreur sync magasins: ${storeError.message}` };
+    }
+
+    // Mark stores as synced only after confirmed upload
+    const storeIds = pendingStores.map(s => s.store_id);
+    const ph = storeIds.map(() => '?').join(',');
+    await db.runAsync(
+      `UPDATE stores SET sync_status = 'synced' WHERE store_id IN (${ph})`,
+      storeIds
+    );
+  }

+  // 2. Sync transactions (existing logic)
   const pending = await getPendingTransactions();
   // ... rest of existing code ...
```

Also **remove** the blanket store sync at the end:

```diff
-  await db.runAsync(`UPDATE stores SET sync_status = 'synced' WHERE sync_status = 'pending'`);
```

---

### 3.3 Add Pull Sync (Server → Device)

**Create new file:** `src/services/pullSync.ts`

```ts
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
         (store_id, name, neighborhood, contact_person, phone, address,
          current_balance, total_delivered, total_collected,
          last_delivery_date, last_payment_date, sync_status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
        [s.store_id, s.name, s.neighborhood, s.contact_person, s.phone,
         s.address, s.current_balance, s.total_delivered, s.total_collected,
         s.last_delivery_date, s.last_payment_date, s.is_deleted ? 1 : 0]
      );
    }
    pulled += stores.length;
  }

  return { pulled, message: `${pulled} élément(s) récupéré(s)` };
}
```

Then call it from `pushSyncQueue` after the push succeeds, or from `AppContext.refresh()`.

---

### 3.4 Move getOverdueStores to SQL

**File:** `src/database/queries.ts`

The current `getOverdueStores()` loads ALL stores then filters in JS. Replace with SQL:

```diff
 export async function getOverdueStores(minDays = 10): Promise<Store[]> {
-  const stores = await getAllStores();
-  const now = Date.now();
-  return stores
-    .filter((s) => {
-      if (s.current_balance <= 0 || !s.last_payment_date) return false;
-      const days = Math.floor(
-        (now - new Date(s.last_payment_date).getTime()) / (1000 * 60 * 60 * 24)
-      );
-      return days >= minDays;
-    })
-    .sort((a, b) => b.current_balance - a.current_balance);
+  const db = await getDatabase();
+  return db.getAllAsync<Store>(
+    `SELECT * FROM stores
+     WHERE is_deleted = 0
+       AND current_balance > 0
+       AND last_payment_date IS NOT NULL
+       AND CAST(julianday('now') - julianday(last_payment_date) AS INTEGER) >= ?
+     ORDER BY current_balance DESC`,
+    [minDays]
+  );
 }
```

---

## Phase 4 — Feature Completeness

---

### 4.1 Store Editing

**Create new screen:** `src/screens/EditStoreScreen.tsx`

- Reuse the same form layout as `NewStoreScreen.tsx`
- Accept `storeId` as a route param
- Load store data on mount and pre-fill the form
- On save, run an UPDATE query instead of INSERT

**Add to queries.ts:**

```ts
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
```

**Register the new screen** in `src/navigation/RootNavigator.tsx`:

```tsx
<Stack.Screen name="EditStore" component={EditStoreScreen} />
```

**Add to route params** in `src/navigation/types.ts`:

```tsx
EditStore: { storeId: string };
```

**Add an Edit button** to `StoreProfileScreen.tsx` — e.g., in the TopBar or as a button in the info section.

---

### 4.2 Remove Store Picker 10-Item Limit

**File:** `src/screens/NewOperationScreen.tsx`, line 341

Replace the store picker with a searchable list:

```diff
 ) : (
   <View style={styles.storePicker}>
+    <View style={styles.storeSearchWrapper}>
+      <Search size={15} color={c.white40} strokeWidth={2} />
+      <TextInput
+        style={styles.storeSearchInput}
+        placeholder="Rechercher un magasin…"
+        placeholderTextColor={c.white40}
+        value={storeSearch}
+        onChangeText={setStoreSearch}
+      />
+    </View>
-    {stores.slice(0, 10).map((s) => (
+    {stores
+      .filter(s => s.name.toLowerCase().includes((storeSearch || '').toLowerCase()))
+      .map((s) => (
       <Pressable
         key={s.store_id}
         style={styles.storePickerItem}
         onPress={() => { /* ... existing ... */ }}
       >
         <Text style={styles.storePickerName}>{s.name}</Text>
       </Pressable>
     ))}
-    <Text style={{ fontSize: 11, color: c.white40, textAlign: 'center', marginTop: 8 }}>
-      Recherchez ou sélectionnez un magasin ci-dessus
-    </Text>
   </View>
 )}
```

Add `storeSearch` state at the top of the component:

```tsx
const [storeSearch, setStoreSearch] = useState('');
```

Add corresponding styles:

```tsx
storeSearchWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: c.bg3,
  borderRadius: 12,
  marginBottom: 8,
},
storeSearchInput: {
  flex: 1,
  fontSize: 14,
  fontFamily: 'Inter_400Regular',
  color: c.white,
},
```

---

### 4.3 Add "Avoir" to History Filter

**File:** `src/screens/StoreHistoryScreen.tsx`, lines 25-30

```diff
 const FILTERS: { id: HistoryFilter; l: string }[] = [
   { id: 'all', l: 'Tout' },
   { id: 'livraison', l: 'Livraisons' },
   { id: 'paiement', l: 'Paiements' },
   { id: 'retour', l: 'Retours' },
+  { id: 'avoir', l: 'Avoirs' },
 ];
```

---

### 4.4 Input Validation

#### 4.4.1 Add `maxLength` to all TextInputs

Apply `maxLength` to these TextInputs across all screens:

| Screen | Field | Suggested `maxLength` |
|--------|-------|-----------------------|
| NewStoreScreen | Store name | 100 |
| NewStoreScreen | Neighborhood | 80 |
| NewStoreScreen | Contact person | 80 |
| NewStoreScreen | Phone | 20 |
| NewStoreScreen | Address | 200 |
| NewOperationScreen | Note | 200 |
| NewOperationScreen | Payment amount | 10 |
| NewOperationScreen | Product name | 100 |
| NewOperationScreen | Product price | 8 |
| NewOperationScreen | Product barcode | 13 |
| ProfileSetupScreen | Name | 80 |
| ProfileEditScreen | Name | 80 |

Example:

```tsx
<TextInput maxLength={100} /* ... other props ... */ />
```

#### 4.4.2 Add confirmation dialog for large transactions

**File:** `src/screens/NewOperationScreen.tsx`, in the `confirm` function (~line 200)

Add before the `createTransaction` call:

```tsx
import { Alert } from 'react-native';

// Inside confirm():
if (total >= 50000) {
  return new Promise<void>((resolve) => {
    Alert.alert(
      'Confirmer le montant',
      `Vous êtes sur le point d'enregistrer une opération de ${formatDAFull(total)}. Continuer ?`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => resolve() },
        { text: 'Confirmer', onPress: async () => {
            // ... move the rest of confirm() logic here
            resolve();
          }
        },
      ]
    );
  });
}
```

---

## Phase 5 — Polish & Deployment

---

### 5.1 Replace ScrollView+map with FlatList

#### StoresScreen.tsx

Replace the `ScrollView` + `filtered.map()` with:

```tsx
import { FlatList } from 'react-native';

<FlatList
  data={filtered}
  keyExtractor={(item) => item.store_id}
  renderItem={({ item, index }) => (
    // ... existing StoreRow render logic
  )}
  contentContainerStyle={{ paddingTop: insets.top + 72, paddingBottom: insets.bottom + 110 }}
  ListHeaderComponent={/* search bar + section header */}
  ListEmptyComponent={/* empty state */}
/>
```

Apply the same pattern to:
- `OverdueAlertsScreen.tsx` (both alert list and byDebt list — consider using `SectionList`)
- `StoreHistoryScreen.tsx` (the transaction list)

#### ChartCard.tsx — Fix setTimeout

**File:** `src/components/ChartCard.tsx`, line 24

Replace `setTimeout` with Reanimated's `withDelay`:

```diff
+import { withDelay } from 'react-native-reanimated';

 React.useEffect(() => {
-  setTimeout(() => {
-    heightVal.value = withTiming((value / max) * 100, {
-      duration: 600,
-      easing: Easing.bezier(0.32, 0.72, 0, 1),
-    });
-  }, index * 50 + 200);
+  heightVal.value = withDelay(
+    index * 50 + 200,
+    withTiming((value / max) * 100, {
+      duration: 600,
+      easing: Easing.bezier(0.32, 0.72, 0, 1),
+    })
+  );
 }, [value, max]);
```

---

### 5.2 Remove Dead Imports

| File | Dead Import | Remove |
|------|-------------|--------|
| `src/screens/StoresScreen.tsx` | `SlidersHorizontal` | Remove from lucide import |
| `src/screens/StoreHistoryScreen.tsx` | `Filter` | Remove from lucide import |
| `src/components/Chrome.tsx` | `Filter, FeTurbulence, Rect` | Remove from react-native-svg import |

---

### 5.3 Add Crash Reporting

Install Sentry:

```bash
npx expo install @sentry/react-native
```

**Create:** `src/services/crashReporting.ts`

```ts
import * as Sentry from '@sentry/react-native';

export function initCrashReporting() {
  if (!__DEV__) {
    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN',
      tracesSampleRate: 0.2,
    });
  }
}

export function reportError(error: Error, context?: Record<string, any>) {
  if (__DEV__) {
    console.error(error);
  } else {
    Sentry.captureException(error, { extra: context });
  }
}
```

Call `initCrashReporting()` at the top of `App.tsx`, and use `reportError()` in the `ErrorBoundary.componentDidCatch` and in catch blocks.

**Add Sentry plugin** to `app.json`:

```json
"plugins": [
  // ... existing plugins
  ["@sentry/react-native/expo", {
    "organization": "YOUR_ORG",
    "project": "rassid"
  }]
]
```

---

### 5.4 Add OTA Updates

```bash
npx expo install expo-updates
```

Add to `app.json`:

```json
"updates": {
  "url": "https://u.expo.dev/YOUR_PROJECT_ID",
  "fallbackToCacheTimeout": 0
},
"runtimeVersion": {
  "policy": "appVersion"
}
```

---

### 5.5 Clean Up Dev Files

Remove or move these files from the project root (they shouldn't be in the production bundle):

- `Modern Mobile App Design.zip`
- `RASSID_COPY_STRUCTURE.md`
- `RASSID_DESIGN_SPEC.md`
- `RASSID_RN_PORTING_BRIEF.md`
- `rassid_all_documentation.md`
- `figma_make_code/` (entire directory)

Move them to a `docs/` folder outside the project, or add them to `.npmignore`.

---

### 5.6 Fix `as any` Type Casts

**File:** `src/screens/DashboardScreen.tsx`, lines 133-134

These navigate to tabs from a stack screen:

```tsx
navigation.navigate('Stores' as any)
navigation.navigate('Payments' as any)
```

Fix by using the proper tab navigation method:

```tsx
import { useNavigation, CommonActions } from '@react-navigation/native';

// To switch tabs:
navigation.dispatch(
  CommonActions.navigate({
    name: 'MainTabs',
    params: {
      screen: 'Stores',
    },
  })
);
```

Or add `MainTabs` to `RootStackParamList`:

```tsx
MainTabs: { screen?: 'Dashboard' | 'Deliveries' | 'Payments' | 'Stores' };
```

---

## Verification Checklist

After implementing all changes, verify:

- [ ] Fresh install shows empty database (no demo data) in production mode
- [ ] All chart values show 0 when no data exists (no fake numbers)
- [ ] KpiRow shows dynamic alert count
- [ ] App recovers gracefully from errors (ErrorBoundary works)
- [ ] Database queries don't crash screens (try/catch works)
- [ ] Sync errors show Toast messages
- [ ] `eas.json` exists and `npx eas build --profile preview` works
- [ ] Transactions are atomic (kill app mid-transaction, check consistency)
- [ ] Biometric auth has a retry button
- [ ] Store picker shows all stores with search
- [ ] History filter includes "Avoirs"
- [ ] All TextInputs have maxLength
- [ ] No dead imports remain
- [ ] App builds successfully with `npx eas build --profile production`
