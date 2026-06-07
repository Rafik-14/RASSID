# RASSID — App Copy & Structure Reference

This document maps out the exact structure and text (copy) of every screen in the RASSID app. Use this reference when adapting a new design to ensure all required content, labels, and data fields are accounted for.

> **Language:** French
> **Context:** B2B Distribution app used by field sales reps to track stores, deliveries, and debts.

---

## 1. Global Navigation & Menus

### Bottom Tab Bar (Main Menu)
- **Accueil** (Home) → Dashboard
- **Livraisons** (Deliveries) → Deliveries list / empty state
- **Paiements** (Payments) → Payments list / empty state
- **Magasins** (Stores) → Stores directory

### Top Header (Standard on most screens)
- **Left:** Back Arrow `←` (except on Dashboard, which shows Rep's Avatar)
- **Center:** Screen Title (e.g., "Magasins", "Opération", or the Store Name)
- **Right:** Contextual action (e.g., Notification bell on Dashboard)

---

## 2. Screen Breakdown

### 2.1 Splash & Authentication
**Context:** App load and security checks.
- **Logo:** `RASSID`
- **Dynamic Messages (if locked):**
  - `"Aucune synchronisation serveur depuis plus de 72 heures. Connectez-vous et synchronisez."`
  - `"Appareil non sécurisé détecté."`
  - `"Authentification requise"`

---

### 2.2 Dashboard (Accueil)
**Context:** Home screen summarizing rep's daily performance and alerts.
- **Greeting Section:**
  - `"Bonjour, [Nom du Livreur]"`
  - `"Voici votre résumé"`
- **Sync Status Badge:**
  - If pending: `"[X] en attente"`
  - If synced: `"Synchronisé"`
- **KPI Bento Grid:**
  - `"CRÉANCES"` / Tag: `"Dette active"` / Value: `[Montant Total] DA` (Red)
  - `"MAGASINS"` / Value: `[Nombre]`
  - `"ENCAISSÉ"` / Value: `[Montant]` (Green)
- **Section: ACTIVITÉ**
  - Chart 1: `"LIVRAISONS"` / Subtitle: `"marchandises livrées ce mois"` / Value: `[Montant]`
  - Chart 2: `"PAIEMENTS REÇUS"` / Subtitle: `"encaissé ce mois"` / Value: `[Montant]`
- **Section: ALERTES** *(Hidden if no debts)*
  - Link: `"Voir les impayés >"`
- **Section: ROUTE DU JOUR**
  - List of stores to visit (Store Name, Neighborhood, Phone, Debt Amount)

---

### 2.3 Magasins (Stores Directory)
**Context:** Searchable list of all clients.
- **Header Title:** `"Magasins"`
- **Search Bar:** Placeholder: `"Rechercher un magasin…"`
- **Section Header:** `"[X] MAGASIN(S)"`
- **List Items:** Store Avatar, Store Name, `"[Quartier] · [Téléphone]"`, Debt Amount.
- **Primary Action Button:** `"Nouveau magasin"`

---

### 2.4 Fiche Magasin (Store Profile)
**Context:** Detail view for a specific client.
- **Header Title:** `[Nom du Magasin]`
- **Hero Card:**
  - Main Value: `[Montant] DA`
  - Status Subtitle: `"Doit au distributeur"` (Red) OR `"Compte soldé"` (Green)
- **Section: INFORMATIONS**
  - `"Gérant"` → `[Nom]`
  - `"Téléphone"` → `[Numéro]`
  - `"Quartier"` → `[Nom du quartier]`
  - `"Dette actuelle"` → `[Montant]`
  - `"Total livré"` → `[Montant]`
  - `"Total encaissé"` → `[Montant]`
  - `"Dernière livraison"` → `[Date]`
  - `"Dernier paiement"` → `[Date]`
- **Navigation Button:** `"Historique des opérations >"`
- **Bottom Action Dock (Fixed at bottom):**
  - `"Livraison"` (Primary)
  - `"Paiement"`
  - `"Retour"`
  - `"Avoir"` (Credit note)

---

### 2.5 Historique (Store History)
**Context:** Timeline of transactions for a specific store.
- **Header Title:** `"Historique"`
- **Filter Pills:** `"Tout"`, `"Livraisons"`, `"Paiements"`, `"Retours"`
- **List Grouping:** Grouped by Date (e.g., "15 mai 2026")
  - Group Header: `"[Date]"` / `"[+Montant] DA dette"`
- **Transaction Row:**
  - Type: `"Livraison"` | `"Paiement"` | `"Retour"` | `"Avoir"`
  - Note: `[Texte libre ou articles]`
  - Amount: `[+ / - Montant]`

---

### 2.6 Nouvelle Opération (New Transaction)
**Context:** Form to log a delivery, payment, return, or credit note.
- **Header Title:** `"Opération"`
- **Section: TYPE D'OPÉRATION**
  - 4 Selectable Cards: `"Livraison"`, `"Paiement"`, `"Retour"`, `"Avoir"`
- **Section: MAGASIN**
  - Selected State: `"[Nom du Magasin]"` / `"[Quartier] · Dette: [Montant]"`
  - Unselected State: Scrollable list of stores to pick from.
- **Section: DÉTAIL [TYPE]** (e.g., DÉTAIL LIVRAISON)
  - `"Articles livrés"` → `[Liste des produits]` (Only for deliveries)
  - `"Montant (DA)"` → Input (Placeholder: `"0"`)
  - `"Date"` → `[Aujourd'hui]` (Read-only)
  - `"Note"` → Input (Placeholder: `"Note…"`)
- **Action Buttons:**
  - Primary: `"Confirmer [type]"` (e.g., "Confirmer livraison")
  - Secondary (Deliveries only): `"BL"` (Preview Bluetooth Bon de Livraison)

---

### 2.7 Nouveau Magasin (New Store Form)
**Context:** Form to add a new client.
- **Header Title:** `"Nouveau magasin"`
- **Section: INFORMATIONS DU MAGASIN**
- **Inputs:**
  - `"Nom du magasin *"` (Required)
  - `"Quartier"`
  - `"Gérant"`
  - `"Téléphone"`
  - `"Adresse"`
- **Action Button:** `"Enregistrer"`

---

### 2.8 Impayés (Overdue Alerts)
**Context:** Dedicated screen for high-risk debts.
- **Header Title:** `"Impayés"`
- **Warning Banner:**
  - `"[X] magasin(s) — plus de 10 jours sans paiement"`
- **Section: MAGASINS EN ALERTE**
  - List of high-risk stores showing: `"[Nom du Magasin]"` and `"Dernier paiement: il y a [X] jours"`
- **Section: TOUS LES MAGASINS PAR DETTE**
  - Standard store list sorted by highest debt first.

---

### 2.9 Livraisons & Paiements (Main Tabs - Empty/Landing States)
**Context:** Landing pages for the Deliveries and Payments tabs.
- **Header Title:** `"Livraisons"` or `"Paiements"`
- **Hero Title:** `"Livraisons"` or `"Paiements"`
- **Description:**
  - For Deliveries: `"Enregistrez une livraison depuis la fiche magasin ou créez une nouvelle opération."`
  - For Payments: `"Enregistrez un encaissement depuis la fiche magasin ou via une nouvelle opération."`
- **Primary Button:** `"Nouvelle livraison"` or `"Nouveau paiement"`

---

## 3. Data Formatting Rules
- **Currency:** Values are formatted with a space as a thousands separator and " DA" suffix (e.g., `45 600 DA`).
- **Dates:** French formatting (e.g., `15 mai 2026`).
- **Signs:** Debt increases are positive (`+`), Debt payments/reductions are negative (`-`).
