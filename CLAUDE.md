# SIMS — Übergabe-Kontext für Claude Code

## Projekt-Überblick

**Repository:** `github.com/simonabler/sim-system` · Branch: `first-init`  
**Typ:** NX Monorepo — Fullstack Inventory Management System  
**Teil des:** `abler.tirol` Ökosystems (siehe Design-Prinzipien unten)

---

## Monorepo-Struktur

```
sim-system/
├── apps/
│   ├── server/          → NestJS 11 Backend (REST API)
│   └── sims/            → Angular 20 Frontend (Standalone Components)
├── libs/
│   └── domain/          → Shared Domain Library
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

### Bekannte offene Bugs (aus `kontext.md` — noch nicht behoben)
- `GET /slipsheets/:id` gibt durch falsches Array-Indexing `undefined` zurück
- `GET /bills/:id/pdf` hat Side-Effects (erzeugt Rechnung neu bei jedem Aufruf)
- `generateBill()` löscht im Fehlerfall bestehende Rechnungen
- Nummernvergabe für Rechnungen/Lieferscheine ohne DB-Lock (Race Condition)
- `inventoryDate` ist `CreateDateColumn` statt normalem Column

---

## Frontend (`apps/sims`)

### Tech Stack
- Angular 20, Standalone Components, `provideRouter`, `bootstrapApplication`
- `@ng-select/ng-select` für Dropdowns
- `ngx-toastr` für Notifications
- Design: `abler.tirol` Design-System (Steel-Blue für SIMS)

### Starten
```bash
npx nx serve sims    # :4200, Proxy → :9000
```

### Proxy
`apps/sims/proxy.conf.json` leitet `/api/*` auf `http://localhost:9000` weiter.

### Routing-Struktur
```
/                    → /dashboard
/dashboard           → DashboardComponent
/dashboard/inventory → InventoryListComponent
/article             → ArticleComponent
/mobile/tracking     → MobileTrackingComponent
/mobile/inventory    → MobileInventoryComponent
/admin/customer      → CustomerComponent
/admin/customer/new  → CustomerEditComponent
/admin/customer/detail/:id → CustomerDetailComponent
/admin/customer/edit/:id   → CustomerEditComponent
/admin/bills         → BillsComponent
/login               → LoginComponent
```

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

Alle CSS-Variablen sind in `apps/sims/src/styles.scss` definiert.

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
3. **Frontend von Angular 9 → Angular 20 migriert:**
   - Alle NgModules gelöscht → Standalone Components
   - `bootstrapApplication` + `app.config.ts`
   - `provideRouter` / `provideHttpClient` / `provideAnimations` / `provideToastr`
   - Functional Interceptors + Functional Guards
   - `@coreui/angular` + `ngx-bootstrap` + `ngx-perfect-scrollbar` + `angular-datatables` + `ng2-charts` entfernt
   - Eigenes Layout (Sidebar + Topbar) ohne CoreUI
   - Alle Templates: `bsModal` → native HTML-Dialog, `datatable` → `*ngFor`
   - Feature-Routes: `article.routes.ts`, `mobile.routes.ts`, `admin.routes.ts`, `dashboard.routes.ts`
   - `styles.scss` komplett neu — volles `abler.tirol` Design-System

---

## Was als nächstes zu tun ist 🔄

### P0 — Für erste lauffähige Version nötig

1. **`npm install` ohne `--ignore-scripts`** auf Zielmaschine ausführen (sqlite3 native binary)

2. **Bug: `GET /slipsheets/:id` gibt `undefined`** zurück
   - Datei: `apps/server/src/app/models/bills/controllers/slipsheet.controller.ts` ~Zeile 102
   - Problem: falsches Array-Indexing
   - Fix: Return-Wert prüfen, korrektes Element zurückgeben

3. **Bug: `GET /bills/:id/pdf` hat Side-Effects**
   - Datei: `apps/server/src/app/models/bills/controllers/bill.controller.ts` ~Zeile 82
   - Problem: Rechnung wird bei jedem GET neu generiert
   - Fix: PDF nur lesen wenn bereits vorhanden, separate POST-Route für Neugenerierung

4. **Auth komplett aktivieren oder entfernen**
   - Aktuell: Guards sind auskommentiert, API ist offen
   - Option A: JWT Guard global einbauen (empfohlen für Produktion)
   - Option B: Auth-Flows aus Frontend entfernen wenn nicht benötigt
   - Relevante Dateien: `apps/server/src/app/models/users/`, `apps/sims/src/app/helpers/auth.guard.ts`

5. **Login-Page implementieren**
   - Aktuell: Stub-Component, leitet nur weiter
   - `apps/sims/src/app/views/login/login.component.ts`

### P1 — Wichtige Verbesserungen

6. **Race Condition: Nummernvergabe transaktional machen**
   - Dateien: `apps/server/src/app/models/bills/bill.service.ts` ~Zeile 114
   - Dateien: `apps/server/src/app/models/bills/slipsheet.service.ts` ~Zeile 43
   - Fix: DB-Transaktion + Lock beim `SELECT MAX(number) + 1`

7. **`inventoryDate` korrigieren**
   - Datei: `apps/server/src/app/models/article/entities/article.entity.ts` ~Zeile 38
   - Problem: `@CreateDateColumn()` statt normales `@Column({ type: 'datetime' })`
   - Fix: Column-Typ ändern, Migration erstellen

8. **Inventurbuchung awaiten**
   - Datei: `apps/server/src/app/models/article/article.service.ts` ~Zeile 227
   - Problem: `await` fehlt, Fehler gehen verloren

9. **CustomerDetail: Rechnung aus ausgewählten Lieferscheinen erstellen**
   - `apps/sims/src/app/views/admin/customer-detail/customer-detail.component.ts`
   - Die Checkbox-Selektion (`selectedSlipIds`) ist implementiert
   - `makeBill(selectedSlipIds)` ruft `billService.generate(ids)` auf
   - Fehlt noch: visuelles Feedback nach Erstellung, Liste aktualisieren

10. **Mobile HTML-Templates prüfen**
    - `apps/sims/src/app/views/mobile/mobile-tracking/mobile-tracking.component.html`
    - `apps/sims/src/app/views/mobile/inventory/inventory.component.html`
    - Wurden nicht aus dem alten Code übernommen — müssen neu erstellt werden

11. **Article-Edit HTML: ng-select Binding überprüfen**
    - `apps/sims/src/app/views/article/article-edit/article-edit.component.html`
    - `formControlName="articleGroup"` mit `ng-select` — könnte Typ-Mismatch haben

### P2 — Sauberkeit & Betrieb

12. **Frontend/Backend API-Contract Matrix vervollständigen**
    - `DELETE /articles/:id` im Backend fehlt (Frontend ruft es auf)
    - `POST /bills/:id` → Backend hat das als recreate implementiert
    - `state`-Filter von Frontend wird im Backend ignoriert

13. **CORS härten**
    - Aktuell: `cors: true` (alles erlaubt)
    - Fix: erlaubte Origins per ENV-Variable

14. **Docker-Setup verifizieren**
    - `docker-compose.dev.yml` + `dockerfiles/` vorhanden
    - Noch nicht mit neuer Monorepo-Struktur getestet

15. **Migrations-Workflow einrichten**
    - `apps/server/src/datasource.ts` vorhanden
    - `npm run migration:generate --name=InitialSchema`
    - `npm run migration:run`

16. **SIMS Farbpalette finalisieren**
    - Laut Design-Dokument ist `sims` noch "muss noch definiert werden"
    - Aktuell: Steel-Blue (`#1e3a5f` / `#3b82f6`) — bei Bedarf anpassen

---

## NX-Befehle Referenz

```bash
# Builds
npx nx build server
npx nx build sims
npx nx build sims --configuration=development

# Dev-Server
npx nx serve server          # Backend :9000
npx nx serve sims            # Frontend :4200

# Migrations (TypeORM)
npm run migration:generate --name=MigrationName
npm run migration:run
npm run migration:revert
npm run migration:show

# Tests
npx nx test server
npx nx test sims
```

---

## Wichtige Dateipfade

```
apps/server/src/main.ts                           → NestJS Bootstrap
apps/server/src/app/app.module.ts                 → Root Module
apps/server/src/app/models/                       → Entities, Services, Controllers
apps/server/src/app/common/services/pdfmaker.service.ts  → PDF-Generierung
apps/server/src/datasource.ts                     → TypeORM DataSource (für Migrations)
apps/server/.env                                  → Umgebungsvariablen (gitignored)
apps/server/.env.example                          → Vorlage

apps/sims/src/main.ts                             → Angular Bootstrap
apps/sims/src/app/app.config.ts                   → App-Konfiguration (Provider)
apps/sims/src/app/app.routes.ts                   → Root-Routing
apps/sims/src/app/containers/default-layout/      → Haupt-Layout (Sidebar+Topbar)
apps/sims/src/app/services/                       → Angular Services
apps/sims/src/app/models/                         → TypeScript Daten-Modelle
apps/sims/src/styles.scss                         → Globales Stylesheet (Design-System)
apps/sims/proxy.conf.json                         → Dev-Proxy → :9000
apps/sims/src/environments/                       → API-URL Konfiguration
```

---

*Erstellt: 2026-03-15 · Branch: first-init · Letzter Commit: c656aa6*
