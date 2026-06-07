# RASSID — Production Readiness Plan

> **Status:** MVP / Prototype → Production  
> **Platform:** React Native (Expo SDK 54) — iOS & Android  
> **Current state:** Solid architecture, polished UI, but missing critical production infrastructure

---

## Overall Assessment

The app has a **clean codebase** with a well-designed offline-first SQLite architecture, hash-chained transaction integrity, and polished UI with proper animations. However, it has **critical gaps** in security, data integrity, error handling, and backend infrastructure that must be addressed before real users touch it.

> [!CAUTION]
> The app currently ships **fake demo data** to every new user, has **no authentication**, **no error recovery**, and a **one-way-only sync**. Deploying as-is would be a serious risk.

---

## Phase 1 — Critical Blockers 🔴
*Must fix before any real user touches the app*

**Estimated effort: 3–5 days**

---

### 1.1 Remove / Gate Seed Data

**Files:** [seed.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/database/seed.ts)

The `seedDatabaseIfEmpty()` function inserts 5 fake stores, 5 products, and 4 sample transactions on every fresh install. A real user opening the app for the first time would see fabricated business data.

**Fix:**
- Gate all seed data behind `__DEV__` flag
- In production, start with an empty database + only the product catalog (if products are predefined)
- Or: add a "Demo Mode" toggle that clearly labels data as fake

---

### 1.2 Remove Hardcoded Fallback Values

**Files:** [DashboardScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/DashboardScreen.tsx), [DeliveriesScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/DeliveriesScreen.tsx), [PaymentsScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/PaymentsScreen.tsx), [KpiRow.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/components/KpiRow.tsx)

| Location | Fake Value | Problem |
|----------|-----------|---------|
| Dashboard livraison chart | `127000` fallback | Shows 127K DA when real data is 0 |
| Dashboard paiement chart | `98000` fallback | Shows 98K DA when real data is 0 |
| Dashboard chart data points | `[40, 52, 38, ...]` | Fake chart bars when no data |
| Dashboard trend badges | `8.4` and `-4.1` | Never computed from real data |
| DeliveriesScreen | `184500` fallback | Shows 184.5K when no deliveries |
| PaymentsScreen | `96200` fallback | Shows 96.2K when no payments |
| KpiRow | `"2 en alerte"` hardcoded | Always says 2 regardless of actual count |

**Fix:** Replace all `|| fakeValue` patterns with `|| 0`. Show proper empty states when there's no data. Compute trend percentages from actual period-over-period data.

---

### 1.3 Add Global Error Boundary

**File:** [App.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/App.tsx)

No error boundary exists. Any unhandled exception crashes the entire app with no recovery.

**Fix:**
- Create an `ErrorBoundary` component wrapping `<RootNavigator />`
- Show a "Something went wrong" screen with a "Restart" button
- Log the error (prepare for crash reporting in Phase 3)

---

### 1.4 Add try/catch to All Data Loading

**Files:** Every screen's `load()` / `useCallback` function

No screen wraps its database queries in try/catch. If any query fails, the screen crashes silently.

**Fix:** Wrap all `await` calls in try/catch blocks. Show Toast error messages on failure. Add a retry mechanism where appropriate.

---

### 1.5 Fix Sync Error Handling

**File:** [DashboardScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/DashboardScreen.tsx) (line ~64)

`syncNow()` is called without try/catch. If it throws, the app crashes.

**Fix:** Wrap in try/catch, show error Toast on failure.

---

### 1.6 EAS Build Configuration

**Files:** [app.json](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/app.json), missing `eas.json`

- `projectId` is a placeholder string, not a real UUID
- No `eas.json` exists — can't build production binaries

**Fix:**
- Run `eas init` to get a real project ID
- Create `eas.json` with `development`, `preview`, and `production` profiles
- Set proper `versionCode` / `buildNumber` for store submissions

---

### 1.7 Wrap Transaction Creation in a Database Transaction

**File:** [queries.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/database/queries.ts)

`createTransaction()` inserts a transaction row then updates the store balance in separate statements. If the app crashes between them, data becomes inconsistent.

**Fix:** Wrap both operations in a SQLite transaction (`db.withTransactionAsync()`).

---

## Phase 2 — Security & Authentication 🔐
*Required before handling real financial data*

**Estimated effort: 5–7 days**

---

### 2.1 Supabase Authentication

**Current state:** The app uses only the Supabase anon key. No user login, no JWT, no identity.

**Fix:**
- Add a login screen (email/password or phone OTP — OTP is better for field reps)
- Use Supabase Auth for user management
- Store the JWT and attach it to all API calls
- Add a `rep_id` field to transactions and stores for multi-rep support

---

### 2.2 Row-Level Security (RLS)

**File:** [schema.sql](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/supabase/schema.sql)

**Current state:** No RLS policies. Tables are wide open. Anyone with the anon key can read/write/delete all data.

**Fix:**
- Enable RLS on all tables
- Create policies scoped to `auth.uid()` matching the rep's ID
- Ensure the `sync_transactions_batch` RPC respects user identity

---

### 2.3 Root/Jailbreak Detection

**File:** [securityService.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/services/securityService.ts)

`isDeviceCompromised()` always returns `false`. For a financial app, this is critical.

**Fix:** Integrate a native module for root/jailbreak detection (e.g., `jail-monkey` or `react-native-device-info`'s jailbreak check).

---

### 2.4 Biometric Auth Retry

**File:** [App.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/App.tsx)

If biometric auth fails, the user is stuck with no retry button. The app is permanently locked until force-quit.

**Fix:** Add a "Réessayer" button on the auth failure screen. Consider a PIN fallback.

---

### 2.5 SQLite Encryption

**Current state:** The database is stored as plaintext on disk.

**Fix:** Use `expo-sqlite` with SQLCipher for encryption at rest (requires a dev build, not Expo Go).

---

## Phase 3 — Data & Sync Infrastructure 🔄
*Required for multi-device and reliable operation*

**Estimated effort: 5–7 days**

---

### 3.1 Database Migration System

**File:** [database/index.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/database/index.ts)

`SCHEMA_VERSION = 1` is defined but never checked. No migration path exists for schema changes after launch.

**Fix:**
- Check `PRAGMA user_version` on DB open
- Run sequential migration scripts (v1→v2, v2→v3, etc.)
- Never modify existing migrations — only add new ones

---

### 3.2 Pull Sync (Server → Device)

**Current state:** Sync is push-only (device → Supabase). New products, corrections, or data from other devices never reach the phone.

**Fix:**
- Add a `pullSync()` function that fetches updated records since last sync timestamp
- Implement server-side `updated_at` timestamps and triggers
- Handle conflict resolution (server wins vs. client wins strategy)

---

### 3.3 Sync Stores & Transaction Items

**Current state:** Only transactions are pushed to Supabase. Locally-created stores and itemized delivery data are never synced.

**Fix:**
- Add stores to the push sync payload
- Add transaction_items to the push sync payload
- Create corresponding Supabase RPC or REST endpoints

---

### 3.4 Automatic Background Sync

**Current state:** Sync is manual-only (user must tap a button).

**Fix:**
- Add periodic sync using `expo-background-fetch` or on-app-foreground sync
- Add network connectivity check before syncing (`expo-network`)
- Implement exponential backoff for failed syncs

---

### 3.5 Fix Store Balance Inconsistency

**File:** [queries.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/database/queries.ts)

Payments exceeding the current balance make it negative. Also, `pushSyncQueue()` marks all pending stores as synced even if they weren't actually uploaded.

**Fix:**
- Add validation to prevent balance going below 0 (or allow it intentionally with a clear UX indicator)
- Only mark records as synced after confirmed server receipt

---

## Phase 4 — Feature Completeness ✅
*Required for a usable production app*

**Estimated effort: 5–8 days**

---

### 4.1 Store Editing & Deletion

**Current state:** Can create stores but can't edit or delete them.

**Fix:**
- Add an "Edit Store" screen (reuse NewStoreScreen form with pre-filled data)
- Add soft-delete with confirmation dialog
- Prevent deletion of stores with outstanding balance

---

### 4.2 Transaction Voiding

**Current state:** No way to correct or void a transaction. The hash chain makes editing complex.

**Fix:**
- Add a "Void" action that creates a reversing transaction (same amount, opposite sign)
- The voiding transaction links to the original via `reference_no`
- Mark the original as voided in the UI

---

### 4.3 Store Picker — Remove 10-Store Limit

**File:** [NewOperationScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/NewOperationScreen.tsx) (line ~341)

`stores.slice(0, 10)` hides stores beyond the first 10.

**Fix:** Add a search input to the store picker. Show filtered results in a FlatList. Remove the arbitrary slice.

---

### 4.4 Complete Deliveries & Payments Screens

**Files:** [DeliveriesScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/DeliveriesScreen.tsx), [PaymentsScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/PaymentsScreen.tsx)

Both are essentially stub screens — showing a monthly total and an empty state. No list of actual transactions.

**Fix:** Add a filterable, date-grouped list of transactions (similar to StoreHistoryScreen but across all stores).

---

### 4.5 Add "Avoir" to History Filter

**File:** [StoreHistoryScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID3.0/RASSID/RASSID/src/screens/StoreHistoryScreen.tsx)

Filter pills only include `all`, `livraison`, `paiement`, `retour` — missing `avoir`.

**Fix:** Add `{ key: 'avoir', label: 'Avoirs' }` to the FILTERS array.

---

### 4.6 Input Validation

**Files:** NewStoreScreen, NewOperationScreen, ProfileSetupScreen, ProfileEditScreen

- No phone number format validation
- No `maxLength` on any TextInput
- No confirmation dialogs before creating transactions (especially large amounts)

**Fix:**
- Add Algerian phone format validation (`+213 / 05xx / 06xx / 07xx`)
- Add `maxLength` to all text inputs
- Add confirmation dialog for transactions above a threshold (e.g., >50,000 DA)

---

## Phase 5 — Polish & Deployment 🚀
*Final steps before app store submission*

**Estimated effort: 3–5 days**

---

### 5.1 Performance Optimization

| Issue | Location | Fix |
|-------|----------|-----|
| No list virtualization | StoresScreen, OverdueAlertsScreen, StoreHistoryScreen | Replace `ScrollView` + `.map()` with `FlatList` |
| Staggered animation overload | StoresScreen, OverdueAlertsScreen | Cap stagger delay, limit to first 10-15 items |
| `setTimeout` for bar animation | ChartCard | Use Reanimated `withDelay` instead |
| Inefficient overdue query | queries.ts `getOverdueStores()` | Move filter logic to SQL `WHERE` clause |

---

### 5.2 Clean Up Codebase

| Issue | Fix |
|-------|-----|
| Dead imports (`SlidersHorizontal`, `Filter`, `FeTurbulence`, etc.) | Remove unused imports |
| Duplicate `computeInitials()` function | Extract to shared utils |
| `as any` type assertions on navigation | Add proper type definitions |
| Inconsistent `LayoutAnimation` platform checks | Standardize across all screens |
| Dev files in project root (`.zip`, design docs, figma code) | Move to a `/docs` folder or remove from production bundle |

---

### 5.3 Add Crash Reporting & Analytics

**Fix:**
- Integrate Sentry (`@sentry/react-native`) for crash reporting
- Add basic analytics (screen views, key actions) for monitoring adoption
- Connect error boundary to Sentry

---

### 5.4 OTA Updates

**Fix:**
- Add `expo-updates` for over-the-air JS bundle updates
- Configure update channels for production vs. staging

---

### 5.5 Splash Screen & App Icon

**Fix:**
- Replace the text-based loading view with the proper logo asset
- Configure native splash screen via `expo-splash-screen`
- Fix StatusBar color mismatch (light text on light splash background)
- Add the final logo as the app icon in `app.json`

---

### 5.6 App Store Preparation

- Write app store description (French)
- Prepare screenshots for both iOS and Android
- Set up privacy policy URL (required for both stores)
- Configure app signing (iOS certificates, Android keystore)
- Set proper `versionCode` / `buildNumber`

---

## Summary

| Phase | Focus | Effort | Priority |
|-------|-------|--------|----------|
| **Phase 1** | Critical Blockers | 3–5 days | 🔴 Must do first |
| **Phase 2** | Security & Auth | 5–7 days | 🔴 Before real data |
| **Phase 3** | Data & Sync | 5–7 days | 🟠 Before multi-device |
| **Phase 4** | Feature Completeness | 5–8 days | 🟠 Before launch |
| **Phase 5** | Polish & Deploy | 3–5 days | 🟡 Final sprint |
| **Total** | | **~21–32 days** | |

> [!IMPORTANT]
> **Phases 1 and 2 are non-negotiable** before any real user or real financial data touches the app. Phases 3-5 can be prioritized based on your launch timeline — but all should be done before a public release.
