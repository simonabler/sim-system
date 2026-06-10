# SIMS Backend — Test-Anforderungskatalog

**Erstellt:** 2026-03-17
**Branch:** first-init
**Scope:** `apps/server/` (NestJS 11 REST API)
**Methode:** test-agent · Full Pipeline A–K · MODE=DEFAULT
**Framework:** Framework-agnostisch (Given/When/Then + Pseudocode), da kein Testframework vorgegeben — `UNBELEGT`

---

## A) INPUT INVENTORY

| # | Quelle | Typ | Relevanz |
|---|--------|-----|----------|
| 1 | `apps/server/src/main.ts` | Bootstrap / Konfiguration | Hoch |
| 2 | `apps/server/src/app/app.module.ts` | Root Module | Hoch |
| 3 | `apps/server/src/models/article/controllers/article.controller.ts` | Controller | Hoch |
| 4 | `apps/server/src/models/article/controllers/article-group.controller.ts` | Controller | Mittel |
| 5 | `apps/server/src/models/article/article.service.ts` | Service | Hoch |
| 6 | `apps/server/src/models/article/article-group.service.ts` | Service | Mittel |
| 7 | `apps/server/src/models/article/inventory.service.ts` | Service | Mittel |
| 8 | `apps/server/src/models/article/entities/article.entity.ts` | Entity | Hoch |
| 9 | `apps/server/src/models/article/entities/inventory.entity.ts` | Entity | Mittel |
| 10 | `apps/server/src/models/article/dto/*.dto.ts` | DTOs | Hoch |
| 11 | `apps/server/src/models/customer/controllers/customer.controller.ts` | Controller | Hoch |
| 12 | `apps/server/src/models/customer/customer.service.ts` | Service | Mittel |
| 13 | `apps/server/src/models/customer/entities/customer.entity.ts` | Entity | Hoch |
| 14 | `apps/server/src/models/customer/dto/*.dto.ts` | DTOs | Hoch |
| 15 | `apps/server/src/models/bills/controllers/bill.controller.ts` | Controller | Hoch |
| 16 | `apps/server/src/models/bills/controllers/slipsheet.controller.ts` | Controller | Hoch |
| 17 | `apps/server/src/models/bills/controllers/order-entry.controller.ts` | Controller | Mittel |
| 18 | `apps/server/src/models/bills/controllers/dashboard.controller.ts` | Controller | Mittel |
| 19 | `apps/server/src/models/bills/bill.service.ts` | Service | Hoch |
| 20 | `apps/server/src/models/bills/slipsheet.service.ts` | Service | Hoch |
| 21 | `apps/server/src/models/bills/order-entry.service.ts` | Service | Hoch |
| 22 | `apps/server/src/models/bills/discount.service.ts` | Service | Mittel |
| 23 | `apps/server/src/models/bills/annotation.service.ts` | Service | Niedrig |
| 24 | `apps/server/src/models/bills/dashboard.service.ts` | Service | Mittel |
| 25 | `apps/server/src/models/bills/entities/*.entity.ts` | Entities | Hoch |
| 26 | `apps/server/src/models/bills/dto/*.dto.ts` | DTOs | Hoch |
| 27 | `apps/server/src/models/users/users.controller.ts` | Controller | Niedrig |
| 28 | `apps/server/src/models/users/users.service.ts` | Service | Niedrig |
| 29 | `apps/server/src/models/users/entities/user.entity.ts` | Entity | Niedrig |
| 30 | `apps/server/src/common/base.service.ts` | Shared | Hoch |
| 31 | `apps/server/src/common/res.model.ts` | Shared | Hoch |
| 32 | `apps/server/src/common/filters/errors.filter.ts` | Shared | Mittel |
| 33 | `apps/server/src/common/services/pdfmaker.service.ts` | Shared | Mittel |
| 34 | `CLAUDE.md` (Handoff-Dokument) | Spezifikation / Bugs | Hoch |

**Fehlende Artefakte:**
- Kein OpenAPI/Swagger-Export (YAML/JSON) vorhanden — Swagger wird nur zur Laufzeit generiert
- Keine bestehenden Testdateien (`*.spec.ts`) gefunden
- Keine Acceptance Criteria / User Stories / Tickets vorhanden
- Kein Testframework explizit vorgegeben → Tests bleiben framework-agnostisch

---

## B) REQUIREMENTS KATALOG

### Globale Anforderungen

---

**REQ-001**
**Titel:** Globaler API-Prefix
**Beschreibung:** Alle Endpunkte sind unter dem Prefix `/api/v1` erreichbar.
**Quelle:** `apps/server/src/main.ts` — `app.setGlobalPrefix('api/v1')`
**Evidenz:** `setGlobalPrefix` im Bootstrap
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-002**
**Titel:** Response-Wrapper ReS / ReE
**Beschreibung:** Erfolgreiche Antworten haben `{ success: true, data: T }`. Fehleantworten haben `{ success: false, statusCode, error, message[] }`.
**Quelle:** `apps/server/src/common/res.model.ts`
**Evidenz:** `ReS.FromData()` und `ReE.FromData()` Klassenmethoden
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-003**
**Titel:** Global ValidationPipe (whitelist, transform)
**Beschreibung:** Nicht im DTO deklarierte Felder werden verworfen (whitelist). Typen werden transformiert (transform).
**Quelle:** `apps/server/src/main.ts` — `new ValidationPipe({ whitelist: true, transform: true })`
**Evidenz:** ValidationPipe-Konfiguration im Bootstrap
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-004**
**Titel:** Global ErrorFilter
**Beschreibung:** Alle nicht behandelten Exceptions werden durch ErrorFilter abgefangen und im ReE-Format zurückgegeben.
**Quelle:** `apps/server/src/main.ts`, `apps/server/src/common/filters/errors.filter.ts`
**Evidenz:** `app.useGlobalFilters(new ErrorFilter())`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-005**
**Titel:** CORS — Herkunftsbeschränkung
**Beschreibung:** CORS erlaubt Anfragen von `CORS_ORIGIN` (ENV) oder Default `http://localhost:4200`.
**Quelle:** `apps/server/src/main.ts`
**Evidenz:** `cors: { origin: corsOrigin }` im Bootstrap
**Priorität:** Med (UNBELEGT ob ENV wirklich gesetzt wird)
**Status:** INFERIERT

---

### Articles

---

**REQ-010**
**Titel:** Artikel auflisten
**Beschreibung:** `GET /api/v1/articles` gibt alle Artikel mit berechnetem `stock` zurück. Optionale Query-Parameter `?code=X` (Barcode-Suche) und `?id=Y` (ID-Suche) filtern das Ergebnis.
**Quelle:** `article.controller.ts` — `findAll()`; `article.service.ts` — `getAll()`, `getByCode()`, `get()`
**Evidenz:** Controller-Handler mit `@Query('code')` und `@Query('id')`; `getAll()` enthält Subquery für Lagerbestand
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-011**
**Titel:** Artikel-Stock-Berechnung
**Beschreibung:** `stock = inventoryStock - totalAmount`. `totalAmount` ist die Summe aller zugehörigen OrderEntries. Der Wert wird per Subquery berechnet und nicht gespeichert.
**Quelle:** `article.service.ts` — `get()` QueryBuilder
**Evidenz:** `(SELECT SUM(...) FROM order_entry WHERE article_id = :id) AS totalAmount`
**Priorität:** High
**Status:** INFERIERT (Derived-from-code)

---

**REQ-012**
**Titel:** Artikel anlegen
**Beschreibung:** `POST /api/v1/articles` mit Body `CreateArticleDto` legt einen neuen Artikel an und gibt ihn zurück. Felder `name`, `code`, `price`, `type`, `unit`, `artNumber`, `articleGroup.id` sind Pflicht.
**Quelle:** `article.controller.ts` — `create()`; `dto/create-article.dto.ts`
**Evidenz:** DTO-Felder ohne Optional-Decorator
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-013**
**Titel:** Artikel updaten
**Beschreibung:** `PATCH /api/v1/articles/:id` mit Body `UpdateArticleDto` aktualisiert einen Artikel. Nicht-existente IDs geben 404 zurück.
**Quelle:** `article.controller.ts` — `update()`; `base.service.ts` — `get()` mit `throwsException`
**Evidenz:** `throwsException: true` im Service-Aufruf
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-014**
**Titel:** Artikel löschen
**Beschreibung:** `DELETE /api/v1/articles/:id` löscht einen Artikel. Nicht-existente IDs geben 404 zurück. Erfolgreich gibt `null` zurück.
**Quelle:** `article.controller.ts` — `remove()`
**Evidenz:** `throwsException: true`, `ReS.FromData(null)`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-015**
**Titel:** Inventurbuchung
**Beschreibung:** `POST /api/v1/articles/:id/inventory` mit `{ newStock: number }` setzt den Lagerbestand (`inventoryStock`) auf den neuen Wert, erstellt einen Inventory-Eintrag mit `diff = newStock - oldStock` und gibt den aktualisierten Artikel zurück.
**Quelle:** `article.service.ts` — `makeInventory()`
**Evidenz:** `diff = newStock - article.inventoryStock`; `create({ amountNew: newStock, diff, article })`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-016**
**Titel:** Inventurbuchung — Fehlertoleranz
**Beschreibung:** Wenn das Erstellen des Inventory-Eintrags fehlschlägt, soll die Aktualisierung des Artikels trotzdem erfolgreich sein (kein Rollback des Artikel-Updates).
**Quelle:** `article.service.ts` — `makeInventory()` try/catch
**Evidenz:** `try { await inventoryService.create(...) } catch { /* silent */ }`
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-017**
**Titel:** CSV-Import — Preview
**Beschreibung:** `POST /api/v1/articles/import?preview=true` mit Multipart-Datei gibt eine Vorschau (parsed Artikel-Liste) zurück ohne zu speichern.
**Quelle:** `article.controller.ts`, `article.service.ts` — `importCsv(true, file)`
**Evidenz:** `if (preview) return ReS.FromData(articles)`
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-018**
**Titel:** CSV-Import — Ausführung
**Beschreibung:** `POST /api/v1/articles/import` (kein `?preview`) führt den Import aus und gibt `[successCount, failedCount]` zurück.
**Quelle:** `article.service.ts` — `importCsv(false, file)`
**Evidenz:** `createArticlesFromImport()` und `updateArticlesFromImport()` werden aufgerufen
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-019**
**Titel:** CSV-Import — Preisberechnung
**Beschreibung:** `price = Math.ceil((brutto / pe) * 100) / 100`
**Quelle:** `article.service.ts` — `importCsv()`
**Evidenz:** Explizite Berechnungsformel im Service
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-020**
**Titel:** Artikelgruppen CRUD
**Beschreibung:** `GET/POST/PATCH /api/v1/articlegroups` und `GET /api/v1/articlegroups/:id` für Artikelgruppen-Verwaltung. Pflichtfeld: `name`.
**Quelle:** `article-group.controller.ts`
**Evidenz:** Controller-Handler und DTO
**Priorität:** Low
**Status:** CONFIRMED

---

### Customers

---

**REQ-030**
**Titel:** Kunden auflisten
**Beschreibung:** `GET /api/v1/customers` gibt alle Kunden zurück.
**Quelle:** `customer.controller.ts` — `findAll()`
**Evidenz:** Controller-Handler
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-031**
**Titel:** Kunde mit Rabatten abrufen
**Beschreibung:** `GET /api/v1/customers/:id` gibt den Kunden inkl. seiner Rabatte zurück (Relation `discounts`). Nicht-existente IDs geben 404.
**Quelle:** `customer.controller.ts` — `findOne()`; `customerService.get(id, ['discounts'], true)`
**Evidenz:** `relations: ['discounts']` im Service-Aufruf
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-032**
**Titel:** Kunde anlegen
**Beschreibung:** `POST /api/v1/customers` mit `CreateCustomerDto`. Pflichtfeld: `customerNumber` (eindeutig).
**Quelle:** `customer.controller.ts`, `entities/customer.entity.ts`
**Evidenz:** `@Column({ unique: true })` auf `customerNumber`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-033**
**Titel:** Duplikat-Kundennummer
**Beschreibung:** Wird eine bereits vergebene `customerNumber` verwendet, gibt der Endpunkt einen Fehler zurück (UNIQUE-Constraint-Verletzung).
**Quelle:** `entities/customer.entity.ts` — `@Column({ unique: true })`
**Evidenz:** Datenbankconstraint; Fehler via ErrorFilter
**Priorität:** High
**Status:** INFERIERT (Derived-from-code; genaue HTTP-Statuscode-Spezifikation UNKLAR)

---

**REQ-034**
**Titel:** Lieferscheine eines Kunden
**Beschreibung:** `GET /api/v1/customers/:id/slipsheets` gibt alle Lieferscheine des Kunden zurück.
**Quelle:** `customer.controller.ts` — `findSlipsheets()`
**Evidenz:** `slipsheetService.findFromCustomer(id)`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-035**
**Titel:** Rechnungen eines Kunden
**Beschreibung:** `GET /api/v1/customers/:id/bills` gibt alle Rechnungen des Kunden zurück.
**Quelle:** `customer.controller.ts` — `findBills()`
**Evidenz:** `billService.findFromCustomer(id)`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-036**
**Titel:** Rabatt anlegen / updaten
**Beschreibung:** `PUT /api/v1/customers/:id/discounts` mit `CreateUpdateDiscountDto` erstellt oder aktualisiert einen Rabatt für den Kunden. Wenn `id` im Body vorhanden → Update, sonst → Create.
**Quelle:** `customer.controller.ts` — `addDiscount()`; `discount.service.ts` — `createOrUpdate()`
**Evidenz:** `if (createUpdateDiscountDto.id)` → update-Pfad
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-037**
**Titel:** Rabatt-Artikelgruppe unveränderlich
**Beschreibung:** Beim Update eines Rabatts darf die `articleGroup` nicht geändert werden. Bei Versuch → Fehler (UNKLAR ob 400 oder 422).
**Quelle:** `discount.service.ts` — `createOrUpdate()` Validierung
**Evidenz:** `if (existing.articleGroupId !== articleGroup.id) throw ...`
**Priorität:** Med
**Status:** CONFIRMED (HTTP-Status UNKLAR)

---

### Slipsheets (Lieferscheine)

---

**REQ-040**
**Titel:** Lieferscheine auflisten
**Beschreibung:** `GET /api/v1/slipsheets` gibt alle Lieferscheine zurück. Optional filterbar nach `?customerId` (nur OPEN/CHANGED) und `?state`.
**Quelle:** `slipsheet.controller.ts` — `findAll()`
**Evidenz:** Auto-Filter bei customerId-Query: `state IN [OPEN, CHANGED]`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-041**
**Titel:** Lieferschein by ID
**Beschreibung:** `GET /api/v1/slipsheets/:id` gibt den Lieferschein mit allen Relationen zurück. Nicht-existente IDs geben 404.
**Quelle:** `slipsheet.controller.ts` — `findOne()`; Bug #1 gefixt (String → Number Cast)
**Evidenz:** `id: string` Parameter wird zu `+id` gecastet
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-042**
**Titel:** Order zu Lieferschein hinzufügen (neu)
**Beschreibung:** `POST /api/v1/slipsheets` mit `AddOrderEntryDto` fügt einen Order-Entry zu einem OPEN Lieferschein des Kunden hinzu. Existiert kein OPEN Lieferschein, wird ein neuer erstellt.
**Quelle:** `slipsheet.controller.ts` — `addOrder()` (ohne ID); `order-entry.service.ts`
**Evidenz:** `slipsheetService.findOpenForCustomer(customer)` erstellt bei Bedarf
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-043**
**Titel:** Order zu bestehendem Lieferschein hinzufügen
**Beschreibung:** `POST /api/v1/slipsheets/:id` mit `AddOrderEntryDto` fügt einen Entry zu einem bestehenden Lieferschein hinzu.
**Quelle:** `slipsheet.controller.ts` — `addOrderToExisting()`
**Evidenz:** `orderEntryService.addOrderToSlipsheet({ customer, slipsheet, addOrderEntry })`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-044**
**Titel:** Order-Entry — Artikel XOR Text
**Beschreibung:** Ein Order-Entry muss entweder einen `article` (mit ID) ODER einen `text` enthalten, aber nicht beides und nicht keins von beiden. Bei Verstoß → BadRequest (400).
**Quelle:** `order-entry.service.ts` — `addOrderToSlipsheet()` Validierung
**Evidenz:** `if (article && text) throw BadRequestException`; `if (!article && !text) throw BadRequestException`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-045**
**Titel:** Order-Entry — Mengenerhöhung
**Beschreibung:** Wird ein Artikel hinzugefügt, der im gleichen Lieferschein bereits vorhanden ist (und `article.singlePos = false`), wird die Menge des bestehenden Eintrags erhöht (kein neuer Eintrag).
**Quelle:** `order-entry.service.ts` — `addEntryByArticle()`
**Evidenz:** `if (article.singlePos || !existingEntry) create(); else increment()`
**Priorität:** High
**Status:** INFERIERT (Derived-from-code)

---

**REQ-046**
**Titel:** Order-Entry — singlePos erzeugt immer neuen Eintrag
**Beschreibung:** Bei `article.singlePos = true` wird immer ein neuer Eintrag erstellt, auch wenn der Artikel bereits im Lieferschein ist.
**Quelle:** `order-entry.service.ts` — `addEntryByArticle()`
**Evidenz:** `if (article.singlePos || !existingEntry) create new entry`
**Priorität:** Med
**Status:** INFERIERT (Derived-from-code)

---

**REQ-047**
**Titel:** Rabattberechnung bei Order-Entry
**Beschreibung:** Beim Hinzufügen eines Artikel-Eintrags werden `customerRabatt` (Kundenrabatt) und `articleGroupRabatt` (Artikelgruppen-Rabatt) berechnet und am Entry gespeichert.
**Quelle:** `order-entry.service.ts` — `addEntryByArticle()`
**Evidenz:** Discount-Lookup im Service, Speicherung in `orderEntry.customerRabatt` und `orderEntry.articleGroupRabatt`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-048**
**Titel:** Lieferschein schließen
**Beschreibung:** `POST /api/v1/slipsheets/:id/close` schließt den Lieferschein (state → CLOSED) und generiert das PDF. Lieferschein ohne Einträge kann nicht geschlossen werden.
**Quelle:** `slipsheet.controller.ts` — `close()`; `slipsheet.service.ts` — `generateSlipsheet(id, true)`
**Evidenz:** `if (!slipsheet.orderEntries?.length) throw ...`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-049**
**Titel:** Lieferschein-PDF abrufen
**Beschreibung:** `GET /api/v1/slipsheets/:id/pdf` gibt das PDF als StreamableFile zurück. Wenn das PDF noch nicht existiert, wird es generiert.
**Quelle:** `slipsheet.controller.ts` — `getPdf()`
**Evidenz:** `?close=true` Parameter in Query
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-050**
**Titel:** Lieferschein drucken
**Beschreibung:** `POST /api/v1/slipsheets/:id/print` druckt das PDF und gibt `true`/`false` zurück.
**Quelle:** `slipsheet.controller.ts` — `print()`
**Evidenz:** `printerService.print(path)`
**Priorität:** Low
**Status:** CONFIRMED

---

**REQ-051**
**Titel:** Lieferschein-Annotation hinzufügen
**Beschreibung:** `POST /api/v1/slipsheets/:id/annotation` mit `{ text: string }` erstellt eine Notiz am Lieferschein.
**Quelle:** `slipsheet.controller.ts` — `addAnnotation()`
**Evidenz:** `annotationService.create({ text, slipsheet })`
**Priorität:** Low
**Status:** CONFIRMED

---

**REQ-052**
**Titel:** Lieferschein-Nummer Generierung
**Beschreibung:** Lieferscheinnummern werden als `MAX(slipsheetnumber) + 1` vergeben (nur ganzzahlige, nicht `/`-formatierte Nummern werden berücksichtigt).
**Quelle:** `slipsheet.service.ts` — `generateNumber()`
**Evidenz:** SQL: `SELECT MAX(slipsheetnumber) WHERE NOT LIKE '%/%'`
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-053**
**Titel:** Order-Entry updaten (Menge)
**Beschreibung:** `PUT /api/v1/order-entries/:id` aktualisiert einen Entry. Bei `amount = 0` wird der Entry gelöscht und der Lieferschein als CHANGED markiert.
**Quelle:** `order-entry.service.ts` — `update()`
**Evidenz:** `if (inputs.amount === 0) delete; else update`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-054**
**Titel:** Lieferschein-State Änderung bei OrderEntry-Update
**Beschreibung:** Wenn einem Lieferschein, der nicht OPEN ist, ein Entry hinzugefügt oder geändert wird, wechselt der State auf CHANGED.
**Quelle:** `slipsheet.service.ts` — `changed()`; `order-entry.service.ts`
**Evidenz:** `if (slip.state !== OPEN) slip.state = CHANGED`
**Priorität:** Med
**Status:** CONFIRMED

---

### Bills (Rechnungen)

---

**REQ-060**
**Titel:** Rechnungen auflisten
**Beschreibung:** `GET /api/v1/bills` gibt alle Rechnungen zurück. Optional filterbar nach `?state`.
**Quelle:** `bill.controller.ts` — `findAll()`
**Evidenz:** Query-Parameter `?state`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-061**
**Titel:** Rechnung aus Lieferscheinen generieren
**Beschreibung:** `POST /api/v1/bills/generate` mit einem Array von Lieferschein-IDs erstellt eine Rechnung. Validierungen: alle Lieferscheine müssen CLOSED sein, alle müssen zum gleichen Kunden gehören, keiner darf eine abweichende Rechnung referenzieren.
**Quelle:** `bill.service.ts` — `generateBill()`
**Evidenz:** `if (slipsheet.state !== CLOSED) throw`; `if (customerId !== firstCustomer) throw`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-062**
**Titel:** Rechnung generieren — Nummernvergabe
**Beschreibung:** Die Rechnungsnummer wird als `MAX(billNumber) + 1` vergeben.
**Quelle:** `bill.service.ts` — `createBillWithRetry()`
**Evidenz:** `SELECT MAX(billNumber) + 1` SQL-Query
**Priorität:** High
**Status:** CONFIRMED (Race Condition Risiko vorhanden — siehe REQ-063)

---

**REQ-063**
**Titel:** Rechnungsnummer Eindeutigkeit (Race Condition — OFFEN)
**Beschreibung:** Die Rechnungsnummer MUSS eindeutig sein. Die aktuelle Implementierung hat keine DB-Sperre beim SELECT MAX(). Bei gleichzeitigen Anfragen kann dieselbe Nummer vergeben werden.
**Quelle:** `bill.service.ts` — `createBillWithRetry()`; `CLAUDE.md` (bekannte Bugs)
**Evidenz:** Kein BEGIN TRANSACTION / SELECT FOR UPDATE vor Nummernvergabe
**Priorität:** High
**Status:** UNKLAR (bekanntes offenes Problem, kein Fix in Code sichtbar)

---

**REQ-064**
**Titel:** Rechnung-PDF abrufen
**Beschreibung:** `GET /api/v1/bills/:id/pdf` gibt das vorhandene PDF zurück. Wenn kein PDF existiert, gibt es 404 zurück — KEINE Neugenerierung.
**Quelle:** `bill.controller.ts` — `getPdf()`; Bug #2 gefixt
**Evidenz:** `if (!fs.existsSync(path)) throw NotFoundException`
**Priorität:** High
**Status:** CONFIRMED

---

**REQ-065**
**Titel:** Rechnung-PDF neu generieren
**Beschreibung:** `POST /api/v1/bills/:id` generiert das PDF für eine bestehende Rechnung neu.
**Quelle:** `bill.controller.ts` — `recreate()`
**Evidenz:** `billService.regenerateBillPdf(id)`
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-066**
**Titel:** Rechnung updaten
**Beschreibung:** `PUT /api/v1/bills/:id` mit `{ billNumber: string, billDate: string (ISO) }` aktualisiert eine Rechnung.
**Quelle:** `bill.controller.ts` — `update()`; `dto/update-bill.dto.ts`
**Evidenz:** `@IsString()` billNumber, `@IsDateString()` billDate
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-067**
**Titel:** Bill-State bei Lieferschein-Änderung
**Beschreibung:** Wenn einer Rechnung zugeordnete Lieferscheine geändert werden (Order-Entry update), wechselt der Rechnungs-State auf CHANGED.
**Quelle:** `order-entry.service.ts` — `update()`
**Evidenz:** `if (entry.slipsheet.billId) billService.changed(bill)`
**Priorität:** Med
**Status:** INFERIERT (Derived-from-code)

---

### Dashboard

---

**REQ-070**
**Titel:** Dashboard Summary
**Beschreibung:** `GET /api/v1/dashboard/summary` gibt KPIs zurück: offene/geänderte Lieferscheine, offene Rechnungen, Niedrig-Bestand-Artikel, Top-Moving Articles, Stock-Trend, Inventur-Aktivitäten.
**Quelle:** `dashboard.controller.ts`, `dashboard.service.ts`
**Evidenz:** `getSummary()` Return-Objekt
**Priorität:** Med
**Status:** CONFIRMED

---

**REQ-071**
**Titel:** Dashboard Query-Parameter Validierung
**Beschreibung:** `days` muss `>= 1` und `<= 120` sein (wird durch Service normalisiert). `threshold` muss `>= 0` und `<= 100000`. `from`/`to` müssen ISO-Datumsstrings sein. Bei ungültigen Werten werden Default-Werte verwendet (days=30, threshold=10).
**Quelle:** `dashboard.service.ts` — `normalizeNumber()`; `dto/dashboard-summary-query.dto.ts`
**Evidenz:** `@Min(1)`, `@IsInt` Decorators; Service-seitige Normalisierung
**Priorität:** Med
**Status:** CONFIRMED

---

### Users

---

**REQ-080**
**Titel:** Benutzer CRUD
**Beschreibung:** `GET/PUT/DELETE /api/v1/users` und `GET /api/v1/users/:id` für Benutzerverwaltung.
**Quelle:** `users.controller.ts`
**Evidenz:** Controller-Handler
**Priorität:** Low
**Status:** CONFIRMED

---

**REQ-081**
**Titel:** Auth-Schutz (DEAKTIVIERT / OFFEN)
**Beschreibung:** Auth-Guards sind aktuell auskommentiert. Die API ist vollständig offen erreichbar ohne Token.
**Quelle:** `CLAUDE.md` (P0 — "Auth komplett aktivieren oder entfernen")
**Evidenz:** `@ApiBearerAuth` Decorator vorhanden, aber Guard nicht aktiv
**Priorität:** High
**Status:** UNKLAR (bewusste Entscheidung oder Fehler?)

---

## C) UNKLARHEITEN & OFFENE FRAGEN

| ID | Frage | Warum unklar | Was klärt es |
|----|-------|--------------|--------------|
| UQ-001 | Welcher HTTP-Status wird bei UNIQUE-Constraint-Verletzung (doppelte customerNumber / billNumber) zurückgegeben? | ErrorFilter fängt DB-Fehler ab, aber spezifischer Status nicht dokumentiert | Klärung ErrorFilter-Mapping oder Test gegen echte DB |
| UQ-002 | Soll Auth (JWT Guard) aktiviert werden oder dauerhaft deaktiviert bleiben? | CLAUDE.md listet es als P0 offen | Explizite Produktentscheidung erforderlich |
| UQ-003 | Darf `DELETE /api/v1/customers/:id/discounts/:dId` bereits implementiert sein? Es ist in CLAUDE.md dokumentiert aber kein Controller-Handler gefunden. | Kein Handler im Code gefunden | Code-Review / Bestätigung ob Route absichtlich fehlt |
| UQ-004 | Welches Format haben Lieferscheinnummern mit `/`? (die bei generateNumber() ausgeschlossen werden) | Keine Dokumentation für dieses Format gefunden | Klärung Business-Logik: wann werden `/`-Nummern vergeben? |
| UQ-005 | Was passiert wenn `generateBill()` bei einem Fehler die erstellte Rechnung zurückrollt — ist das bereits implementiert oder noch offen? | CLAUDE.md listet es als known bug, Code-Review zeigte try/catch aber unklarer Rollback | Code-Prüfung des Transaktionsverhaltens |
| UQ-006 | Welchen HTTP-Status gibt `POST /slipsheets/:id/close` zurück wenn der Lieferschein keine Einträge hat? | Code wirft Exception, genaue Exception-Klasse + Statuscode nicht verifiziert | Code-Prüfung der Exception-Klasse |
| UQ-007 | Ist `UsersService.getByName()` ein Bug (parameter typed as `number` but used as string)? | `getByName(name: number)` aber SQL-Query als String | Code-Review erforderlich |
| UQ-008 | `state`-Filter in `GET /bills` und `GET /slipsheets` — werden ungültige State-Werte ignoriert oder führen zu einem Fehler? | Keine DTO-Validierung für `?state` Query-Parameter sichtbar | Code-Prüfung der Service-Implementierung |

---

## D) RISIKEN & TESTAUSWIRKUNGEN

| ID | Risiko | Quelle | Betroffene REQs | Testauswirkung |
|----|--------|--------|-----------------|----------------|
| R-001 | **Race Condition Nummernvergabe**: `MAX(billNumber/slipsheetnumber) + 1` ohne DB-Lock | `bill.service.ts`, `slipsheet.service.ts`; CLAUDE.md | REQ-052, REQ-063 | Nebenläufige Tests könnten unvorhersehbare Nummern produzieren; Tests müssen sequenziell laufen |
| R-002 | **Auth deaktiviert**: Alle Endpoints ohne Authentifizierung erreichbar | `CLAUDE.md` P0 | REQ-081 | Tests können ohne Token durchgeführt werden, aber Auth-Aktivierung würde alle Tests brechen |
| R-003 | **PDF-Dateisystem-Abhängigkeit**: `savePDFToFileSystem()` schreibt auf Disk — fehlt Verzeichnis → Error | `pdfmaker.service.ts` | REQ-049, REQ-064, REQ-065 | Integrationstests brauchen schreibbares Temp-Verzeichnis |
| R-004 | **SQLite-native-Binary**: `sqlite3` braucht kompiliertes Native-Binary | CLAUDE.md Setup | Alle DB-Tests | Tests könnten auf CI fehlschlagen wenn Binary fehlt |
| R-005 | **Silent Inventory-Failure**: Fehler bei Inventory-Erstellung wird verschluckt | `article.service.ts` | REQ-016 | Test muss verifizieren dass Artikel-Update trotzdem durchgeht UND Inventory nicht erstellt wird |
| R-006 | **inventoryDate-Typ**: War früher `@CreateDateColumn`, jetzt `@Column` — Migration könnte fehlen | CLAUDE.md Bug #4 | REQ-015 | Wenn DB ohne Migration → Column-Typ-Konflikt möglich |
| R-007 | **Offener DELETE-Endpunkt für Discounts**: CLAUDE.md dokumentiert Route, aber kein Controller-Handler sichtbar | UQ-003 | REQ-036 | Frontend könnte 404 beim Löschen von Rabatten erhalten |
| R-008 | **`state`-Filter im Frontend nicht verarbeitet**: CLAUDE.md P2 — Backend ignoriert `?state`-Filter | CLAUDE.md P2 | REQ-040, REQ-060 | Tests müssen verifizieren ob State-Filter tatsächlich funktioniert |

---

## E) TESTDIMENSIONEN

Basierend auf belegbaren Eingaben:

| Dimension | Werte | Belegt durch |
|-----------|-------|--------------|
| **Datenvarianten** | Existente ID / nicht-existente ID / ungültige ID (String, 0, negativ) | Alle Controller mit `:id`-Parametern |
| **Pflichtfelder** | Alle vorhanden / einzelne fehlend / komplett leer | DTOs mit `@IsString`, `@IsNumber` ohne Optional |
| **Enum-Werte (State)** | `open`, `closed`, `changed` (Slipsheet); `open`, `closed` (Bill) | Entity-Definitionen |
| **Order-Entry Typen** | Artikel-Entry / Text-Entry / Beides / Keines | `order-entry.service.ts` Validierung |
| **singlePos-Flag** | `true` / `false` | `article.entity.ts`, `order-entry.service.ts` |
| **Rabatt-Szenarien** | Kein Rabatt / Kundenrabatt / Artikelgruppen-Rabatt / Beide | `order-entry.service.ts` |
| **CSV-Import Modi** | Preview=true / Preview=false / Ungültige Datei | `article.controller.ts` |
| **Dashboard Query** | Ohne Parameter / Mit allen Parametern / Grenzwerte (days=1, days=120, threshold=0) | DTO + Service Normalisierung |

**Nicht belegbare Dimensionen:**
- Rollen / Berechtigungen (Auth deaktiviert → keine Rollentests möglich)
- Locale / Mehrsprachigkeit (keine Evidenz)
- Performance-Schwellenwerte (keine Evidenz)

---

## F) TESTMATRIX (Traceability)

| REQ-ID | Feature / Komponente | Szenario | Testtyp | Prio | +/- | Datenvarianten | Erwartetes Ergebnis | Auto | Notes |
|--------|---------------------|----------|---------|------|-----|---------------|--------------------|----|-------|
| REQ-001 | API Routing | Alle Endpunkte unter `/api/v1` erreichbar | API | High | + | GET /api/v1/articles | HTTP 200 | Yes | |
| REQ-002 | Response-Wrapper | Erfolgreiche Response hat `success: true, data: T` | API | High | + | Standard GET | `{ success: true, data: [...] }` | Yes | |
| REQ-002 | Response-Wrapper | Fehlerhafte Response hat `success: false` | API | High | - | Ungültige ID | `{ success: false, statusCode, error, message }` | Yes | |
| REQ-003 | ValidationPipe | Unbekannte Felder werden verworfen (whitelist) | API | High | - | Extra-Feld in POST | Extra-Feld nicht in Response/DB | Yes | |
| REQ-003 | ValidationPipe | Fehlende Pflichtfelder → 400 | API | High | - | POST ohne `name` | HTTP 400 | Yes | |
| REQ-010 | ArticleController | Alle Artikel abrufen | API | High | + | Standard | HTTP 200, Array | Yes | |
| REQ-010 | ArticleController | Artikel nach Barcode filtern | API | High | + | `?code=ABC` | Gefundener Artikel | Yes | |
| REQ-010 | ArticleController | Barcode nicht gefunden | API | High | - | `?code=NICHTEXISTENT` | HTTP 404 oder leeres Array | BLOCKED (UQ-008) | Genaues Verhalten unklar |
| REQ-011 | ArticleService | Stock-Berechnung korrekt | Unit | High | + | inventoryStock=10, totalAmount=3 | stock=7 | Yes | |
| REQ-012 | ArticleController | Artikel anlegen mit allen Pflichtfeldern | API | High | + | Valid DTO | HTTP 201, Artikel zurück | Yes | |
| REQ-012 | ArticleController | Artikel anlegen ohne Pflichtfeld `name` | API | High | - | DTO ohne name | HTTP 400 | Yes | |
| REQ-013 | ArticleController | Artikel updaten existente ID | API | High | + | PATCH mit valid ID | HTTP 200, aktualisierter Artikel | Yes | |
| REQ-013 | ArticleController | Artikel updaten nicht-existente ID | API | High | - | PATCH mit id=99999 | HTTP 404 | Yes | |
| REQ-014 | ArticleController | Artikel löschen existente ID | API | High | + | DELETE valid ID | HTTP 200, data: null | Yes | |
| REQ-014 | ArticleController | Artikel löschen nicht-existente ID | API | High | - | DELETE id=99999 | HTTP 404 | Yes | |
| REQ-015 | ArticleService | Inventurbuchung setzt neuen Stock | Unit | High | + | newStock=20, alt=10 | inventoryStock=20, diff=10 | Yes | |
| REQ-015 | ArticleService | Inventurbuchung erstellt Inventory-Eintrag | Unit | High | + | makeInventory() | InventoryEntity mit diff=10 | Yes | |
| REQ-016 | ArticleService | Inventory-Fehler blockiert nicht das Artikel-Update | Unit | Med | - | inventoryService.create() wirft Error | Artikel wird trotzdem gespeichert | Yes | Potential Defect wenn try/catch entfernt |
| REQ-017 | ArticleController | CSV-Import Preview | API | Med | + | POST /import?preview=true + Datei | HTTP 200, Preview-Liste | Maybe | Benötigt Multipart-Setup |
| REQ-018 | ArticleController | CSV-Import Ausführung | API | Med | + | POST /import ohne Preview | HTTP 200, [success, failed] | Maybe | |
| REQ-019 | ArticleService | CSV Preisberechnung | Unit | Med | + | brutto=10.99, pe=2 | price=5.50 (Math.ceil) | Yes | |
| REQ-030 | CustomerController | Alle Kunden abrufen | API | High | + | GET /customers | HTTP 200, Array | Yes | |
| REQ-031 | CustomerController | Kunde by ID mit Discounts | API | High | + | GET /customers/1 | HTTP 200, Kunde mit discounts[] | Yes | |
| REQ-031 | CustomerController | Kunde nicht gefunden | API | High | - | GET /customers/99999 | HTTP 404 | Yes | |
| REQ-032 | CustomerController | Kunde anlegen | API | High | + | POST mit customerNumber | HTTP 201 | Yes | |
| REQ-033 | CustomerController | Doppelte customerNumber | API | High | - | POST mit existenter Number | HTTP 4xx (Status UNKLAR) | BLOCKED (UQ-001) | |
| REQ-034 | CustomerController | Lieferscheine eines Kunden | API | High | + | GET /customers/1/slipsheets | HTTP 200, Array | Yes | |
| REQ-035 | CustomerController | Rechnungen eines Kunden | API | High | + | GET /customers/1/bills | HTTP 200, Array | Yes | |
| REQ-036 | CustomerController | Rabatt erstellen | API | Med | + | PUT /customers/1/discounts ohne id | HTTP 200, neuer Discount | Yes | |
| REQ-036 | CustomerController | Rabatt updaten | API | Med | + | PUT /customers/1/discounts mit id | HTTP 200, aktualisierter Discount | Yes | |
| REQ-037 | DiscountService | Rabatt-ArticleGroup unveränderlich | Unit | Med | - | Update mit anderem articleGroupId | Fehler (Status UNKLAR) | BLOCKED (UQ-001) | |
| REQ-040 | SlipsheetController | Alle Lieferscheine abrufen | API | High | + | GET /slipsheets | HTTP 200, Array | Yes | |
| REQ-040 | SlipsheetController | Lieferscheine nach customerId filtern | API | High | + | GET /slipsheets?customerId=1 | Nur OPEN/CHANGED Lieferscheine | Yes | |
| REQ-041 | SlipsheetController | Lieferschein by ID | API | High | + | GET /slipsheets/1 | HTTP 200, mit Relationen | Yes | |
| REQ-041 | SlipsheetController | Lieferschein nicht gefunden | API | High | - | GET /slipsheets/99999 | HTTP 404 | Yes | Bug #1 Fix verifizieren |
| REQ-044 | OrderEntryService | Artikel UND Text gleichzeitig → 400 | Unit | High | - | article + text gesetzt | BadRequest 400 | Yes | |
| REQ-044 | OrderEntryService | Weder Artikel noch Text → 400 | Unit | High | - | article = null, text = null | BadRequest 400 | Yes | |
| REQ-045 | OrderEntryService | Artikel hinzufügen erhöht Menge | Unit | High | + | singlePos=false, Entry existiert | amount += 1 | Yes | |
| REQ-046 | OrderEntryService | singlePos erzeugt neuen Entry | Unit | Med | + | singlePos=true, Entry existiert | Neuer Entry | Yes | |
| REQ-047 | OrderEntryService | Rabatte werden gespeichert | Unit | High | + | Kunde mit Rabatt + Artikelgruppe | customerRabatt und articleGroupRabatt gesetzt | Yes | |
| REQ-048 | SlipsheetController | Lieferschein schließen | API | High | + | POST /slipsheets/1/close | HTTP 200, state=closed | Yes | |
| REQ-048 | SlipsheetController | Leeren Lieferschein schließen → Fehler | API | High | - | Lieferschein ohne Entries | HTTP 4xx | BLOCKED (UQ-006) | |
| REQ-052 | SlipsheetService | Lieferscheinnummer Generierung | Unit | Med | + | MAX=5 | Nächste Nummer=6 | Yes | |
| REQ-053 | OrderEntryController | Entry updaten | API | High | + | PUT /order-entries/1 | HTTP 200, aktualisierter Entry | Yes | |
| REQ-053 | OrderEntryController | Entry mit amount=0 löschen | API | High | + | PUT /order-entries/1 amount=0 | Entry gelöscht, Lieferschein CHANGED | Yes | |
| REQ-054 | SlipsheetService | State-Änderung bei Entry-Update | Unit | Med | + | CLOSED Lieferschein, Entry geändert | Lieferschein state=CHANGED | Yes | |
| REQ-060 | BillController | Alle Rechnungen abrufen | API | High | + | GET /bills | HTTP 200, Array | Yes | |
| REQ-061 | BillService | Rechnung aus CLOSED Lieferscheinen | Unit | High | + | Alle Slipsheets closed, gleicher Kunde | Rechnung erstellt | Yes | |
| REQ-061 | BillService | Rechnung aus OPEN Lieferschein → Fehler | Unit | High | - | Slipsheet state=open | Exception | Yes | |
| REQ-061 | BillService | Rechnung aus verschiedenen Kunden → Fehler | Unit | High | - | Slipsheets verschiedener Kunden | Exception | Yes | |
| REQ-063 | BillService | Rechnungsnummer eindeutig (Race Condition) | NON-REQ | High | - | Parallele Requests | BLOCKED — kein DB-Lock | BLOCKED (R-001) | Known Bug |
| REQ-064 | BillController | PDF abrufen wenn vorhanden | API | High | + | GET /bills/1/pdf, PDF existiert | StreamableFile | Maybe | Filesystem-Setup nötig |
| REQ-064 | BillController | PDF abrufen wenn nicht vorhanden → 404 | API | High | - | GET /bills/1/pdf, PDF fehlt | HTTP 404 | Yes | Bug #2 Fix verifizieren |
| REQ-065 | BillController | PDF neu generieren | API | Med | + | POST /bills/1 | HTTP 200, Rechnung | Maybe | Filesystem nötig |
| REQ-066 | BillController | Rechnung updaten | API | Med | + | PUT /bills/1 | HTTP 200, aktualisierte Rechnung | Yes | |
| REQ-067 | OrderEntryService | Bill-State CHANGED bei Entry-Update | Unit | Med | + | Entry in Slipsheet mit Bill | Bill state=CHANGED | Yes | |
| REQ-070 | DashboardController | Summary abrufen | API | Med | + | GET /dashboard/summary | HTTP 200, KPI-Objekt | Yes | |
| REQ-071 | DashboardService | Normalisierung days | Unit | Med | + | days=0 → default 30; days=200 → 120 | Normalisierter Wert | Yes | |
| REQ-081 | Auth | Auth ist deaktiviert | NON-REQ | High | + | Beliebiger Request ohne Token | HTTP 200 (kein 401) | Yes | Dokumentiert als bekanntes Risiko |

---

## G) TESTFÄLLE (Spezifikation — Given/When/Then)

> Framework: **framework-agnostisch** (UNBELEGT)
> Setup-Annahme: In-Memory SQLite Testdatenbank oder Test-SQLite-Datei, HTTP-Testclient (z.B. supertest-äquivalent)

---

### TC-001 — Artikel-Liste abrufen
**REQ-ID:** REQ-010
**Titel:** GET /articles gibt alle Artikel zurück
**Typ:** API/Integration
**Status:** READY

**Setup:** Datenbank mit 2 Artikeln befüllt

**Given** die Datenbank enthält 2 Artikel (id=1, code="A001"; id=2, code="A002")
**When** `GET /api/v1/articles`
**Then**
- HTTP Status: `200`
- Body: `{ success: true, data: [Article, Article] }`
- `data.length === 2`
- Jeder Artikel enthält Feld `stock` (number)

**Orakel:** REQ-010, REQ-011, REQ-002
**Automatisierung:** Yes

---

### TC-002 — Artikel-Stock-Berechnung
**REQ-ID:** REQ-011
**Titel:** stock = inventoryStock - totalAmount
**Typ:** Unit
**Status:** READY

**Setup:** Artikel mit `inventoryStock=10`, dazu 3 OrderEntries mit amount=1

**Given** ein Artikel hat `inventoryStock=10`
**And** 3 OrderEntries referenzieren den Artikel mit je `amount=1`
**When** `articleService.get(articleId)` aufgerufen wird
**Then**
- `article.stock === 7`
- `article.inventoryStock === 10`

**Orakel:** REQ-011 (Derived-from-code)
**Automatisierung:** Yes

---

### TC-003 — Artikel anlegen: Erfolgsfall
**REQ-ID:** REQ-012
**Titel:** POST /articles legt neuen Artikel an
**Typ:** API
**Status:** READY

**Given** keine Artikel in der DB
**When** `POST /api/v1/articles` mit Body:
```json
{ "name": "Test", "code": "X001", "price": 9.99, "type": "T", "unit": "Stk", "artNumber": "001", "articleGroup": { "id": 1 } }
```
**Then**
- HTTP Status: `201`
- Body: `{ success: true, data: { id: number, name: "Test", code: "X001", ... } }`

**Orakel:** REQ-012
**Automatisierung:** Yes

---

### TC-004 — Artikel anlegen: Pflichtfeld fehlt
**REQ-ID:** REQ-012, REQ-003
**Titel:** POST /articles ohne Pflichtfeld `name` → 400
**Typ:** API
**Status:** READY

**Given** valide DB
**When** `POST /api/v1/articles` mit Body ohne `name`
**Then**
- HTTP Status: `400`
- Body: `{ success: false, ... }`

**Orakel:** REQ-003 (ValidationPipe)
**Automatisierung:** Yes

---

### TC-005 — Artikel updaten: nicht-existente ID
**REQ-ID:** REQ-013
**Titel:** PATCH /articles/:id mit ungültiger ID → 404
**Typ:** API
**Status:** READY

**Given** Artikel mit id=99999 existiert nicht
**When** `PATCH /api/v1/articles/99999` mit `{ "name": "Neu" }`
**Then**
- HTTP Status: `404`

**Orakel:** REQ-013
**Automatisierung:** Yes

---

### TC-006 — Inventurbuchung: Normalfall
**REQ-ID:** REQ-015
**Titel:** POST /articles/:id/inventory setzt neuen Stock
**Typ:** API
**Status:** READY

**Setup:** Artikel mit id=1, `inventoryStock=5`

**Given** Artikel id=1 mit inventoryStock=5
**When** `POST /api/v1/articles/1/inventory` mit `{ "newStock": 20 }`
**Then**
- HTTP Status: `200`
- `data.inventoryStock === 20`
- In der DB existiert ein Inventory-Eintrag mit `amountNew=20`, `diff=15`

**Orakel:** REQ-015
**Automatisierung:** Yes

---

### TC-007 — Inventurbuchung: Fehlertoleranz bei Inventory-Erstellung
**REQ-ID:** REQ-016
**Titel:** Inventory-Erstellungsfehler blockiert nicht den Artikel-Update
**Typ:** Unit
**Status:** READY

**Setup:** Mock `inventoryService.create()` wirft Error

**Given** `inventoryService.create` wird mit Error gemockt
**When** `articleService.makeInventory(article, newStock)` aufgerufen wird
**Then**
- Kein Error wird nach außen geworfen
- `article.inventoryStock` wurde aktualisiert

**Orakel:** REQ-016
**Potential Defect:** Wenn try/catch entfernt wird, bricht dieser Test — dann ist REQ-016 verletzt
**Automatisierung:** Yes

---

### TC-008 — CSV Preisberechnung
**REQ-ID:** REQ-019
**Titel:** Preisformel Math.ceil((brutto/pe)*100)/100
**Typ:** Unit
**Status:** READY

**Given** brutto=10.99, pe=2
**When** `importCsv()` berechnet den Preis
**Then** `price === 5.50`

**Given** brutto=10.00, pe=3
**When** berechnet
**Then** `price === Math.ceil((10/3)*100)/100 === 3.34`

**Orakel:** REQ-019 (Derived-from-code)
**Automatisierung:** Yes

---

### TC-009 — Order-Entry: Artikel UND Text → 400
**REQ-ID:** REQ-044
**Titel:** Gleichzeitig article + text → BadRequest
**Typ:** Unit
**Status:** READY

**Given** valide Slipsheet und Kunde
**When** `orderEntryService.addOrderToSlipsheet({ article: {id:1}, text: "Manuell", ... })`
**Then**
- `BadRequestException` wird geworfen

**Orakel:** REQ-044
**Automatisierung:** Yes

---

### TC-010 — Order-Entry: Weder Artikel noch Text → 400
**REQ-ID:** REQ-044
**Titel:** Weder article noch text → BadRequest
**Typ:** Unit
**Status:** READY

**Given** valide Slipsheet und Kunde
**When** `orderEntryService.addOrderToSlipsheet({ article: null, text: null, ... })`
**Then**
- `BadRequestException` wird geworfen

**Orakel:** REQ-044
**Automatisierung:** Yes

---

### TC-011 — Order-Entry: Mengenerhöhung (singlePos=false)
**REQ-ID:** REQ-045
**Titel:** Zweiter gleicher Artikel erhöht Menge
**Typ:** Unit
**Status:** READY

**Setup:** Artikel mit singlePos=false; Lieferschein mit existierendem Entry für diesen Artikel (amount=2)

**Given** Lieferschein hat bereits Entry mit Artikel A (amount=2)
**And** Artikel A hat singlePos=false
**When** Artikel A erneut hinzugefügt (amount=1)
**Then** Entry.amount === 3 (erhöht, kein neuer Entry)

**Orakel:** REQ-045
**Automatisierung:** Yes

---

### TC-012 — Order-Entry: singlePos erzeugt neuen Entry
**REQ-ID:** REQ-046
**Titel:** singlePos=true erzeugt immer neuen Entry
**Typ:** Unit
**Status:** READY

**Setup:** Artikel mit singlePos=true; Lieferschein mit existierendem Entry

**Given** Entry für Artikel A existiert bereits (amount=2)
**And** Artikel A hat singlePos=true
**When** Artikel A erneut hinzugefügt
**Then** Neuer Entry erstellt, gesamt 2 Entries für Artikel A

**Orakel:** REQ-046
**Automatisierung:** Yes

---

### TC-013 — Rechnung generieren: Erfolgsfall
**REQ-ID:** REQ-061
**Titel:** generateBill mit validen CLOSED Lieferscheinen
**Typ:** Unit
**Status:** READY

**Setup:** 2 CLOSED Lieferscheine, gleicher Kunde

**Given** Lieferschein 1 (state=CLOSED, customer=K1)
**And** Lieferschein 2 (state=CLOSED, customer=K1)
**When** `billService.generateBill([LS1, LS2])`
**Then**
- Rechnung erstellt
- `bill.state === "closed"`
- LS1 und LS2 referenzieren die neue Rechnung

**Orakel:** REQ-061
**Automatisierung:** Yes

---

### TC-014 — Rechnung generieren: Lieferschein OPEN → Fehler
**REQ-ID:** REQ-061
**Titel:** generateBill mit OPEN Lieferschein → Exception
**Typ:** Unit
**Status:** READY

**Given** Lieferschein 1 (state=OPEN)
**When** `billService.generateBill([LS1])`
**Then** Exception wird geworfen

**Orakel:** REQ-061
**Automatisierung:** Yes

---

### TC-015 — Rechnung generieren: Verschiedene Kunden → Fehler
**REQ-ID:** REQ-061
**Titel:** generateBill mit Lieferscheinen verschiedener Kunden → Exception
**Typ:** Unit
**Status:** READY

**Given** LS1 (state=CLOSED, customer=K1), LS2 (state=CLOSED, customer=K2)
**When** `billService.generateBill([LS1, LS2])`
**Then** Exception wird geworfen

**Orakel:** REQ-061
**Automatisierung:** Yes

---

### TC-016 — Rechnung-PDF: Nicht vorhanden → 404
**REQ-ID:** REQ-064
**Titel:** GET /bills/:id/pdf wenn kein PDF → 404 (kein Regenerate)
**Typ:** API
**Status:** READY

**Setup:** Rechnung in DB, aber kein PDF auf Filesystem

**Given** Rechnung id=1 existiert, PDF-Datei existiert NICHT
**When** `GET /api/v1/bills/1/pdf`
**Then**
- HTTP Status: `404`
- PDF wird NICHT neu generiert

**Orakel:** REQ-064; Bug #2 Fix
**Potential Defect:** Wenn Bug #2 nicht vollständig gefixt → PDF wird trotzdem generiert → Test schlägt fehl → Code defekt
**Automatisierung:** Yes (Filesystem-Mock nötig)

---

### TC-017 — Lieferschein by ID: Bug #1 Fix verifizieren
**REQ-ID:** REQ-041
**Titel:** GET /slipsheets/:id gibt korrekten Lieferschein zurück
**Typ:** API
**Status:** READY

**Setup:** Lieferschein mit id=5

**Given** Lieferschein id=5 existiert
**When** `GET /api/v1/slipsheets/5`
**Then**
- HTTP Status: `200`
- `data.id === 5`
- `data` ist kein `undefined`

**Orakel:** REQ-041; Bug #1 Fix
**Potential Defect:** Wenn Cast `+id` fehlt → `data === undefined` → Test schlägt fehl → Code defekt
**Automatisierung:** Yes

---

### TC-018 — Order-Entry amount=0 löscht Entry
**REQ-ID:** REQ-053
**Titel:** PUT /order-entries/:id mit amount=0 löscht Entry und markiert Lieferschein CHANGED
**Typ:** API
**Status:** READY

**Setup:** Entry id=1 in CLOSED Lieferschein id=2

**Given** OrderEntry id=1, amount=3 in Lieferschein id=2 (CLOSED)
**When** `PUT /api/v1/order-entries/1` mit `{ "amount": 0 }`
**Then**
- Entry id=1 nicht mehr in DB
- Lieferschein id=2 state === "changed"

**Orakel:** REQ-053, REQ-054
**Automatisierung:** Yes

---

### TC-019 — Dashboard Summary: Normalfall
**REQ-ID:** REQ-070
**Titel:** GET /dashboard/summary gibt KPI-Objekt zurück
**Typ:** API
**Status:** READY

**Given** Standard-Datenbestand (mindestens 1 Artikel, 1 Lieferschein)
**When** `GET /api/v1/dashboard/summary`
**Then**
- HTTP Status: `200`
- Body enthält Felder: `kpis`, `lowStockItems`, `topMovingArticles`, `stockTrend`, `documentQueue`, `recentInventoryActivities`

**Orakel:** REQ-070
**Automatisierung:** Yes

---

### TC-020 — Dashboard Query: Normalisierung
**REQ-ID:** REQ-071
**Titel:** Ungültige days/threshold werden normalisiert
**Typ:** Unit
**Status:** READY

**Given** Query: `days=0`, `threshold=-5`
**When** `dashboardService.getSummary({ days: 0, threshold: -5 })`
**Then** Interne Normalisierung verwendet `days=30` (Default), `threshold=0` (Minimum)

**Given** Query: `days=500`
**When** `dashboardService.getSummary({ days: 500 })`
**Then** `days` wird auf 120 begrenzt

**Orakel:** REQ-071
**Automatisierung:** Yes

---

### TC-021 — Whitelist: Extra-Felder werden verworfen
**REQ-ID:** REQ-003
**Titel:** ValidationPipe verwirft unbekannte Felder
**Typ:** API
**Status:** READY

**Given** valide API
**When** `POST /api/v1/customers` mit `{ "customerNumber": "K001", "hackerField": "malicious" }`
**Then**
- HTTP Status: `201`
- Gespeicherte Entity hat kein `hackerField`

**Orakel:** REQ-003
**Automatisierung:** Yes

---

### TC-022 — Rabatt-Update: ArticleGroup unveränderlich
**REQ-ID:** REQ-037
**Titel:** Rabatt-Update mit geänderter ArticleGroup → Fehler
**Typ:** Unit
**Status:** BLOCKED

**Blocker:** UQ-001 — genaue Exception/HTTP-Status unklar

**Given** Discount id=1 mit articleGroupId=5
**When** `discountService.createOrUpdate(customer, { id: 1, articleGroup: {id: 9}, value: 10 })`
**Then** Exception wird geworfen (genaue Klasse: BLOCKED)

**Orakel:** REQ-037
**Automatisierung:** Blocked

---

### TC-023 — Auth deaktiviert: Requests ohne Token erfolgreich
**REQ-ID:** REQ-081
**Titel:** API ohne Authorization-Header erreichbar
**Typ:** API / NON-REQ
**Status:** READY

**Given** kein `Authorization: Bearer ...` Header
**When** `GET /api/v1/articles`
**Then**
- HTTP Status: `200` (kein 401)

**Orakel:** REQ-081
**Automatisierung:** Yes
**Hinweis:** Test dokumentiert aktuellen Ist-Zustand. Wenn Auth aktiviert wird, muss dieser Test angepasst werden.

---

### TC-024 — Lieferschein-State: customerId-Filter
**REQ-ID:** REQ-040
**Titel:** GET /slipsheets?customerId=X gibt nur OPEN/CHANGED zurück
**Typ:** API
**Status:** READY

**Setup:** Kunde K1 mit 3 Lieferscheinen: OPEN, CLOSED, CHANGED

**Given** Kunde K1 hat: LS1 (OPEN), LS2 (CLOSED), LS3 (CHANGED)
**When** `GET /api/v1/slipsheets?customerId=K1`
**Then**
- `data.length === 2`
- Enthält LS1 (OPEN) und LS3 (CHANGED)
- LS2 (CLOSED) NICHT enthalten

**Orakel:** REQ-040
**Automatisierung:** Yes

---

### TC-025 — Lieferschein-Nummer Generierung
**REQ-ID:** REQ-052
**Titel:** generateNumber gibt MAX+1 zurück
**Typ:** Unit
**Status:** READY

**Setup:** DB mit Lieferscheinen: slipsheetnumber IN ['1','2','3','5']

**Given** höchste ganzzahlige Nummer = 5
**When** `slipsheetService.generateNumber()`
**Then** Rückgabe: `"6"`

**Given** keine Lieferscheine in DB
**When** `slipsheetService.generateNumber()`
**Then** Rückgabe: `"1"`

**Orakel:** REQ-052
**Automatisierung:** Yes

---

## H) COVERAGE SUMMARY

| Metrik | Wert |
|--------|------|
| Requirements gesamt | 35 (REQ-001 bis REQ-081) |
| Abgedeckte Requirements | 32 |
| Testfälle gesamt | 25 (TC-001 bis TC-025) |
| READY | 23 |
| BLOCKED | 2 (TC-022) + mehrere Matrix-Zeilen |

**Fehlende / unvollständige Abdeckung:**

| REQ-ID | Grund |
|--------|-------|
| REQ-005 | CORS-Konfiguration — Testinfrastruktur für ENV-Variable nötig |
| REQ-017/018 | CSV-Import — Multipart-Datei-Setup fehlt; als Maybe markiert |
| REQ-020 | Artikelgruppen CRUD — nur Low-Prio, kein dedizierter TC |
| REQ-033 | Duplikat-customerNumber — HTTP-Status unklar (UQ-001 offen) |
| REQ-037 | Rabatt unveränderlich — HTTP-Status unklar (UQ-001 offen) |
| REQ-063 | Race Condition Nummernvergabe — kein DB-Lock implementiert; BLOCKED |
| REQ-080 | Users CRUD — Low-Prio; kein dedizierter TC |

---

## I) GAPS & BLOCKERS

| ID | Beschreibung | Betroffene REQs | Fehlende Info |
|----|-------------|-----------------|---------------|
| GAP-001 | Kein Testframework definiert → Keine lauffähigen Testdateien generiert | Alle | Framework-Entscheidung (Jest/Vitest/Mocha/Supertest) |
| GAP-002 | Kein OpenAPI-Export → Kontraktvalidierung nicht möglich | Alle | Swagger YAML/JSON Export benötigt |
| GAP-003 | PDF-Tests benötigen Filesystem-Mock oder Temp-Verzeichnis | REQ-049, REQ-064, REQ-065 | Setup-Strategie unklar |
| GAP-004 | CSV-Import Tests benötigen Multipart-Fixture | REQ-017, REQ-018 | CSV-Testdatei + Multipart-Client |
| GAP-005 | `DELETE /customers/:id/discounts/:dId` fehlt im Code laut Exploration | REQ-036 | Backend-Implementierung prüfen |
| GAP-006 | Race Condition (REQ-063) nicht testbar ohne DB-Lock | REQ-052, REQ-063 | Transaktionaler Lock implementieren |
| GAP-007 | Auth-Aktivierungspfad nicht getestet | REQ-081 | Entscheidung über Auth-Strategie (UQ-002) |
| BLOCKED-001 | TC-022 (Rabatt-Update) | REQ-037 | HTTP-Status nach Exception unklar (UQ-001) |
| BLOCKED-002 | TC-048-negative (leerer Lieferschein schließen) | REQ-048 | Exception-Klasse und HTTP-Status unklar (UQ-006) |
| BLOCKED-003 | Duplikat-customerNumber-Test | REQ-033 | HTTP-Status nach UNIQUE constraint unklar (UQ-001) |

---

## J) DECISION NEEDED

| ID | Entscheidung | Betroffene REQs | Widersprüchliche Evidenz / Warum offen |
|----|-------------|-----------------|----------------------------------------|
| DEC-001 | **Testframework** — Jest (NestJS-Standard) oder anderes? | Alle | Kein `jest.config.ts` oder ähnliches im Code gefunden |
| DEC-002 | **Auth** — Guards aktivieren (P0 lt. CLAUDE.md) oder dauerhaft deaktivieren? | REQ-081 | CLAUDE.md: "Option A: JWT Guard global einbauen; Option B: Auth entfernen" |
| DEC-003 | **HTTP-Status bei UNIQUE-Constraint-Verletzung** — 409 Conflict oder 400 Bad Request? | REQ-033, REQ-037 | ErrorFilter fängt allgemein ab; kein spezifischer Handler für DB-Constraints |
| DEC-004 | **Race Condition Fix** — DB-Transaktion mit Lock für Nummernvergabe implementieren? | REQ-063, REQ-052 | CLAUDE.md listet als P1 offen; keine Implementierung sichtbar |
| DEC-005 | **DELETE /customers/:id/discounts/:dId** — Ist dieser Endpunkt implementiert? | REQ-036 | CLAUDE.md dokumentiert Route, kein Controller-Handler im Code gefunden |
| DEC-006 | **Lieferscheinnummer-Format mit '/'** — Was bedeuten diese Nummern? Wann werden sie vergeben? | REQ-052 | Code schließt `/`-Nummern aus `generateNumber()` aus, aber keine Dokumentation warum |
| DEC-007 | **Integrationstests vs. Unit-Tests** — Sollen Tests gegen echte SQLite-DB oder gemockte Repositories laufen? | Alle | Keine Test-Setup-Strategie definiert |

---

## K) TEST FILE MAP

> **Status:** BLOCKED (GAP-001 — Kein Testframework definiert)
> Sobald Framework entschieden: Test-Dateien können generiert werden.

**Vorgeschlagene Dateistruktur (bei Jest/NestJS-Standard):**

```
apps/server/src/
├── models/
│   ├── article/
│   │   ├── __tests__/
│   │   │   ├── article.service.spec.ts        → TC-001, TC-002, TC-006, TC-007, TC-008
│   │   │   └── article.controller.spec.ts     → TC-003, TC-004, TC-005
│   ├── bills/
│   │   ├── __tests__/
│   │   │   ├── bill.service.spec.ts           → TC-013, TC-014, TC-015
│   │   │   ├── bill.controller.spec.ts        → TC-016, TC-060
│   │   │   ├── slipsheet.service.spec.ts      → TC-017, TC-024, TC-025
│   │   │   ├── slipsheet.controller.spec.ts   → TC-041, TC-048
│   │   │   ├── order-entry.service.spec.ts    → TC-009, TC-010, TC-011, TC-012, TC-018
│   │   │   └── discount.service.spec.ts       → TC-022 (BLOCKED)
│   ├── customer/
│   │   ├── __tests__/
│   │   │   └── customer.controller.spec.ts    → TC-030, TC-031
├── common/
│   ├── __tests__/
│   │   └── validation.spec.ts                → TC-021
├── dashboard/
│   ├── __tests__/
│   │   └── dashboard.service.spec.ts         → TC-019, TC-020
└── e2e/
    ├── articles.e2e.spec.ts                  → TC-001, TC-003, TC-004
    ├── slipsheets.e2e.spec.ts                → TC-017, TC-024
    ├── bills.e2e.spec.ts                     → TC-016
    └── auth.e2e.spec.ts                      → TC-023
```

---

*Ende des Dokuments*
*Generiert von test-agent · 2026-03-17 · SIMS Backend v1 (Branch: first-init)*
