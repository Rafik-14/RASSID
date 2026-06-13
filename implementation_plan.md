# Implementation Plan — Full Audit Fixes + Recommendations

## Goal

Implement everything from the audit: bug fixes, security fixes, custom dark-themed dialogs, error UX redesign, and all 12 recommendations.

---

## Proposed Changes

### A. Custom Dialog System

#### [NEW] [AppDialog.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/components/AppDialog.tsx)

Dark glassmorphic modal dialog with blur overlay, animated scale+fade entry via Reanimated. Supports title, message, icon, accent color, and 1-3 buttons (cancel/confirm/destructive). Replaces all `Alert.alert` usage.

#### [NEW] [DialogProvider.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/components/DialogProvider.tsx)

React Context + hook (`useDialog()`) so any screen can show dialogs:
- `showConfirm()` — lime/amber accent, confirm action
- `showDestructive()` — red accent, destructive action
- `showDialog()` — generic with custom buttons

---

### B. Error UX Redesign

| Error Type | Display Method |
|------------|---------------|
| Form validation | Inline red text under the field |
| Success messages | Toast (green, auto-dismiss) |
| Errors needing action | Custom AppDialog with retry |
| Destructive confirms | Custom AppDialog (red accent) |
| Large amount warnings | Custom AppDialog (amber accent) |

---

### C. Bug Fixes

#### [MODIFY] [syncService.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/services/syncService.ts)
**Bug 1**: Replace SQL string interpolation with parameterized query in `getPendingTransactions()` (line 26).

#### [MODIFY] [queries.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/database/queries.ts)
**Bug 2**: Move `getLastTxHash()` and `getStoreById()` reads inside `txn` to eliminate race condition.
**Bug 3**: Add balance validation to `voidTransaction()`.

#### [MODIFY] [DashboardScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/DashboardScreen.tsx)
**Bug 4**: Replace JS-based overdue filtering with `getOverdueStores()` call.

---

### D. Security Fixes

#### [MODIFY] [schema.sql](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/supabase/schema.sql)
**Security 2**: Add store ownership check inside `sync_transactions_batch()`.
**Security 3**: Add products INSERT policy for authenticated users.

#### [MODIFY] [crashReporting.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/services/crashReporting.ts)
**Security 1**: Move Sentry DSN to environment variable.

#### [MODIFY] [app.json](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/app.json)
**Bug 7**: Change `userInterfaceStyle` from `"light"` to `"dark"`.

---

### E. Recommendations

#### Rec 1 — Logout Button
**[MODIFY] [ProfileEditScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/ProfileEditScreen.tsx)**
Add a styled "Déconnexion" button at the bottom. Calls `signOut()` from supabase, clears session, resets to login screen. Uses new `showDestructive()` dialog for confirmation.

#### Rec 2 — Network Status Banner
**[NEW] [NetworkBanner.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/components/NetworkBanner.tsx)**
A slim animated banner that slides down from top when offline. Uses `expo-network` `useNetworkState()` hook. Red/amber strip with "Hors ligne — les données ne sont pas synchronisées". Auto-hides when back online. Mounted in `App.tsx`.

#### Rec 3 — Pull-to-Refresh on Deliveries/Payments
**[MODIFY] [DeliveriesScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/DeliveriesScreen.tsx)**
**[MODIFY] [PaymentsScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/PaymentsScreen.tsx)**
Add `RefreshControl` to FlatList with pull-to-refresh support.

#### Rec 5 — Phone Number Validation
**[NEW] [validation.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/utils/validation.ts)**
`validateAlgerianPhone()` — validates 05xx/06xx/07xx/+213 format.

**[MODIFY] [NewStoreScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/NewStoreScreen.tsx)**
**[MODIFY] [ProfileEditScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/ProfileEditScreen.tsx)**
Show inline error under phone field if format is invalid on save attempt.

#### Rec 6 — Keyboard Avoidance on Forms
**[MODIFY] [NewStoreScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/NewStoreScreen.tsx)**
**[MODIFY] [NewOperationScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/NewOperationScreen.tsx)**
Wrap content in `KeyboardAvoidingView` (ProfileEditScreen already has it).

#### Rec 7 — Loading States
**[MODIFY] Multiple screens**
Add a `loading` boolean state. Show centered `ActivityIndicator` with lime color during initial load. Screens: DashboardScreen, StoresScreen, DeliveriesScreen, PaymentsScreen, StoreHistoryScreen, StoreProfileScreen.

#### Rec 8 — Dev Files Cleanup
> [!NOTE]
> This is a manual step — move `.zip`, `.md` spec files, `figma_make_code/`, `implementation_guide.md`, `production_plan.md`, `production_progress.md` to a `docs/` folder. Not a code change.

#### Rec 9 — Remove Old Schema Wipe Logic
**[MODIFY] [database/index.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/database/index.ts)**
Remove lines 28-47 (the one-time `store-epicerie-port` migration wipe). All devices should have upgraded by now.

#### Rec 11 — Pull Sync Deletion Handling
**[MODIFY] [pullSync.ts](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/services/pullSync.ts)**
When pulling stores, respect the `is_deleted` flag — don't overwrite a locally-deleted store back to active.

#### Rec 4/10/12 — Deferred
Rec 4 (debounce search), Rec 10 (Expo Updates error handling), and Rec 12 (date range filters) are lower-priority polish items that can be done in a follow-up sprint. They require more UX decisions and won't block launch.

---

### F. Screen Updates — Replace Alert.alert with useDialog()

All 5 screens with `Alert.alert` will switch to `useDialog()`:
- [DeliveriesScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/DeliveriesScreen.tsx) — void confirmation
- [PaymentsScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/PaymentsScreen.tsx) — void confirmation
- [StoreHistoryScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/StoreHistoryScreen.tsx) — void confirmation
- [StoreProfileScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/StoreProfileScreen.tsx) — delete confirmation
- [NewOperationScreen.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/src/screens/NewOperationScreen.tsx) — large amount confirmation

#### [MODIFY] [App.tsx](file:///c:/Users/surface/Desktop/main/RASSID3.0/RASSID/App.tsx)
Wrap app root in `<DialogProvider>` + mount `<NetworkBanner>`.

---

## Open Questions

> [!IMPORTANT]
> **Rec 4, 10, 12 deferred** — Debounce search, Expo Updates handling, and date range filters are deferred to keep this sprint focused. OK to proceed without them?

---

## Verification Plan

### Manual Verification
- Test all custom dialog triggers (void, delete, large amount confirm)
- Test network banner by toggling airplane mode
- Test pull-to-refresh on Deliveries/Payments
- Test phone validation on NewStoreScreen
- Test keyboard avoidance on form screens
- Test logout flow from ProfileEditScreen
- Verify `userInterfaceStyle: "dark"` fixes system UI elements
