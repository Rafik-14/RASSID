# RASSID

## Project Description
Distribution Amine is a mobile-first field sales and debt management application designed for food distribution representatives. The app enables a distributor — in this case, a sales rep named Amine — to manage an entire client portfolio of stores directly from their smartphone. The dashboard provides an at-a-glance overview of key performance indicators, including total outstanding receivables (créances), number of active stores, and cash collected for the day, accompanied by a visual bar chart for trend tracking and real-time alerts for overdue accounts. Each store profile (fiche magasin) displays the client's contact details, current debt balance, total goods delivered versus total payments received, and the dates of the last delivery and payment. From a store's profile, the rep can record four types of transactions that directly affect the client's running debt balance: a Livraison (delivery), which logs goods delivered and increases the debt; a Paiement (payment), which records cash or other payments collected and reduces the debt; a Retour (merchandise return), which credits back expired or incorrectly delivered goods; and an Avoir (commercial credit), which applies a loyalty discount or goodwill adjustment. Every transaction is logged in a full operation history, giving the rep a complete, chronological audit trail for each store visit. The app also supports printing delivery notes (bons de livraison) for client signatures. Designed for daily fieldwork in French-speaking markets (with amounts in Algerian Dinar), Distribution Amine streamlines the entire visit workflow — from route planning and debt prioritization to on-site transaction recording and end-of-day reconciliation — all within a clean, dark-themed mobile interface.

## Product Requirements Document
# Product Requirements Document: RASSID (Distribution Amine)

## 1. Executive Summary
RASSID is a mobile-first, local-first field sales and debt management application for food distribution representatives. The application provides a robust, dark-themed environment for managing client portfolios, recording daily transactions, and handling debt collection in offline-heavy environments. The primary goal is to ensure 100% operational continuity for field agents (Amine) regardless of internet connectivity, with reliable reconciliation to a central PostgreSQL database.

## 2. Target Audience & Problem Statement
Field sales representatives in French-speaking markets (specifically Algeria) face significant challenges with disconnected urban environments and manual bookkeeping. RASSID replaces paper-based, fragmented workflows with an optimized, hardware-integrated mobile solution that handles calculations locally, ensuring data integrity and administrative transparency.

## 3. Core Functional Requirements
### 3.1. Dashboard & KPI Tracking
- Real-time display of total outstanding receivables (créances).
- Counter for active stores and daily cash collection.
- Visual bar chart for historical trend tracking.
- Critical status indicators for overdue accounts.
- Daily synchronization status badge.

### 3.2. Store Profile (Fiche Magasin)
- Comprehensive client view: Contact details, current debt balance, delivery vs. payment history.
- Chronological operation log per store.
- Direct access to transaction recording (Livraison, Paiement, Retour, Avoir).

### 3.3. Transaction System
- **Livraison:** Multi-item selection via barcode, quantity adjustment, and automatic debt increment.
- **Paiement:** Record cash/method, reducing the client's current debt balance.
- **Retour:** Log expired/returned goods with photo documentation.
- **Avoir:** Commercial credits for discounts or adjustments.

## 4. Hardware & Technical Integrations
- **Thermal Printing:** Bluetooth-based ESC/POS printing for signed delivery notes.
- **Barcode Scanner:** Local-catalogue lookup (<1s latency) for instant product identification.
- **Camera Pipeline:** 
    - In-app photography for signed BLs and return proofs.
    - Automatic compression (WebP, grayscale, ~35KB) to preserve storage and bandwidth.
- **Security:** Biometric enforcement (foreground) and OS root/jailbreak detection.

## 5. Offline & Synchronization Architecture
- **Source of Truth:** Local SQLite database (Expo-SQLite) acts as the primary record holder during the workday.
- **Optimistic UI:** Immediate UI updates for balances, decoupled from network latency.
- **Sync Protocol:** Chronological, append-only queue (sync_status flag).
- **Conflict Resolution:** Reconciliation step required for manual conflict resolution if server-side data deviates from local records.
- **Sync Trigger:** Manual trigger + automatic background sync when connectivity is restored.

## 6. UI/UX & Design Guidelines
- **Theme:** Ultra-dark mode (backgrounds from #0a0a0a to #2e2e2e).
- **Branding:** Lime Green (#7FE300) for primary actions; Semantic colors for alerts (Red: #ff4d4d, Amber: #EF9F27, Blue: #378ADD).
- **Accessibility:** 
    - WCAG compliance: Screen reader accessibility (aria-hidden).
    - Color-blind safety: Financial statuses include explicit text labels.
    - Contrast: Automatic inversion for components using the Lime Green background.
- **Typography:** Inter font family with specific weights (400, 500, 600) for hierarchy.
- **Geometry:** Strict radii for brand consistency (32px containers, 14px cards, 11px buttons).

## 7. Security & Compliance
- **Encryption:** SQLCipher for database-at-rest encryption.
- **Key Management:** Hardware-backed storage (iOS Keychain/Android Keystore).
- **Tamper-Proofing:** Row-level hashing with chained ledger dependency to prevent offline data modification.
- **Data Protection:** Screenshot/Screen-recording blocking enabled.
- **Offline Time-Bomb:** Automatic encryption key purge if no server handshake occurs within a 72-hour window.

## 8. Scalability & Financial Constraints
- **Database Efficiency:** 
    - Integer-based currency storage (Dinar).
    - Rolling 60-day active ledger; data archiving to CSV/Excel for long-term storage.
    - Normalized lookups (SMALLINT/CHAR) for database footprint reduction.
- **Budgeting:** 
    - Managed on Supabase Free Tier.
    - Batch sync payloads to stay under the 2-million API request monthly limit.
    - Asset management: Strict 1GB limit enforced through aggressive image compression and purging.

## 9. Development Phases
- **Phase 1 (MVP):** Fully functional offline field-rep application including Bluetooth printing, barcode scanning, local database operations, and the append-only sync queue.
- **Phase 2 (Post-MVP):** Web-based Manager Dashboard for route administration, catalog management, and advanced reporting.

## Technology Stack
TECHSTACK: RASSID

1. OVERVIEW
RASSID is engineered as a local-first, mobile-centric application. Given the requirement for 100% operational capability in offline field environments (urban distribution routes), the architecture prioritizes device-side data persistence and native hardware integration, with cloud synchronization acting as a secondary reconciliation layer rather than a primary dependency.

2. MOBILE FRAMEWORK
- Core Platform: React Native via Expo.
- Justification: Expo provides the most efficient bridge between React-based UI development and native device APIs. It allows for a unified code base that leverages the same business logic for UI rendering, offline storage, and hardware peripherals.
- Styling: Standardized CSS-in-JS/StyleSheet system using CSS variables (:root) to enforce the dark-themed visual ecosystem (#0a0a0a background, #7FE300 primary accent).

3. LOCAL DATA PERSISTENCE & STORAGE
- Primary Database: expo-sqlite.
- Justification: Offers a robust, relational SQL-compliant engine running entirely within the device sandbox. Essential for complex ledger operations and relational data (Products, Stores, Transactions).
- Security: Encrypted at rest via SQLCipher. Encryption keys are managed via hardware-backed Secure Enclave (iOS Keychain / Android Keystore) to ensure that even if the physical device is compromised, data remains encrypted.
- Object Storage: Local filesystem for temporary caching of compressed images (signed BLs and returns) before background upload to Supabase Storage.

4. HARDWARE INTEGRATION LAYER
- Thermal Printing: react-native-bluetooth-escpos-printer, handling direct ESC/POS byte-stream transmission for Bluetooth-enabled mobile thermal printers.
- Barcode Scanning: expo-camera with integrated local lookup. Scanning triggers a sub-second SELECT query against the local SQLite product catalog, ensuring zero-latency identification without network access.
- Image Processing: expo-image-manipulator, performing automated compression (downscaling, Grayscale WebP conversion, ~35KB target size) at the moment of capture to preserve data integrity and storage limits.

5. CLOUD GATEWAY & SYNC PROTOCOL
- Backend Provider: Supabase (PostgreSQL).
- Sync Architecture: Append-only, queue-based batch processing. Transactions are stored locally with a 'pending' flag. The Supabase JS client (@supabase/supabase-js) invokes an atomic RPC function to push entire queues in a single request, optimizing the 2-million API request limit.
- Conflict Handling: Last-write-wins logic with manual reconciliation prompts for high-level ledger discrepancies (e.g., administrator-side adjustments).

6. SECURITY & INTEGRITY
- Tamper-Proofing: Chained hashing for all transaction rows. Each record includes a hash of the previous record, enabling the backend to detect unauthorized data manipulation when the device syncs.
- Environment Protections: Native implementation of Root/Jailbreak detection to deny application execution on compromised operating systems.
- Data Privacy: Forced biometric re-authentication (FaceID/Fingerprint) on every app resume, combined with an offline "Time-Bomb" mechanism that purges encryption keys if no server handshake occurs within 72 hours.

7. SCALABILITY & COST OPTIMIZATION
- Currency Handling: All financial values (DZD) are stored as integers to eliminate floating-point errors and minimize database storage footprint.
- Data Retention: Enforced 60-day rolling ledger window on the device and server. Older records are archived to CSV/Excel files (via application export) and purged from the database to maintain performance and stay under the 500MB storage tier.
- API Efficiency: Sync is strictly manual or semi-automated (twice daily) to preserve the 2,000,000 monthly request budget.

## Project Structure
# PROJECT STRUCTURE: RASSID

## 1. Directory Overview
The RASSID project follows a modular, feature-based React Native architecture optimized for an Expo-managed workflow. The structure is designed to enforce a clear separation between the local-first data layer (SQLite) and the UI/UX presentation layer, ensuring high maintainability for the field-sales application.

## 2. Folder Hierarchy
root/
├── assets/             # Brand identity: Fonts (Inter), Icons (Tabler), and Splash screens
├── src/
│   ├── api/            # Supabase JS Client initialization and RPC sync protocols
│   ├── components/     # Atomic UI library (Pills, Cards, Buttons) with CSS variables
│   ├── config/         # Environment variables and hardware constant configurations
│   ├── database/       # SQLite schema definitions, migrations, and encryption logic
│   ├── hooks/          # Custom hooks for hardware interaction (Bluetooth, Camera)
│   ├── navigation/     # React Navigation stack configuration
│   ├── screens/        # Main route screens (Dashboard, StoreList, StoreProfile, Transaction)
│   ├── services/       # Business logic (Print formatter, Image compression, Sync queue)
│   ├── store/          # Local state management (Optimistic UI logic)
│   ├── utils/          # Formatting helpers (Currency/DA, Hashing/Security)
│   └── types/          # TypeScript interfaces for transactions, stores, and products
├── app.json            # Expo configuration (Native permissions: Bluetooth, Camera)
└── package.json        # Project dependencies (SQLCipher, Bluetooth-ESC-POS, Supabase-JS)

## 3. Key Module Explanations

### 3.1. database/ (The Source of Truth)
Contains the local SQLite integration. This directory holds the initial schema (DDL) for storing product catalogues, store profiles, and the append-only transaction ledger. Logic for SQLCipher encryption resides here to ensure all data at rest is secure against device tampering.

### 3.2. services/ (Hardware & Sync Layer)
- printerService.ts: Handles the translation of transaction data into ESC/POS byte streams for thermal hardware.
- imageProcessor.ts: Implements the expo-image-manipulator pipeline, reducing captured photos to 35KB grayscale WebP files.
- syncService.ts: Manages the 'Append-Only' queue. Responsible for batching transactions, executing hash-chain validation, and pushing payload arrays via Supabase RPC.

### 3.3. components/ (Design System)
Reflects the strict RASSID branding guidelines.
- .ui-cards: Enforces the 13px-14px border-radius standard.
- .pill-states: Houses the color-coded indicators for debt (e.g., --red for overdue, --lime for positive balance) with automated contrast-inversion logic.
- .buttons: Implements the 11px border-radius and semantic interaction states.

### 3.4. api/
Contains the interface to the Supabase cloud gateway. This layer is exclusively invoked during the scheduled "twice-daily" sync or when the user triggers a manual refresh. It maintains the logic for conflict resolution, where local and server-side state differences are flagged for review.

## 4. Architectural Constraints Implementation
- Security Layer: Hardware-backed encryption (Android Keystore/iOS Keychain) is orchestrated through modules in /services, protecting the database encryption keys.
- Offline Handling: All screen components in /screens are built with 'Offline-First' dependency. They query local SQLite instances directly, rendering the UI instantly without awaiting a network response.
- Scalability & Purging: The logic for the 60-day rolling data-retention window is defined in /database/migrations, ensuring the local SQLite footprint remains lean and within the operational performance thresholds of mobile hardware.

## Database Schema Design
## SCHEMADESIGN: RASSID DATABASE ARCHITECTURE

### 1. OVERVIEW
The RASSID application utilizes a local-first architecture with a relational database structure designed for high-performance offline operations. The schema is optimized for integer-based financial calculations to ensure precision and storage efficiency, strictly adhering to the Algerian Dinar (DA) currency format.

### 2. CORE DATA TABLES

#### A. STORES (Magasins)
- store_id: UUID (Primary Key)
- name: VARCHAR(255) (Store commercial name)
- neighborhood: VARCHAR(100) (e.g., \"Bab El Oued\")
- contact_person: VARCHAR(100)
- phone: VARCHAR(20)
- address: TEXT
- current_balance: INTEGER (Total outstanding debt in DA)
- last_delivery_date: TIMESTAMP
- last_payment_date: TIMESTAMP
- sync_status: VARCHAR(20)

#### B. PRODUCTS (Catalogue)
- product_id: UUID (Primary Key)
- barcode: VARCHAR(50) (Indexed for rapid lookup)
- name: VARCHAR(255)
- unit_price: INTEGER (Stored in DA)
- category_id: SMALLINT
- photo_url: TEXT (Local path or Cloud URI)

#### C. TRANSACTIONS (Operations Ledger)
- tx_id: UUID (Primary Key)
- store_id: UUID (Foreign Key)
- tx_type: SMALLINT (1: Livraison, 2: Paiement, 3: Retour, 4: Avoir)
- amount: INTEGER (Signed integer representing the debt impact)
- reference_no: VARCHAR(50) (BL/Receipt sequence)
- hash_signature: TEXT (Cryptographic hash for tampering detection)
- parent_hash: TEXT (Chained ledger reference)
- sync_status: VARCHAR(20) (pending | synced | conflict)
- created_at: TIMESTAMP

#### D. TRANSACTION_ITEMS (Line Items)
- item_id: UUID
- tx_id: UUID (Foreign Key)
- product_id: UUID (Foreign Key)
- quantity: INTEGER
- price_at_time: INTEGER

#### E. MEDIA (Evidence Attachments)
- media_id: UUID
- tx_id: UUID (Foreign Key)
- local_path: TEXT
- cloud_url: TEXT
- media_type: VARCHAR(20) (BL_SIGNATURE | RETURN_ITEM)
- compressed: BOOLEAN

### 3. RELATIONAL INTEGRITY & CONSTRAINTS
- Referential Integrity: Transactions are hard-linked to Store IDs. Deletion of stores is prohibited (soft-delete only) to maintain audit trails.
- Chained Hashing: Every new transaction row includes a `parent_hash` derived from the `tx_id` and `amount` of the preceding transaction, ensuring that offline database tampering is detected during the server-side sync.
- Currency Storage: All monetary fields are defined as INTEGER (e.g., 12400 DA). Decimals are strictly forbidden to eliminate floating-point arithmetic errors.

### 4. SYNC & OPTIMIZATION LOGIC
- Append-Only Queue: The `sync_status` flag defaults to 'pending'. The sync process executes an atomic Remote Procedure Call (RPC) that pushes all 'pending' transactions in chronological order.
- Indexed Lookups: Indexes are explicitly defined on `stores.name`, `products.barcode`, and `transactions.store_id` to ensure sub-millisecond retrieval on mobile hardware.
- Data Retention: A 60-day rolling window is enforced via a cleanup task. Transactions older than 60 days are moved to cold storage (CSV/Excel archives) and purged from the active SQLite database to keep the local footprint well below the 500 MB limit.

### 5. SECURITY & ENCRYPTION
- Local Storage: The SQLite database file is encrypted at rest using SQLCipher.
- Key Management: Encryption keys are never stored in the database. They are generated and protected by the device-level hardware enclave (Android Keystore/iOS Keychain).
- Row-Level Signing: Every entry in the `transactions` table is cryptographically signed upon creation to ensure the integrity of the ledger during offline periods.

### 6. SCALABILITY PARAMETERS
- The schema is normalized (3NF) to minimize storage requirements.
- Field usage utilizes SMALLINT for categorical data (operation types, status codes) to conserve bytes.
- Photographic evidence is stored as compressed WebP files (max 40 KB per image) to maximize the 1 GB cloud object storage capacity.

## User Flow
USERFLOW: RASSID

1. AUTHENTICATION & SECURITY GATEWAY
- Entry Point: The app launches into a dark-themed splash screen. 
- Biometric Trigger: Immediately upon mounting the app, an OS-level biometric prompt (FaceID/Fingerprint) is triggered. Access is blocked until successful authentication.
- Offline Enforcement: The app checks for a valid local session token. If the app has been offline for >72 hours (Time-Bomb policy), the screen remains locked, displaying a 'Sync Required' message. The UI refuses to proceed until the device is connected to a network to re-validate via the Supabase Auth handshake.
- Jailbreak Guard: The app performs a silent environment scan on boot. If root or jailbreak status is detected, the app displays a system security alert and terminates the process.

2. DASHBOARD & ROUTE OVERVIEW
- Entry Flow: Upon authentication, the rep lands on the 'Today's Route' dashboard.
- Visual Hierarchy: 
    - Top Header: Shows synchronization status (Cloud icon with green/amber badge for pending transactions) and Date/User profile.
    - KPI Cluster: Three cards (Total Créances, Active Stores, Cash Collected) using the brand color Lime Green for positive data points.
    - Visual Tracking: A horizontal bar chart component representing daily progress vs. targets.
    - Feed: A scrollable list of assigned stores for the current day, categorized by neighborhood (e.g., 'Bab El Oued'), sorted by debt urgency (Overdue accounts prioritized).

3. STORE PROFILE (FICHE MAGASIN)
- Access: Tapping a store card from the dashboard or via search opens the full profile.
- Layout: 
    - Header: Store Name, Location, and 'Call' / 'Navigate' shortcut icons.
    - Debt Display: A prominent card showing the 'Current Balance'. Overdue status is signaled by a Red badge (e.g., '18j sans paiement').
    - Metadata: Last Delivery Date, Last Payment Date, and Volume stats.
    - Action Footer: Persistent bottom-fixed buttons for the four transaction types: [Livraison], [Paiement], [Retour], [Avoir].

4. TRANSACTIONAL WORKFLOWS (THE CORE FOUR)
- Shared Pattern: All transactions follow a modal-style transition (Slide-up card).
- Livraison (Delivery): 
    1. Launch Scanner: Camera activates via Expo-Camera; barcode identified locally via SQLite.
    2. Product Card: Item appears with name, photo, and price.
    3. Quantity Adjustment: +/- stepper buttons; default to 1.
    4. Confirmation: List view generates a temporary bill summary before saving.
    5. Completion: 'Confirmer Livraison' triggers the local write, prints the BL via Bluetooth, and prompts for a photo of the signature.
- Paiement (Payment):
    1. Input Field: Enter amount collected (Dinars).
    2. Reference: Record payment method (Cash/Check).
    3. Validation: Instant update to local debt balance (Optimistic UI).
- Retour (Return) & Avoir (Credit):
    1. Item Selection: Search/Scan item.
    2. Evidence: Camera forced trigger to photograph damaged/expired goods.
    3. Reconciliation: Adjustment applied to the store's current balance.

5. HARDWARE INTEGRATION PATTERNS
- Printing (BL): When 'Imprimer' is tapped, the app converts the transaction array into an ESC/POS byte stream. It checks the Bluetooth status; if disconnected, it prompts for re-pairing via the stored 'Preferred Printer' MAC address.
- Camera/Proof: Every photo taken is processed through the Expo-Image-Manipulator pipeline: Grayscale conversion, 80% compression, and resizing to 800px width. These are stored locally as encrypted blobs attached to the specific Transaction ID.

6. SYNCHRONIZATION & RECONCILIATION
- Automatic Sync: Triggered on connection discovery. Data is batched into a single JSON array to respect Supabase API request limits.
- Row-Level Hashing: Every transaction is cryptographically chained (current_hash = hash(transaction_data + previous_row_hash)).
- Conflict Resolution: If the local hash chain fails server-side validation or if the server records a 'dirty' state (manual adjustment by admin), the app triggers a 'Conflict Alert' on the next screen transition, showing a side-by-side comparison (Local vs. Server) for the rep to verify.

7. SECURITY & PRIVACY
- Screenshot Blocking: The app utilizes Native OS flags to disable screen recording/capture while the application is in the foreground.
- Database Protection: All SQLite operations are performed via SQLCipher. The database key is never stored in app code; it is retrieved at runtime from the hardware-backed Secure Enclave (Keychain/Keystore).

## Styling Guidelines
STYLING GUIDELINES: RASSID

1. DESIGN PHILOSOPHY
Rassid is a high-utility, mobile-first field application. The design language prioritizes cognitive clarity and rapid interaction. Because Amine operates in diverse, often high-glare outdoor environments, the interface utilizes a high-contrast dark theme to minimize eye strain and conserve battery life. Every element is designed to be touch-friendly, readable at a glance, and strictly utilitarian.

2. COLOR PALETTE
The interface follows a strict semantic color system defined in the CSS :root. Colors are assigned based on function rather than arbitrary preference.

Primary & Brand Colors:
- Primary Brand Accent (--lime: #7FE300): Used for primary calls-to-action (CTA), active navigation states, and critical positive metrics.
- Secondary Accent Background (--lime2: #1a3300): Used for active tab containers and positive status badges.

Background & Depth Layers (Near-Black System):
- Core Background (--bg: #0a0a0a): Main page wrapper.
- Frame Background (--bg2: #111): Mobile frame and base content area.
- Functional Card (--bg3: #1c1c1c): Individual data groupings and cards.
- Internal Containers (--bg4: #262626) & Borders (--bg5: #2e2e2e): Icon holders and visual dividers.

Semantic Status Tokens:
- Overdue/Alert (--red: #ff4d4d): Critical debt warnings and negative transactions.
- Warning/Moderate Balance (--amber: #EF9F27): Cautionary states.
- Returns/Credit System (--blue: #378ADD): Secondary operational flows (Returns/Avoirs).

Text Tokens:
- Primary Legibility (--white: #f0f0f0): Main content.
- Meta-Labels (--gray: #777): Secondary/diminished information.
- Contrast Inversion (Dark Slate #111): Used only when text is rendered on a bright Lime background.

3. TYPOGRAPHY
- Family: Inter (Sans-serif, Google Fonts).
- Hierarchy & Weights:
  - Regular (400): Supporting body text and labels.
  - Medium (500): Standard data points and list items.
  - Semi-Bold (600): KPIs, critical headers, and primary button text.
- Legibility: Font sizes are optimized for mobile reachability, ensuring that even in sunlight, numeric debt balances and store names are distinguishable.

4. GEOMETRIC SYSTEM (BORDER-RADIUS)
Consistency is maintained through a strictly enforced rounding scale:
- Device Containers: 32px
- Main Layout Frames: 24px
- Data/Content Cards: 13px to 14px
- Actionable Transaction Buttons: 11px

5. UI/UX PRINCIPLES
- Accessible States: All Tabler Icons include aria-hidden=\"true\" to ensure screen reader compatibility. Critical status information is never conveyed by color alone; all alerts are paired with text-based status strings (e.g., \"En retard\").
- Optimistic Feedback: All transactional inputs (Livraison, Paiement, etc.) reflect locally in the UI immediately. The user receives visual confirmation of the balance change before the sync cycle completes.
- Skeuomorphic Hierarchies: Financial data uses bolded containers and clear signifiers to distinguish between debt (créances) and credit (avoirs).
- Density & Scale: The UI is designed to minimize horizontal scrolling. Data is organized vertically, with the most critical information—Store Name and Balance—always visible in the header or primary list position.
- Interaction Hygiene: All interactive elements have a minimum touch target size of 44px to accommodate usage in the field.

6. IMAGE & ASSET MANAGEMENT
- Compression: All captured media (proof of delivery/returns) is processed via the image manipulation pipeline to WebP format.
- Optimization: Photos are downscaled to ~35KB per image and converted to grayscale. This ensures visual evidence remains valid for dispute resolution while strictly adhering to storage constraints.

7. ACCESSIBILITY (WCAG)
- Contrast: The system strictly avoids light-on-bright combinations. When a background switches to #7FE300 (Lime), the text token automatically maps to #111 (Dark Slate).
- Feedback Loops: Because the app operates in offline environments, the UI provides clear visual status badges for \"Sync Pending,\" \"Synced,\" and \"Conflict,\" ensuring the user is never left wondering about the status of their data.
