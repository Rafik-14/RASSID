# RASSID

**Distribution Amine** — mobile-first field sales and debt management for food distribution representatives (French / DZD).

## Features (MVP)

- **Dashboard** — KPIs (créances, magasins, encaissé), delivery/payment charts, route list
- **Magasins** — store directory with debt badges, new store form
- **Fiche magasin** — profile, 4 transaction actions (Livraison, Paiement, Retour, Avoir)
- **Opérations** — record transactions with optimistic local SQLite updates
- **Historique** — chronological operation journal with filters
- **Impayés** — overdue alerts (>10 days without payment)
- **Offline-first** — SQLite local database with append-only sync queue
- **Sync** — batch push to Supabase (configure credentials in `.env.local`)
- **Security** — biometric gate on launch, offline time-bomb stub, chained tx hashes

## UI

Warm light theme: copper `#C9720E`, backgrounds `#FAF8F4`–`#CFC7B7`, ink `#1E1A14`, Inter typography.

Reference mockup: `food_distribution_app_v2 (1).html`

## Quick start

```bash
cd RASSID
cp .env.example .env.local
# Edit .env.local with Supabase URL/key (optional for offline-only demo)

npm install
npx expo start
```

Scan the QR code with **Expo Go** (SDK 54) or run `npx expo run:android` / `npx expo run:ios` for a dev build.

## Environment (`.env.local`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_PUBLIC_REP_NAME` | Header title (default: Distribution Amine) |
| `EXPO_PUBLIC_REP_INITIALS` | Avatar initials (default: AM) |
| `EXPO_PUBLIC_PRINTER_MAC` | Bluetooth printer MAC (optional) |
| `EXPO_PUBLIC_OFFLINE_LOCK_HOURS` | Hours before offline lock (default: 72) |

## Project structure

```
src/
  api/          Supabase client
  components/   UI design system
  config/       Theme & env
  database/     SQLite schema, seed, queries
  navigation/   Tabs + stack
  screens/      All app screens
  services/     Sync, print, image, security
  store/        App context (refresh, sync)
  types/        TypeScript models
  utils/        Currency, dates, hashing
supabase/       PostgreSQL schema + sync RPC
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Add URL and anon key to `.env.local`
4. Tap **Synchroniser** on the dashboard to push pending transactions

## Seed data

On first launch the app seeds 5 demo stores (Épicerie du Port, etc.) and sample products matching the HTML mockup.

## Hardware (production builds)

These require a **development build** (not Expo Go):

- Bluetooth thermal printing (`EXPO_PUBLIC_PRINTER_MAC`)
- Barcode scanner via `expo-camera`
- SQLCipher encryption
- Screenshot blocking

## Scripts

- `npm start` — Expo dev server
- `npm run typecheck` — TypeScript check
- `npm run android` / `npm run ios` — platform targets

## License

Private — RASSID / Distribution Amine
