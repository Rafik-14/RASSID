# RASSID — Complete App Design Specification

> **Purpose:** This document describes every screen, component, data model, and interaction in the RASSID mobile app. Use it as a reference to generate designs that map 1:1 to the existing codebase.
>
> **Platform:** React Native (Expo) — iOS & Android
> **Language:** All UI text is in **French**
> **Orientation:** Portrait only

---

## 1. App Identity

- **Name:** RASSID
- **Tagline:** Distribution Amine
- **Purpose:** Field sales & debt management for a distribution company. Used by delivery reps to track store deliveries, collect payments, and manage outstanding debts.
- **Font:** Inter (Regular 400, Medium 500, SemiBold 600, Bold 700)

---

## 2. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0A0A` | App background |
| `bg2` | `#111111` | Secondary background |
| `bg3` | `#1A1A1A` | Card / input backgrounds |
| `bg4` | `#222222` | Tab bar, elevated surfaces |
| `surface` | `#2A2A2A` | Highest elevation surface |
| `border` | `#2A2A2A` | Solid borders |
| `borderLight` | `rgba(255,255,255,0.06)` | Subtle card borders |
| `lime` | `#7FE300` | Primary accent / brand |
| `limeDim` | `rgba(127,227,0,0.12)` | Tinted lime backgrounds |
| `white` | `#F0F0F0` | Primary text |
| `white70` | `rgba(240,240,240,0.70)` | Secondary text |
| `white40` | `rgba(240,240,240,0.40)` | Muted text, labels |
| `white12` | `rgba(240,240,240,0.12)` | Subtle fills |
| `white06` | `rgba(240,240,240,0.06)` | Very subtle fills |
| `ink` | `#111111` | Text on lime backgrounds |
| `red` | `#FF4D4D` | Debt / danger |
| `redDim` | `rgba(255,77,77,0.12)` | Tinted red background |
| `green` | `#34D399` | Payments / success |
| `greenDim` | `rgba(52,211,153,0.12)` | Tinted green background |
| `amber` | `#FBBF24` | Warnings / moderate status |
| `amberDim` | `rgba(251,191,36,0.12)` | Tinted amber background |
| `blue` | `#60A5FA` | Returns |
| `blueDim` | `rgba(96,165,250,0.12)` | Tinted blue background |

---

## 3. Design Tokens

### Border Radii
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 8px | Small elements |
| `sm` | 12px | Active tab icon wrap |
| `md` | 16px | Medium cards |
| `lg` | 20px | Large elements |
| `xl` | 24px | Cards, sections |
| `xxl` | 32px | Hero cards |
| `pill` | 100px | Buttons, badges, tab bar, search bar |

### Spacing
| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 20px |
| `xxl` | 24px |
| `xxxl` | 32px |

---

## 4. Navigation Architecture

```
App.tsx (Auth gate)
  └── RootNavigator (Native Stack, slide_from_right animation)
        ├── MainTabs (Bottom Tab Navigator — floating pill bar)
        │     ├── Tab: "Accueil" (home icon) → DashboardScreen
        │     ├── Tab: "Livraisons" (car icon) → DeliveriesScreen
        │     ├── Tab: "Paiements" (receipt icon) → PaymentsScreen
        │     └── Tab: "Magasins" (storefront icon) → StoresScreen
        ├── StoreProfileScreen (params: storeId)
        ├── StoreHistoryScreen (params: storeId)
        ├── NewOperationScreen (params: storeId?, type?)
        ├── NewStoreScreen
        ├── OverdueAlertsScreen
        └── AuthLockScreen (params: reason)
```

---

## 5. Data Model

### Store
| Field | Type | Description |
|-------|------|-------------|
| store_id | string (UUID) | Unique ID |
| name | string | Store name (e.g., "Épicerie Ben Ali") |
| neighborhood | string | Quartier / neighborhood |
| contact_person | string | Store manager name |
| phone | string | Phone number |
| address | string | Full address |
| current_balance | number | Outstanding debt (positive = owes money) |
| total_delivered | number | Cumulative delivery total |
| total_collected | number | Cumulative payment total |
| last_delivery_date | ISO string | null | Last delivery date |
| last_payment_date | ISO string | null | Last payment date |
| sync_status | 'pending' | 'synced' | 'conflict' | Cloud sync status |

### Transaction
| Field | Type | Description |
|-------|------|-------------|
| tx_id | string (UUID) | Unique ID |
| store_id | string | Linked store |
| tx_type | 1 \| 2 \| 3 \| 4 | 1=Livraison, 2=Paiement, 3=Retour, 4=Avoir |
| amount | number | Positive = adds debt, negative = reduces debt |
| reference_no | string | null | Reference like "BL-XYZ123" |
| note | string | null | Free-text note |
| hash_signature | string | Blockchain-style hash for integrity |
| parent_hash | string | null | Previous transaction hash |
| sync_status | 'pending' | 'synced' | 'conflict' | Cloud sync status |
| created_at | ISO string | Timestamp |

### Product
| Field | Type | Description |
|-------|------|-------------|
| product_id | string | Unique ID |
| barcode | string | EAN barcode |
| name | string | Product name (e.g., "Huile Safia 5L") |
| unit_price | number | Price in DA |
| category_id | number | Category reference |

### Transaction Types (French labels)
| Type | Code | French Label | Amount Sign | Color |
|------|------|-------------|-------------|-------|
| Delivery | 1 | Livraison | Positive (+debt) | lime |
| Payment | 2 | Paiement | Negative (-debt) | green |
| Return | 3 | Retour | Negative (-debt) | blue |
| Credit Note | 4 | Avoir | Negative (-debt) | amber |

### Store Debt Status
| Status | Condition | Avatar BG | Avatar Text |
|--------|-----------|-----------|-------------|
| `paid` | balance ≤ 0 | greenDim | green |
| `moderate` | balance > 0, < 10 days overdue | amberDim | amber |
| `overdue` | balance > 0, ≥ 10 days without payment OR balance ≥ 5000 | redDim | red |

---

## 6. Shared Components

### 6.1 TopBar (Floating Header)
- **Position:** Absolute, top: 0, full width, zIndex: 100
- **Layout:** Horizontal pill bar centered in the screen
- **Background:** bg4, borderRadius: pill (100px), 1px borderLight border
- **Padding:** top = safeAreaInset.top + 8px, inner paddingVertical: 10px, paddingHorizontal: 16px
- **Left element:** Either an avatar circle (24×24, lime bg, dark initials text "AM") OR a back arrow (← icon, 22px, white)
- **Center:** Title text, 14px SemiBold, white, centered, letterSpacing: 0.5
- **Right element:** Optional icon button (e.g., notifications bell) OR 24px spacer
- **Interaction:** Press opacity 0.6 on back/right icons

### 6.2 Floating Tab Bar
- **Position:** Absolute, bottom = safeAreaInset.bottom + 16px, left: 24px, right: 24px
- **Background:** bg4, borderRadius: pill, 1px borderLight border
- **Layout:** 4 equal tabs in a row, paddingVertical: 8px
- **Each tab:**
  - Icon: 20px, active = solid icon in lime pill background (sm radius), inactive = outline icon in white40
  - Label: 10px Medium, active = white, inactive = white40
- **Tabs:** Accueil (home), Livraisons (car), Paiements (receipt), Magasins (storefront)

### 6.3 Card
- **Background:** bg3
- **Border:** 1px borderLight
- **Border radius:** xl (24px)
- **Padding:** 16px
- **Margin:** horizontal 16px, bottom 12px
- **Overflow:** hidden

### 6.4 KpiRow (Bento Grid)
- **Layout:** Horizontal row, gap: 12px, horizontal padding: 16px
- **Left tile (flex: 1.4):**
  - Label: "CRÉANCES" — 11px Medium, white40, letterSpacing: 1.5, uppercase
  - Value: Formatted debt total — 36px Bold, red color
  - Tag pill: "Dette active" — redDim background, red text, 10px, pill radius
  - Background: bg3, border: borderLight, radius: xl, padding: 20px
- **Right column (flex: 1):** Two stacked tiles, gap: 12px
  - Top tile: "MAGASINS" label + count value, 28px SemiBold white
  - Bottom tile: "ENCAISSÉ" label + amount, 20px SemiBold green
  - Both: bg3, borderLight, radius: xl, padding: 16px
- **Interaction:** Press scale animation (0.97) on each tile

### 6.5 ChartCard
- **Container:** bg3, radius: xl, padding: 20px, borderLight border, horizontal margin: 16px
- **Period pills (top):** Horizontal row of "1J", "1S", "1M", "3M" pill buttons
  - Active: lime bg, ink text, SemiBold
  - Inactive: transparent bg, white40 text
- **Header row:** Label text (14px Medium white) + trend badge pill
  - Trend badge: greenDim bg / green text if positive, redDim bg / red text if negative
  - Format: "+8.4%" or "-4.1%"
- **Amount:** 24px SemiBold white (e.g., "127 000 DA")
- **Subtitle:** 11px Regular white40, uppercase, letterSpacing: 0.5
- **Bar chart:** 10 vertical bars in a row, height 56px
  - Bars: flex: 1, rounded top (4px), gap: 3px
  - Active bars (≥85% height): colored (lime for deliveries, red for payments)
  - Muted bars (<85%): white12

### 6.6 StoreRow
- **Layout:** Horizontal row, padding: 16px, gap: 14px
- **Left:** Avatar circle (40×40), colored background based on debt status
  - Contains: store initials (13px SemiBold), colored text
  - Status colors: paid=greenDim/green, moderate=amberDim/amber, overdue=redDim/red
- **Middle (flex: 1):**
  - Store name: 14px Medium, white
  - Subtitle: 12px Regular, white40 — shows overdue label ("12j sans paiement") or "Quartier · Phone"
- **Right side:**
  - Debt amount: 14px SemiBold, red if >0 or "Soldé" in green
  - Status dot: 6px circle below amount (green / amber / red)
- **Far right (optional):** Chevron forward icon (14px, white40)
- **Bottom:** 1px borderLight separator
- **Interaction:** Press opacity 0.7

### 6.7 AlertCard
- **Layout:** Horizontal row, padding: 16px, gap: 14px
- **Left:** Icon circle (32×32)
  - Warning icon (16px) in tinted circle
  - <30 days: amberDim bg, amber icon
  - ≥30 days: redDim bg, red icon
- **Middle (flex: 1):**
  - Store name: 14px Medium, white
  - Days text: 12px Regular, amber or red — "Dernier paiement: il y a 15 jours"
- **Right:** Debt amount: 14px SemiBold, red
- **Bottom:** 1px borderLight separator
- **Interaction:** Press opacity 0.7, navigates to StoreProfile

### 6.8 SyncBadge
- **Container:** Horizontal margin: 16px, bottom margin: 12px
- **Shape:** Pill (borderRadius: 100)
- **Background:** limeDim when pending > 0, white06 when synced
- **Layout:** Row — status dot (8px) + label text (flex: 1) + optional sync icon
- **When pending:**
  - Dot: lime color
  - Label: "3 en attente" — 12px Medium, lime
  - Right: sync icon (14px, lime)
- **When synced:**
  - Dot: green color
  - Label: "Synchronisé" — 12px Medium, white40
- **When syncing:** ActivityIndicator replaces sync icon

### 6.9 Section Header Pattern
- **Text:** Uppercase, 11px Medium, white40, letterSpacing: 1.5
- **Padding:** horizontal 16px, bottom 12px
- **Used in:** Dashboard, Store Profile, Stores, Overdue Alerts, New Store, New Operation

---

## 7. Screens — Detailed Specification

### 7.1 Splash / Loading Screen
- **Background:** bg (#0A0A0A)
- **Center:** "RASSID" — 32px Bold, lime, letterSpacing: 4
- **Below:** ActivityIndicator (lime color)
- **Shown:** While fonts load and auth checks run

### 7.2 Auth Lock Screen
- **Route:** `AuthLock` (params: reason string)
- **Background:** bg, centered content, padding: 32px
- **Elements (top to bottom):**
  1. "RASSID" logo — 28px SemiBold, lime, letterSpacing: 4
  2. Lock icon circle — 80×80, redDim bg, lock-closed icon 32px red
  3. Title: "Synchronisation requise" — 18px SemiBold, white
  4. Reason text: dynamic (e.g., "Aucune synchronisation depuis 72h") — 13px Regular, white40, centered
  5. Button: "Synchroniser maintenant" — lime bg, pill radius, ink text, 13px SemiBold

---

### 7.3 Dashboard Screen (Tab: Accueil)
- **Route:** `Dashboard` (main tab)
- **Header:** TopBar with avatar, title = rep name ("Distribution Amine"), right = notifications bell icon → OverdueAlerts
- **Pull-to-refresh:** Yes, lime tint
- **Content (top to bottom):**

1. **Greeting section**
   - "Bonjour, Distribution Amine" — 24px SemiBold, white
   - "Voici votre résumé" — 13px Regular, white40

2. **SyncBadge** — shows pending sync count

3. **KpiRow Bento Grid** — 3 metrics:
   - Créances totales (e.g., "847K") — red
   - Magasins count (e.g., "24") — white
   - Encaissé aujourd'hui (e.g., "12K") — green

4. **Section: "ACTIVITÉ"**

5. **ChartCard: "LIVRAISONS"**
   - Bar color: lime
   - Example data: total 127 000 DA, trend +8.4%
   - Subtitle: "marchandises livrées ce mois"

6. **ChartCard: "PAIEMENTS REÇUS"**
   - Bar color: red
   - Example data: total 98 000 DA, trend -4.1%
   - Subtitle: "encaissé ce mois"

7. **Section: "ALERTES"** (only if overdue stores exist)
   - Card containing up to 3 StoreRow items (overdue stores)
   - "Voir les impayés" link row: red warning icon + text + chevron → OverdueAlerts

8. **Section: "ROUTE DU JOUR"**
   - Card containing first 5 StoreRow items → each taps to StoreProfile

---

### 7.4 Stores Screen (Tab: Magasins)
- **Route:** `Stores` (main tab)
- **Header:** TopBar with title "Magasins"
- **Content (top to bottom):**

1. **Search bar**
   - Pill shape (borderRadius: pill), bg3 background, padding: 12px horizontal 16px
   - Left: search icon (18px, white40)
   - Input: "Rechercher un magasin…" placeholder (white40), 14px Regular white text
   - Debounced search (300ms delay)

2. **Section header:** "24 MAGASINS" (dynamic count)

3. **Card with StoreRow list** — all stores matching search, sorted by debt descending
   - Each row taps → StoreProfile

4. **"Nouveau magasin" button**
   - Full width, lime bg, pill radius, paddingVertical: 14px
   - Add icon (18px, ink) + "Nouveau magasin" text (13px SemiBold, ink)
   - Taps → NewStore

---

### 7.5 Deliveries Screen (Tab: Livraisons)
- **Route:** `Deliveries` (main tab)
- **Header:** TopBar with title "Livraisons"
- **Layout:** Centered empty state (flex: 1, centered, bottom padding 100)
- **Elements:**
  1. Icon circle: 72×72, limeDim bg, car icon 28px lime
  2. Title: "Livraisons" — 18px SemiBold, white
  3. Description: "Enregistrez une livraison depuis la fiche magasin ou créez une nouvelle opération." — 13px Regular, white40, centered
  4. Button: "Nouvelle livraison" — lime bg, pill radius, add icon + text (ink)
     - Taps → NewOperation(type: 'livraison')

---

### 7.6 Payments Screen (Tab: Paiements)
- **Route:** `Payments` (main tab)
- **Header:** TopBar with title "Paiements"
- **Layout:** Same centered empty state as Deliveries
- **Elements:**
  1. Icon circle: 72×72, greenDim bg, cash icon 28px green
  2. Title: "Paiements" — 18px SemiBold, white
  3. Description: "Enregistrez un encaissement depuis la fiche magasin ou via une nouvelle opération."
  4. Button: "Nouveau paiement" — lime bg, pill, add icon + text
     - Taps → NewOperation(type: 'paiement')

---

### 7.7 Store Profile Screen
- **Route:** `StoreProfile` (params: storeId)
- **Header:** TopBar with title = store name, back arrow
- **Content (top to bottom):**

1. **Hero card** (bg3, borderRadius: xl, margin: 16px, centered)
   - Avatar circle: 72×72, white06 bg, storefront icon 32px white
   - Balance: 36px SemiBold, white (e.g., "45 600,00 DA")
   - Status text: 12px Medium
     - If balance > 0: "Doit au distributeur" in red
     - If balance ≤ 0: "Compte soldé" in lime

2. **Section: "INFORMATIONS"**

3. **Info rows card** (bg3, borderRadius: xl, margin: 16px)
   Each row: icon in tinted circle (28×28, white06 bg) + label (12px white40) + value (12px white)
   - person → "Gérant" → contact name
   - call → "Téléphone" → phone (tappable, opens tel: link)
   - location → "Quartier" → neighborhood
   - trending-down → "Dette actuelle" → amount (red if >0, green if 0)
   - cube → "Total livré" → amount
   - wallet → "Total encaissé" → amount (green)
   - calendar → "Dernière livraison" → date in French (e.g., "15 mai 2026") or "—"
   - time → "Dernier paiement" → date (amber)

4. **History button** (bg3, pill radius, margin: 16px)
   - Lime icon in limeDim circle (32×32) + "Historique des opérations" (13px Medium white) + chevron
   - Taps → StoreHistory

5. **Bottom Action Dock** (position: absolute, bottom: 0, full width)
   - Background: bg, borderTop: borderLight, padding: 16px
   - Bottom padding: safeAreaInset.bottom + 90px (above tab bar)
   - 4 buttons in a row, gap: 8px:
     - **Livraison** (primary): flex 1.2, lime bg, pill radius, car icon + text (ink), 12px SemiBold
     - **Paiement:** flex 1, bg4, pill, cash icon + text (white), 10px Medium
     - **Retour:** flex 1, bg4, pill, return icon + text (white)
     - **Avoir:** flex 1, bg4, pill, pricetag icon + text (white)
   - Each taps → NewOperation(storeId, type)

---

### 7.8 Store History Screen
- **Route:** `StoreHistory` (params: storeId)
- **Header:** TopBar with title "Historique", back arrow
- **Content (top to bottom):**

1. **Filter pills** — horizontal row, gap: 8px, padding: 16px
   - 4 pills: "Tout", "Livraisons", "Paiements", "Retours"
   - Active: lime bg, ink text, SemiBold
   - Inactive: bg3 bg, white40 text

2. **Transaction groups** — grouped by date, each group:
   - **Date row:** Date label (12px Medium white) + net amount (11px Medium, lime or green)
   - **Card** containing transaction rows:
     - Left: Icon in tinted circle (38×38)
       - Livraison: car icon, lime, limeDim bg
       - Paiement: cash icon, green, greenDim bg
       - Retour: return icon, blue, blueDim bg
       - Avoir: pricetag icon, amber, amberDim bg
     - Middle: Transaction type label (13px Medium white) + note text (11px Regular white40)
     - Right: Signed amount (13px SemiBold)
       - Positive amounts: red (debt increase)
       - Negative amounts: green (debt decrease)
       - Retours: blue
       - Avoirs: amber

---

### 7.9 New Operation Screen
- **Route:** `NewOperation` (params: storeId?, type?)
- **Header:** TopBar with title "Opération", back arrow
- **Content (top to bottom):**

1. **Section: "TYPE D'OPÉRATION"**
2. **2×2 grid of operation type cards** (47% width each, gap: 8px)
   Each card: bg3, borderRadius: xl, 1.5px border, centered icon (22px) + label (11px)
   - **Selected:** lime border, limeDim bg, lime icon/text
   - **Unselected:** borderLight border, bg3 bg, white40 icon/text
   - Types: Livraison (car), Paiement (cash), Retour (return), Avoir (pricetag)

3. **Section: "MAGASIN"**
4. **Store picker:**
   - **If store selected:** Card showing selected store — avatar (40×40, white06 bg, initials) + name + neighborhood/debt info + chevron. Tappable to change.
   - **If no store selected:** Card with full StoreRow list to pick from

5. **Section: "DÉTAIL LIVRAISON"** (dynamic label)
6. **Detail form card** (bg3, borderRadius: xl, borderLight border)
   Each row: icon (16px, white40) + label (12px white40) + value/input
   - "Articles livrés" (only for livraison): product names joined by " · "
   - "Montant (DA)": TextInput, number-pad, 14px SemiBold lime, right-aligned
   - "Date": Current date in French format, lime color (read-only)
   - "Note": TextInput, 12px Medium white, right-aligned

7. **Action buttons** (horizontal row, gap: 8px)
   - **Primary:** "Confirmer livraison" — lime bg, pill, checkmark icon + text (ink)
   - **Secondary (livraison only):** "BL" — bg4 bg, pill, print icon + text (white)
     - Triggers Bluetooth printer preview

**On confirm:**
- Creates transaction in local SQLite DB with hash chain
- Updates store balance
- If livraison: prints delivery note via Bluetooth
- Shows success Alert
- Navigates back

---

### 7.10 New Store Screen
- **Route:** `NewStore`
- **Header:** TopBar with title "Nouveau magasin", back arrow
- **Content:**

1. **Section: "INFORMATIONS DU MAGASIN"**
2. **Form fields** (5 fields, each with icon + input):
   Each field: label (11px white40, letterSpacing: 0.5) above input row
   Input row: bg3 bg, borderRadius: md (16px), padding: 14px, icon (16px white40) + TextInput
   - storefront → "Nom du magasin *" (required)
   - location → "Quartier"
   - person → "Gérant"
   - call → "Téléphone"
   - map → "Adresse"

3. **"Enregistrer" button** — lime bg, pill, checkmark icon + text (ink)

**On save:**
- Validates name is required (Alert if empty)
- Creates store in SQLite
- Shows success Alert
- Navigates back

---

### 7.11 Overdue Alerts Screen
- **Route:** `OverdueAlerts`
- **Header:** TopBar with title "Impayés", back arrow
- **Content (top to bottom):**

1. **Warning banner** (redDim bg, borderRadius: xl, padding: 16px, margin: 16px)
   - Left: Icon circle (36×36, redDim bg, warning icon 16px red)
   - Text: "X magasin(s) — plus de 10 jours sans paiement" — 13px Medium, red

2. **Section: "MAGASINS EN ALERTE"**
3. **AlertCard list** — each overdue store with days since last payment and debt amount
   - Each taps → StoreProfile

4. **Section: "TOUS LES MAGASINS PAR DETTE"**
5. **Card with StoreRow list** — same overdue stores sorted by balance
   - Each taps → StoreProfile

---

## 8. Formatting Rules

### Currency (DA — Algerian Dinar)
- **Compact format:** Values ≥ 1000 shown as "127K", "1.2M" etc.
- **Full format:** Locale-formatted with " DA" suffix (e.g., "45 600,00 DA")
- **Negative values:** Shown with minus sign

### Dates (French)
- **Full format:** "15 mai 2026"
- **Short format:** "15 mai 2026" (3-letter month)
- **Null dates:** Shown as "—"
- **Overdue label:** "12j sans paiement" (if ≥10 days and balance > 0)

### Store Initials
- First letter of first 2 words, uppercased (e.g., "Épicerie Ben Ali" → "ÉB")

---

## 9. Global Behaviors

### Offline-First Architecture
- All data stored in local SQLite database
- Transactions queued locally with `sync_status: 'pending'`
- SyncBadge shows pending count
- Manual sync via SyncBadge tap → pushes queue to Supabase cloud

### Security
1. **Device compromise check** — locks app if rooted/jailbroken
2. **Offline timeout** — locks app if no sync in 72+ hours → shows AuthLockScreen
3. **Biometric auth** — requires FaceID/fingerprint on app launch

### Transaction Integrity
- Each transaction has a `hash_signature` computed from tx data + previous hash
- Forms a blockchain-style chain per store
- Prevents tampering with historical records

### Bluetooth Printing
- Delivery notes can be printed via Bluetooth thermal printer
- Print preview available during livraison operations

### Pull-to-Refresh
- Available on Dashboard screen
- Refreshes all KPIs, charts, store list, and sync count

---

## 10. Screen Dimensions Reference

All screens assume content scrolls under a floating header (72px from top of safe area) and above a floating tab bar (for tab screens, ~80px from bottom). Non-tab screens (StoreProfile, History, etc.) don't have the tab bar but may have bottom action docks.

| Element | Height |
|---------|--------|
| TopBar floating header | ~56px pill + padding |
| Tab bar | ~60px pill + bottom inset |
| Content top padding | safeAreaTop + 72px |
| Content bottom padding | safeAreaBottom + 100px |
