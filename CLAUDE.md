# SIMS — Übergabe-Kontext für Claude Code

## Projekt-Überblick

**Repository:** `github.com/simonabler/sim-system` · Branch: `first-init`  
**Typ:** NX Monorepo — Fullstack Inventory Management System  
**Stand:** 2026-05-01 (aktualisiert gegen kontext.md 2026-03-22)  
**Teil des:** `abler.tirol` Ökosystems (siehe Design-Prinzipien unten)

---

## Monorepo-Struktur

```
sim-system/
├── apps/
│   ├── server/          → NestJS 11 Backend (REST API)
│   ├── sim-system/      → Angular 21 Frontend (Standalone Components)
│   ├── server-e2e/      → Jest E2E Tests für Backend
│   └── sim-system-e2e/  → Playwright E2E Tests für Frontend
├── libs/
│   └── domain/          → Shared Domain Library (noch nicht wirklich genutzt)
├── storage/             → SQLite Datenbanken
├── dist/                → Build-Artefakte
├── package.json         → Root (alle Dependencies)
├── nx.json
└── tsconfig.base.json
```

---

## Backend (`apps/server`)

### Tech Stack
- NestJS 11, TypeORM 0.3, SQLite, Webpack (via NX)
- Swagger-Docs: `GET /api/v1/doc`
- Global Prefix: `/api/v1`

### Starten
```bash
# Dev (watch mode)
npx nx serve server

# Production build
npx nx build server
node dist/apps/server/main.js
```

### Umgebungsvariablen
Datei: `apps/server/.env` (liegt im .gitignore, `.env.example` als Vorlage)

```env
NODE_ENV=development
APP_PORT=9000
APP_URL=http://localhost:9000
APP_JWT_SECRET=change_me_in_production
SQLITE_PATH=./storage/sims.sqlite
SQLITE_RUN_MIGRATION=true
SQLITE_RUN_SYNCHRONIZE=false
```

### ⚠️ Wichtig beim ersten Setup
`sqlite3` braucht native Kompilierung:
```bash
npm install   # OHNE --ignore-scripts (kompiliert sqlite3 native binary)
```

### API-Routen (alle unter `/api/v1/`)
| Route | Beschreibung |
|---|---|
| `GET /articles` | Alle Artikel |
| `GET /articles?code=X` | Artikel nach Barcode |
| `POST /articles` | Artikel anlegen |
| `PATCH /articles/:id` | Artikel updaten |
| `DELETE /articles/:id` | Artikel löschen |
| `POST /articles/:id/inventory` | Inventurbuchung |
| `POST /articles/import` | CSV-Import |
| `GET /articlegroups` | Artikelgruppen |
| `GET /customers` | Kunden |
| `GET /customers/:id` | Kunde by ID |
| `GET /customers/:id/slipsheets` | Lieferscheine des Kunden |
| `GET /customers/:id/bills` | Rechnungen des Kunden |
| `PATCH /customers/:id` | Kunde updaten |
| `POST /customers` | Kunde anlegen |
| `DELETE /customers/:id` | Kunde löschen |
| `PUT /customers/:id/discounts` | Rabatt setzen |
| `DELETE /customers/:id/discounts/:dId` | Rabatt löschen |
| `GET /slipsheets` | Alle Lieferscheine |
| `GET /slipsheets/:id` | Lieferschein by ID |
| `POST /slipsheets` | Lieferschein anlegen |
| `PUT /slipsheets/:id` | Lieferschein updaten |
| `POST /slipsheets/:id` | Order-Entry hinzufügen |
| `GET /slipsheets/:id/pdf` | Lieferschein als PDF |
| `POST /slipsheets/:id/print` | Drucken |
| `GET /bills` | Alle Rechnungen |
| `POST /bills/generate` | Rechnung aus Lieferscheinen erzeugen |
| `PUT /bills/:id` | Rechnung updaten |
| `POST /bills/:id` | Rechnung neu erstellen (recreate) |
| `GET /bills/:id/pdf` | Rechnung als PDF |
| `GET /dashboard/summary` | Dashboard KPIs |
| `PUT /order-entries/:id` | Order-Entry updaten |

### Behobene Bugs ✅
- ✅ `GET /slipsheets/:id` — Fixed: castet ID auf Zahl, wirft 404 wenn nicht gefunden
- ✅ `GET /bills/:id/pdf` — Fixed: Read-only, erzeugt PDF nicht mehr bei jedem GET
- ✅ `inventoryDate` — Fixed: jetzt normales `@Column({ type: 'datetime', nullable: true })`
- ✅ CORS — Fixed: explizit konfiguriert in `main.ts`, nicht mehr `cors: true`

### Bekannte offene Bugs
- Race Condition: Nummernvergabe hat Retry-Logik, aber keinen echten DB-Lock
- API-Contract-Brüche zwischen Frontend und Backend (siehe Punkt 4 unter "P0")

---

## Frontend (`apps/sim-system`)

### Tech Stack
- Angular 21, Standalone Components, `provideRouter`, `bootstrapApplication`
- `@ng-select/ng-select` für Dropdowns
- `ngx-toastr` für Notifications
- Design: `abler.tirol` Design-System (Steel-Blue für SIMS)

### Starten
```bash
npx nx serve sim-system    # :4200
```

### API-Verbindung
Kein Proxy-File nötig. Das Frontend nutzt `environment.apiUrl`:
- **Dev:** `http://localhost:3000/api/v1`
- **Prod:** Same-Origin (leerer String in Konfiguration)

### Routing-Struktur (aktuell)
```
/dashboard               → DashboardComponent
/articles                → ArticleListComponent
/articles/:id            → ArticleDetailComponent
/customers               → CustomerListComponent
/customers/new           → CustomerEditComponent
/customers/:id           → CustomerDetailComponent
/customers/:id/edit      → CustomerEditComponent
/slipsheets              → SlipsheetListComponent
/slipsheets/:id          → SlipsheetDetailComponent
/bills                   → BillListComponent
/bills/:id               → BillDetailComponent
/inventory               → InventoryListComponent
/order/new               → OrderNewComponent
```
**Hinweis:** Login-Route fehlt noch, ist aber noch nicht implementiert

### Services (alle `providedIn: 'root'`)
- `AuthenticationService` — Login/Logout (JWT in localStorage)
- `ArticleService` — CRUD Artikel + CSV-Import
- `ArticleGroupService` — Artikelgruppen
- `CustomerService` — CRUD Kunden + Discounts + Slipsheets/Bills
- `ShoppingcartService` — Lieferscheine, Orders, Annotations
- `BillService` — Rechnungen
- `DashboardService` — KPI-Summary
- `UserService` — Benutzer

### Interceptors (functional, in `app.config.ts`)
- `backendInterceptor` — Prefixes relative URLs mit `environment.apiUrl`
- `errorInterceptor` — 401 → logout + reload, andere Fehler → Toast

---

## Design-System (`abler.tirol`)

Alle CSS-Variablen sind in `apps/sim-system/src/styles.scss` definiert.

### SIMS Akzentfarben (Steel-Blue / Lager)
```css
--accent-primary:   #1e3a5f;
--accent-secondary: #2d5282;
--accent-highlight: #3b82f6;
--accent-light:     #eff6ff;
```

### Geteilte Neutrals
```css
--bg-light:  #f7f7f4
--ink:       #0f172a
--ink-2:     #475569
--ink-3:     #94a3b8
--border:    #e2e8f0
```

### Fonts (von `api.abler.tirol` geladen)
- Headlines: `DM Serif Display`
- Interface/Body: `Inter`
- Code/Labels/Tags: `DM Mono`

### Regeln
- Buttons immer `border-radius: 999px` (Pill-Form)
- Cards: `border-radius: 2rem`
- Kein reines Schwarz `#000` — immer `var(--ink)`
- Keine System-Fonts
- Max. 2 Akzentfarben gleichzeitig sichtbar

---

## Was bereits erledigt ist ✅

### Migration (Branch `first-init`)
1. **NX Monorepo** — `SIMSystem-backend` + `SIMSystem-frontend` zusammengeführt
2. **Backend auf NestJS 11 / TypeORM 0.3 gebracht:**
   - Alle `src/` absolute Imports → relative Pfade
   - `@hapi/joi` → `joi`
   - `pdfmake` korrekt eingebunden (`Printer.js` default export)
   - `model.repository.ts` für TypeORM v0.3 Generics gefixt
   - `base.service.ts` Generics gefixt
   - sqlite provider mit expliziten Entity-Klassen statt Glob
   - mock-Dateien aus App-Build ausgeschlossen
   - webpack.config.js: `src`-Alias + konditionelle Migrations-Assets
3. **Frontend von Angular 9 → Angular 21 migriert:**
   - Alle NgModules gelöscht → Standalone Components
   - `bootstrapApplication` + `app.config.ts`
   - `provideRouter` / `provideHttpClient` / `provideAnimations` / `provideToastr`
   - Functional Interceptors + Functional Guards
   - `@coreui/angular` + `ngx-bootstrap` + `ngx-perfect-scrollbar` + `angular-datatables` + `ng2-charts` entfernt
   - Eigenes Layout (Sidebar + Topbar + Bottom-Navigation) ohne CoreUI
   - Alle Templates: `bsModal` → native HTML-Dialog, `datatable` → `*ngFor`
   - Routes: Moderne Struktur mit direkten Routen unter `/dashboard`, `/articles`, `/customers`, etc.
   - `styles.scss` komplett neu — volles `abler.tirol` Design-System

---

## Was als nächstes zu tun ist 🔄

### P0 — Für erste lauffähige Version nötig

1. **API-Contract zwischen Frontend und Backend reparieren**
   - Frontend erwartet diese Endpunkte, die es im Backend nicht gibt:
     - `DELETE /customers/:id` — wird vom Frontend aufgerufen, existiert aber nicht im CustomerController
     - `DELETE /customers/:id/discounts/:discountId` — gleiches Problem
   - Frontend-Services: `apps/sim-system/src/app/services/customer.service.ts`
   - Backend-Controller: `apps/server/src/models/customer/customer.controller.ts`
   - Fix: Entweder die Endpunkte implementieren oder Frontend-Aufrufe entfernen

2. **Auth-Flows entfernen oder komplett implementieren**
   - Aktuell: Frontend hat `AuthenticationService` mit Login/Logout, aber:
     - Backend hat keine `POST /users/login` oder `GET /users/me/refresh` Endpunkte
     - Guards sind implementiert, aber Route `/login` existiert nicht
   - Option A: Auth vollständig aus Frontend entfernen (einfach, für interne Tools OK)
   - Option B: Backend Login + JWT Guard implementieren (für Produktion nötig)
   - Relevante Dateien:
     - Frontend: `apps/sim-system/src/app/services/authentication.service.ts`
     - Backend: `apps/server/src/models/users/`
     - Guards: `apps/sim-system/src/app/helpers/auth.guard.ts`

3. **Frontend-Tests ausbauen**
   - `apps/sim-system-e2e/` existiert, ist aber noch praktisch leer
   - Backend-E2E-Tests in `apps/server-e2e/` sind vorhanden und teilweise veraltet (erwarten `{ message: 'Hello API' }`, bekommen aber `"V1"`)

4. **Migrationsworkflow dokumentieren**
   - TypeORM Migrationen sind konfiguriert, aber NPM-Scripts im Root sind nicht hinterlegt
   - `apps/server/src/datasource.ts` ist vorhanden für Migrations-CLI
   - Should use: `npx typeorm migration:generate` etc. oder entsprechende npm-Scripts hinzufügen

### P1 — Wichtige Verbesserungen

5. **Race Condition: Nummernvergabe verbessern**
   - Dateien: `apps/server/src/models/bills/bill.service.ts`
   - Dateien: `apps/server/src/models/bills/slipsheet.service.ts`
   - Aktuell: Retry-Logik bei Unique-Constraint-Fehlern vorhanden
   - TODO: echter Lock/serialisierter Number-Allocator für echte Transaktionalität

6. **Frontend/Backend State-Filter Konsistenz**
   - Frontend sendet State-Filter für Bills/Slipsheets, Backend unterstützt das schon
   - Prüfen: Sind die Filter-Werte (`offen`, `geschlossen`, `bearbeitet`) überall konsistent?

### P2 — Sauberkeit & Betrieb

7. **Docker-Setup mit neuer Struktur testen**
   - `docker-compose.dev.yml` + `dockerfiles/` vorhanden
   - Noch nicht mit `apps/sim-system` statt `apps/sims` getestet

8. **Root-Endpoint dokumentieren**
   - `GET /` gibt aktuell `"V1"` zurück (nicht `{ message: 'Hello API' }`)
   - Backend-E2E-Tests erwarten das alte Format — müssen aktualisiert werden

---

## NX-Befehle Referenz

```bash
# Builds
npx nx build server
npx nx build sim-system
npx nx build sim-system --configuration=development

# Dev-Server
npx nx serve server              # Backend :9000
npx nx serve sim-system          # Frontend :4200

# Migrations (TypeORM) — nutze TypeORM CLI direkt
npx typeorm migration:generate -d apps/server/src/datasource.ts -n MigrationName
npx typeorm migration:run -d apps/server/src/datasource.ts
npx typeorm migration:revert -d apps/server/src/datasource.ts

# Tests
npx nx test server
npx nx test sim-system
```

---

## Wichtige Dateipfade

```
apps/server/src/main.ts                           → NestJS Bootstrap + Config
apps/server/src/models/                           → Entities, Services, Controllers
apps/server/src/models/*/entities/                → TypeORM Entities
apps/server/src/common/services/pdfmaker.service.ts  → PDF-Generierung
apps/server/src/datasource.ts                     → TypeORM DataSource (für Migrations)
apps/server/.env                                  → Umgebungsvariablen (gitignored)
apps/server/.env.example                          → Vorlage

apps/sim-system/src/main.ts                       → Angular Bootstrap
apps/sim-system/src/app/app.config.ts             → App-Konfiguration (Provider)
apps/sim-system/src/app/app.routes.ts             → Root-Routing
apps/sim-system/src/app/containers/default-layout/  → Haupt-Layout (Sidebar+Topbar)
apps/sim-system/src/app/services/                 → Angular Services
apps/sim-system/src/app/models/                   → TypeScript Daten-Modelle
apps/sim-system/src/styles.scss                   → Globales Stylesheet (abler.tirol Design)
apps/sim-system/src/environments/                 → environment.apiUrl Konfiguration
```

---

---

Erstellt: 2026-03-15 · Aktualisiert: 2026-05-01 · Branch: first-init
