# SIMS — sims.abler.tirol

Inventory Management System für das **abler.tirol** Ökosystem.
NX Monorepo mit Angular 21 Frontend und NestJS 11 Backend.

---

## Projektstruktur

```
sim-system/
├── apps/
│   ├── server/          → NestJS 11 REST API (Port 3000)
│   └── sim-system/      → Angular 21 Frontend (Port 4200)
├── package.json         → Root — alle Dependencies
├── nx.json
└── tsconfig.base.json
```

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | Angular 21, Standalone Components, Signals |
| Backend | NestJS 11, TypeORM 0.3, better-sqlite3 |
| Monorepo | NX 22 |
| PDF | pdfmake 0.2 |
| API-Docs | Swagger (`GET /api/v1/doc`) |
| Design | abler.tirol Design-System (Teal) |

---

## Setup

### Voraussetzungen

- Node.js 20+
- `npm install` **ohne** `--ignore-scripts` (kompiliert `better-sqlite3` native binary)

```bash
npm install
```

### Umgebungsvariablen

Datei `apps/server/.env` anlegen (Vorlage: `apps/server/.env.example`):

```env
NODE_ENV=development
APP_PORT=3000
CORS_ORIGIN=http://localhost:4200

SQLITE_PATH=sim.db
SQLITE_RUN_MIGRATION=false
SQLITE_RUN_SYNCHRONIZE=true
SQLITE_ENTITIES=dist/**/*.entity.js

PDF_SLIP_PATH=./pdfs/slips
PDF_BILL_PATH=./pdfs/bills
```

---

## Dev-Server starten

```bash
# Backend (Port 3000)
npx nx serve server

# Frontend (Port 4200 → Proxy → 3000)
npx nx serve sim-system
```

Frontend: `http://localhost:4200`
API-Docs: `http://localhost:3000/api/v1/doc`

---

## NX-Befehle

```bash
# Builds
npx nx build server
npx nx build sim-system
npx nx build sim-system --configuration=production

# Tests
npx nx test server
npx nx test sim-system

# TypeORM Migrations
npm run migration:generate --name=MigrationName
npm run migration:run
npm run migration:revert
npm run migration:show
```

---

## API-Routen (`/api/v1/`)

### Artikel
| Method | Route | Beschreibung |
|---|---|---|
| GET | `/articles` | Alle Artikel |
| GET | `/articles?code=X` | Artikel nach Barcode |
| POST | `/articles` | Artikel anlegen |
| PATCH | `/articles/:id` | Artikel updaten |
| DELETE | `/articles/:id` | Artikel löschen |
| POST | `/articles/:id/inventory` | Inventurbuchung |
| POST | `/articles/import` | CSV-Import |
| GET | `/articlegroups` | Artikelgruppen |

### Kunden
| Method | Route | Beschreibung |
|---|---|---|
| GET | `/customers` | Alle Kunden |
| GET | `/customers/:id` | Kunde by ID |
| POST | `/customers` | Kunde anlegen |
| PATCH | `/customers/:id` | Kunde updaten |
| DELETE | `/customers/:id` | Kunde löschen |
| GET | `/customers/:id/slipsheets` | Lieferscheine des Kunden |
| GET | `/customers/:id/bills` | Rechnungen des Kunden |
| PUT | `/customers/:id/discounts` | Rabatt setzen |
| DELETE | `/customers/:id/discounts/:dId` | Rabatt löschen |

### Lieferscheine
| Method | Route | Beschreibung |
|---|---|---|
| GET | `/slipsheets` | Alle Lieferscheine |
| GET | `/slipsheets/:id` | Lieferschein by ID |
| POST | `/slipsheets` | Lieferschein anlegen |
| PUT | `/slipsheets/:id` | Lieferschein updaten |
| POST | `/slipsheets/:id` | Order-Entry hinzufügen |
| GET | `/slipsheets/:id/pdf` | PDF generieren |
| POST | `/slipsheets/:id/print` | Drucken |

### Rechnungen
| Method | Route | Beschreibung |
|---|---|---|
| GET | `/bills` | Alle Rechnungen |
| POST | `/bills/generate` | Rechnung aus Lieferscheinen erzeugen |
| PUT | `/bills/:id` | Rechnung updaten |
| POST | `/bills/:id` | Rechnung neu erstellen (recreate) |
| GET | `/bills/:id/pdf` | PDF generieren |

### Sonstiges
| Method | Route | Beschreibung |
|---|---|---|
| PUT | `/order-entries/:id` | Order-Entry updaten |
| DELETE | `/order-entries/:id` | Order-Entry löschen |
| GET | `/dashboard/summary` | Dashboard KPIs |

---

## Frontend-Routing

```
/                          → /dashboard
/dashboard                 → Dashboard (KPIs)
/articles                  → Artikelliste
/articles/:id              → Artikeldetail
/inventory                 → Inventurbuchung (Mobile-optimiert)
/customers                 → Kundenliste
/customers/new             → Kunde anlegen
/customers/:id             → Kundendetail + Lieferschein/Rechnungsansicht
/customers/:id/edit        → Kunde bearbeiten
/slipsheets                → Lieferscheinliste
/slipsheets/:id            → Lieferscheindetail
/order/new                 → Neue Bestellung / Lieferschein anlegen
/bills                     → Rechnungsliste
/bills/:id                 → Rechnungsdetail
/login                     → Login
```

---

## Design-System

Akzentfarben (Teal):

```css
--accent-primary:   #134e4a
--accent-secondary: #0f3d3a
--accent-highlight: #14b8a6
--accent-light:     #f0fdfa
```

Fonts (geladen von `api.abler.tirol`):
- Headlines: `DM Serif Display`
- Interface: `Inter`
- Code / Labels / Tags: `DM Mono`

Regeln:
- Buttons: `border-radius: 999px` (Pill-Form)
- Cards: `border-radius: 6px`
- Kein reines Schwarz — immer `var(--ink)`
- Keine System-Fonts

---

## Bekannte offene Punkte

### Bugs
- `GET /slipsheets/:id` gibt durch falsches Array-Indexing `undefined` zurück — Workaround: Daten immer über `GET /customers/:id/slipsheets` laden
- `GET /bills/:id/pdf` hat Side-Effects (erzeugt Rechnung bei jedem Aufruf neu)
- `generateBill()` löscht im Fehlerfall bestehende Rechnungen
- Nummernvergabe für Rechnungen/Lieferscheine ohne DB-Lock (Race Condition)
- `inventoryDate` ist `@CreateDateColumn` statt normalem `@Column`

### Offen
- Auth / JWT Guards sind noch auskommentiert — API aktuell offen
- Login-Page ist ein Stub (leitet nur weiter)
- Docker-Setup (`docker-compose.dev.yml`) noch nicht mit Monorepo-Struktur getestet

---

## Wichtige Dateipfade

```
apps/server/src/main.ts                    → NestJS Bootstrap
apps/server/src/app/app.module.ts          → Root Module
apps/server/src/app/models/               → Entities, Services, Controller
apps/server/src/common/services/          → PDF-Generierung etc.
apps/server/src/datasource.ts             → TypeORM DataSource (Migrations)
apps/server/.env                          → Umgebungsvariablen (gitignored)
apps/server/.env.example                  → Vorlage

apps/sim-system/src/main.ts               → Angular Bootstrap
apps/sim-system/src/app/app.config.ts     → Provider-Konfiguration
apps/sim-system/src/app/app.routes.ts     → Root-Routing
apps/sim-system/src/app/services/         → Angular Services
apps/sim-system/src/app/models/           → TypeScript Datenmodelle
apps/sim-system/src/app/views/            → Seiten-Komponenten
apps/sim-system/src/app/components/       → Shared Components (SlipsheetEditor)
apps/sim-system/src/styles/               → Design-System CSS
apps/sim-system/src/environments/         → API-URL Konfiguration
```
