# Kontext zum Repo

Stand: 2026-03-19
Basis: statische Codeanalyse des aktuellen Worktrees, danach Abgleich mit `CLAUDE.md`
Hinweis: keine Tests oder Dev-Server ausgefuehrt

## Eigene Analyse des aktuellen Repos

### 1. Repo, Stack, Struktur

- NX-Monorepo mit zwei relevanten Apps:
  - `apps/server`: NestJS 11 Backend
  - `apps/sim-system`: Angular 21 Frontend
- Zusaetzlich vorhanden:
  - `apps/server-e2e`: Jest-E2E fuer Backend
  - `apps/sim-system-e2e`: Playwright-Projekt, aktuell praktisch leer
  - `libs/domain`: aktuell nur Platzhalter, fachlich derzeit kaum relevant
- Root enthaelt reale SQLite-Dateien `sim.db` und `sim_old.db` sowie bereits gebaute Artefakte unter `dist/`
- `package.json` hat keine nutzbaren Root-Skripte; Doku zu Migrationen in README/CLAUDE ist damit derzeit nicht direkt ueber `npm run ...` abbildbar

### 2. Backend-Ist-Zustand

- Bootstrap in `apps/server/src/main.ts`
  - globaler Prefix: `/api/v1`
  - globaler `ErrorFilter`
  - globale `ValidationPipe` mit `whitelist: true` und `transform: true`
  - CORS ist bereits explizit konfiguriert, nicht mehr `cors: true`
- Swagger ist aktiv unter `/api/v1/doc` und `/api/v1/doc/univ`
- Datenbank:
  - TypeORM 0.3 mit `better-sqlite3`
  - Standardpfad faellt auf `sim.db` zurueck
  - Entity-Glob kommt aus Config, Default `dist/**/*.entity.js`

### 3. Backend-Domaene und API

- Fachliche Hauptbereiche:
  - `article`: Artikel, Artikelgruppen, Inventur, CSV-Import
  - `customer`: Kunden und Rabatte
  - `bills`: Lieferscheine, Order-Entries, Rechnungen, Annotationen, Dashboard
  - `users`: nur einfache User-Verwaltung, kein kompletter Auth-Flow
- Antwortformat ist systematisch auf `ReS` / `ReE` aufgebaut
- Aktuell vorhandene Controller:
  - `articles`
  - `articlegroups`
  - `customers`
  - `slipsheets`
  - `bills`
  - `order-entries`
  - `dashboard`
  - `users`

### 4. Wichtige fachliche Beobachtungen im Backend

- `GET /slipsheets/:id` ist bereits repariert:
  - der Controller castet `id` auf Zahl und wirft `404`, wenn kein Datensatz gefunden wurde
- `GET /bills/:id/pdf` ist bereits read-only:
  - PDF wird nicht mehr bei jedem GET neu erzeugt
  - fehlt die Datei, kommt `404` mit Hinweis auf Neugenerierung per POST
- `generateBill()` rollt im Fehlerfall nur neu erzeugte Rechnungen zurueck:
  - der fruehere "loescht bestehende Rechnung"-Fehler ist im aktuellen Code nicht mehr sichtbar
- Nummernvergabe fuer Lieferscheine und Rechnungen ist verbessert, aber nicht wirklich transaktional:
  - es gibt Retry-Logik bei Unique-Constraint-Fehlern
  - ein echter Lock/serialisierter Number-Allocator existiert weiter nicht
- `inventoryDate` ist bereits korrigiert:
  - jetzt normales `@Column({ type: 'datetime', nullable: true })`
  - nicht mehr `@CreateDateColumn()`
- Inventur:
  - `makeInventory()` validiert `newStock >= 0`
  - Artikel ohne `trackStock` werden abgelehnt
  - Inventory-Log-Fehler werden absichtlich geschluckt, der Artikelbestand wird trotzdem aktualisiert
- Root-Endpoint `/` gibt aktuell `"V1"` zurueck, nicht `{ message: 'Hello API' }`

### 5. Frontend-Ist-Zustand

- Angular 21 mit Standalone Components
- `provideRouter(...)` und `provideHttpClient(withInterceptors([apiInterceptor]))`
- Kein Proxy im aktuellen Setup erkennbar; das Frontend arbeitet ueber `environment.apiUrl`
- Dev-API-URL: `http://localhost:3000/api/v1`
- Prod-API-URL: leerer String, also faktisch Same-Origin-Annahme
- Layout ist bereits modernisiert:
  - Sidebar
  - Topbar
  - Bottom Navigation fuer mobile Nutzung

### 6. Aktuelle Frontend-Routen

- Vorhanden:
  - `/dashboard`
  - `/articles`
  - `/articles/:id`
  - `/customers`
  - `/customers/new`
  - `/customers/:id`
  - `/customers/:id/edit`
  - `/slipsheets`
  - `/slipsheets/:id`
  - `/bills`
  - `/bills/:id`
  - `/inventory`
  - `/order/new`
- Nicht vorhanden:
  - `/login`
- Es gibt zwar eine `login.component.ts`, aber keine Route dorthin

### 7. Konkrete API-Contract-Brueche zwischen Frontend und Backend

- `AuthenticationService` erwartet:
  - `POST users/login`
  - `GET users/me/refresh`
- Diese Endpunkte existieren im aktuellen Backend nicht
- `authGuard` leitet auf `/login` um, aber die Route existiert nicht
- `CustomerService` im Frontend verwendet:
  - `DELETE customers/:id`
  - `DELETE customers/:id/discounts/:discountId`
- Beide Endpunkte existieren im aktuellen `CustomerController` nicht
- Die Doku spricht von `PUT /slipsheets/:id`, im aktuellen Backend existiert diese Route nicht
- README/CLAUDE nennen Auth/JWT als Thema; real ist die API derzeit funktional offen, obwohl Swagger-Dekoratoren `@ApiBearerAuth()` gesetzt sind

### 8. Tests und Wartungszustand

- Es gibt Backend-E2E-Spezifikationen fuer Basisanforderungen wie Prefix, Error-Filter, Validation und Response-Wrapper
- Mindestens ein Test wirkt veraltet:
  - `apps/server-e2e/src/server/server.spec.ts` erwartet am Root `{ message: 'Hello API' }`
  - der aktuelle Code liefert `"V1"`
- `apps/sim-system-e2e` ist noch nicht sinnvoll ausgebaut
- README ist nur bedingt als Wahrheit nutzbar; mehrere Aussagen sind klar aelter als der aktuelle Code

## Abgleich mit CLAUDE.md

### Uebereinstimmungen

- Monorepo mit NestJS-Backend und Angular-Frontend
- zentrale Fachmodule `articles`, `customers`, `slipsheets`, `bills`, `dashboard`
- globaler API-Prefix `/api/v1`
- Swagger vorhanden
- Antwort-Wrapper und DTO/Validation-Ansatz passen grundsaetzlich zum Code
- Auth ist nicht sauber fertiggestellt

### Abweichungen oder veraltete Angaben in CLAUDE.md

- Frontend-Pfad falsch:
  - `CLAUDE.md` spricht von `apps/sims`
  - real ist es `apps/sim-system`
- Angular-Version falsch:
  - `CLAUDE.md`: Angular 20
  - real: Angular 21
- Frontend-Routing in `CLAUDE.md` ist weitgehend historisch:
  - die heute vorhandenen Routen liegen direkt unter `/dashboard`, `/articles`, `/customers`, `/slipsheets`, `/bills`, `/inventory`, `/order/new`
  - die beschriebenen alten Admin-/Mobile-Routen existieren so nicht
- Proxy-Angabe ist veraltet:
  - ein `apps/sims/proxy.conf.json` existiert in diesem Repo nicht
  - stattdessen arbeitet das Frontend mit `environment.apiUrl`
- Mehrere in `CLAUDE.md` als offen gelistete Bugs sind bereits behoben:
  - `GET /slipsheets/:id` Bug
  - `GET /bills/:id/pdf` Side-Effect Bug
  - `inventoryDate` Bug
  - CORS "alles offen" Bug
- Die Aussage "DELETE /articles/:id fehlt im Backend" ist im aktuellen Code falsch:
  - die Route existiert
- Die Aussage "state-Filter von Frontend wird im Backend ignoriert" ist im aktuellen Code fuer `bills` und `slipsheets` falsch:
  - beide Controller unterstuetzen State-Filter
- Die in `CLAUDE.md` genannten Root-Skripte fuer Migrationen sind im aktuellen `package.json` nicht hinterlegt
- Mehrere Dateipfade in `CLAUDE.md` zeigen noch auf alte Strukturen wie `apps/server/src/app/...` oder `apps/sims/...`; das aktuelle Repo nutzt diese Struktur so nicht

### Punkte, die CLAUDE.md korrekt ahnt, aber unpraezise beschreibt

- Auth ist tatsaechlich unfertig, aber das Problem ist tiefer als "Login-Stub":
  - im Frontend fehlen Route und lauffaehiger Flow
  - im Backend fehlen die erwarteten Login-/Refresh-Endpunkte komplett
- Race-Condition bei Nummernvergabe ist weiterhin ein valider Hinweis
  - allerdings mit Retry-Absicherung, nicht mehr ganz im alten Zustand
- Frontend/Backend-Contract-Matrix ist weiterhin ein sinnvolles Thema
  - besonders bei Auth sowie Customer-Delete / Discount-Delete

## Arbeitskontext fuer weitere Aenderungen

- Primaere Wahrheit ist aktuell der Code, nicht README oder `CLAUDE.md`
- Bei Folgearbeiten zuerst Contract-Brueche zwischen Angular-Services und NestJS-Controllern pruefen
- Besonders riskant:
  - Auth-Flows
  - Customer-Loeschung / Discount-Loeschung
  - veraltete Tests und Doku
- Wenn neue Arbeit an Bills/Slipsheets ansteht:
  - aktuelle Buglisten aus `CLAUDE.md` nicht ungeprueft uebernehmen
  - mehrere dort genannte Punkte sind bereits erledigt
