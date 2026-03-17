# REQ-003 — Global ValidationPipe (whitelist + transform)

**Datum:** 2026-03-17 · **Branch:** first-init
**Eltern-Dokument:** `test-req/backend-requirements.md`
**Framework:** Framework-agnostisch (UNBELEGT) — Given/When/Then

---

## Requirement

| Feld | Wert |
|------|------|
| **ID** | REQ-003 |
| **Titel** | Global ValidationPipe (whitelist, transform) |
| **Beschreibung** | (1) **Whitelist:** Felder, die nicht im DTO deklariert sind, werden ohne Fehler aus dem Request-Body entfernt und nicht verarbeitet. (2) **Transform:** String-Werte in Query-Parametern/Path-Params werden automatisch in den deklarierten Typ umgewandelt (z.B. `"5"` → `5`). (3) **Validierung:** Fehlende Pflichtfelder und Typ-Verletzungen führen zu HTTP 400. |
| **Quelle** | `apps/server/src/main.ts` Zeilen 22–27 |
| **Evidenz** | `new ValidationPipe({ whitelist: true, transform: true })` |
| **Priorität** | High |
| **Status** | CONFIRMED |

### Exakte Konfiguration aus Code

```typescript
// main.ts, Zeile 22–27
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,   // Entfernt nicht-deklarierte Felder (kein Fehler)
    transform: true,   // Transformiert Eingaben in deklarierte Typen
  }),
);
```

**Hinweis `whitelist: true`:** Extra-Felder werden **still entfernt** (kein 400). Das Ziel ist Schutz vor unerwarteten Payloads, nicht Ablehnung.
**Hinweis `transform: true`:** NestJS transformiert z.B. `@Param('id')` mit `id: number` → String aus URL wird zu Number gecastet.

---

## E) Testdimensionen

| Dimension | Werte | Belegt durch |
|-----------|-------|--------------|
| **Whitelist-Verhalten** | Bekanntes Feld (erlaubt) / Unbekanntes Feld (still entfernt) / Nur unbekannte Felder (alle entfernt, Body effektiv leer) | `ValidationPipe({ whitelist: true })` |
| **Pflichtfeld-Validierung** | Alle Pflichtfelder vorhanden / Einzelnes Pflichtfeld fehlt / Alle Pflichtfelder fehlen | DTOs mit `@IsString()`, `@IsNumber()` ohne `@IsOptional()` |
| **Typvalidierung** | Korrekter Typ / Falscher Typ (String statt Number) | DTO-Dekoratoren |
| **Transform** | Path-Param als String → Number / Query-Param als String → Number | `transform: true`; Controller mit `:id` Parametern |
| **Nested DTO** | Korrekte Nested-Objekte / Fehlende verschachtelte Pflichtfelder | `IdDto` in DTOs (z.B. `articleGroup: IdDto`) |

**Nicht belegbar:** Enum-Validierung in DTOs (kein `@IsEnum` in REQ-001–005 Scope), Array-Validierungen

---

## F) Testmatrix

| REQ-ID | Feature/Komponente | Szenario | Testtyp | Prio | +/- | Datenvarianten | Erwartetes Ergebnis | Auto | Notes |
|--------|-------------------|----------|---------|------|-----|---------------|---------------------|------|-------|
| REQ-003 | ValidationPipe whitelist | Unbekanntes Feld im Body wird still entfernt | API | High | - | POST mit `{ "customerNumber": "K001", "hackerField": "x" }` | HTTP 201; gespeichertes Objekt hat kein `hackerField` | Yes | Kein 400 — silent strip |
| REQ-003 | ValidationPipe whitelist | Ausschließlich unbekannte Felder → 400 wegen fehlenden Pflichtfeldern | API | High | - | POST mit `{ "unknownOnly": "x" }` | HTTP 400 (Pflichtfeld `customerNumber` fehlt) | Yes | Whitelist entfernt alle → Pflichtfeld-Validierung schlägt an |
| REQ-003 | ValidationPipe whitelist | Bekannte Felder werden korrekt übergeben | API | High | + | POST mit validen DTO-Feldern | HTTP 201, alle Felder in Response | Yes | |
| REQ-003 | Pflichtfeld fehlt | Einzelnes Pflichtfeld fehlt → 400 | API | High | - | POST /articles ohne `name` | HTTP 400, `body.message` enthält Constraint-Beschreibung | Yes | Evidenz: `@IsString()` ohne `@IsOptional()` |
| REQ-003 | Pflichtfeld fehlt | Alle Pflichtfelder fehlen → 400 | API | High | - | POST /articles mit `{}` | HTTP 400, mehrere Messages im Array | Yes | |
| REQ-003 | Pflichtfeld fehlt | `message`-Array enthält eine Meldung pro verletztem Feld | API | Med | - | POST /articles ohne `name` und `code` | `body.message.length >= 2` | Yes | NestJS ValidationPipe-Standardverhalten |
| REQ-003 | Transform — Path-Param | `id` in `:id`-Route wird aus String zu Number transformiert | Unit/API | High | + | `GET /api/v1/articles/5` (id als String in URL) | Interne Verarbeitung mit `id = 5` (number) | Yes | INFERIERT: `transform: true` transformiert `@Param('id') id: number` |
| REQ-003 | Transform — Query-Param | `@Query` mit `@Type(() => Number)` wird transformiert | Unit | Med | + | `GET /dashboard/summary?days=30` | `days` intern als `30` (number), nicht `"30"` (string) | Yes | Belegt durch `DashboardSummaryQueryDto @Type(() => Number)` |
| REQ-003 | Nested DTO | Fehlende `id` in Nested-DTO `articleGroup` → 400 | API | High | - | POST /articles mit `{ ..., "articleGroup": {} }` (id fehlt) | HTTP 400 | Yes | `IdDto` hat `id: number` als Pflichtfeld |
| REQ-003 | Typfehler | String statt Number in Pflichtfeld → 400 | API | Med | - | POST mit `{ "price": "nicht-eine-zahl" }` | HTTP 400 | Yes | `@IsNumber()` in DTO |

---

## G) Testfälle

---

### TC-003-001 — Whitelist: Unbekanntes Feld wird still entfernt
**REQ-ID:** REQ-003
**Titel:** Extra-Feld im Request wird verworfen, keine 400-Antwort
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; DB akzeptiert neuen Customer

**Given** das Backend ist gestartet
**When** `POST /api/v1/customers` mit Body:
```json
{
  "customerNumber": "K-WHITELIST-TEST",
  "hackerField": "sollte-ignoriert-werden",
  "anotherUnknown": 12345
}
```
**Then**
- HTTP Status ist `201` (kein 400)
- `body.success === true`
- `body.data.customerNumber === "K-WHITELIST-TEST"`
- `body.data` enthält kein Feld `hackerField`
- `body.data` enthält kein Feld `anotherUnknown`

**Testdaten:** Wie oben; Aufräumen: gespeicherten Kunden nach Test löschen
**Orakel:** REQ-003 — `whitelist: true` entfernt unbekannte Felder still
**Automatisierung:** Yes

---

### TC-003-002 — Whitelist: Ausschließlich Extra-Felder → fehlende Pflichtfelder
**REQ-ID:** REQ-003
**Titel:** Body nur mit unbekannten Feldern → 400 wegen fehlendem Pflichtfeld
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `POST /api/v1/customers` mit Body `{ "unknownField": "x" }`
**Then**
- HTTP Status ist `400`
- `body.success === false`
- `body.message` enthält Hinweis auf `customerNumber` (Pflichtfeld fehlt)

**Testdaten:** `{ "unknownField": "x" }`
**Orakel:** REQ-003 (whitelist entfernt `unknownField`; `customerNumber` bleibt fehlend → ValidationPipe 400)
**Automatisierung:** Yes

---

### TC-003-003 — Pflichtfeld fehlt: Einzelnes Feld
**REQ-ID:** REQ-003
**Titel:** POST ohne einzelnes Pflichtfeld `name` → HTTP 400
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `POST /api/v1/articles` mit Body ohne das Feld `name`:
```json
{
  "code": "T001",
  "price": 9.99,
  "type": "Typ",
  "unit": "Stk",
  "artNumber": "001",
  "articleGroup": { "id": 1 }
}
```
**Then**
- HTTP Status ist `400`
- `body.success === false`
- `body.message` ist ein Array
- Mindestens ein Element in `body.message` beschreibt den `name`-Fehler

**Testdaten:** Wie oben
**Orakel:** REQ-003; `CreateArticleDto.name` ist `@IsString()` ohne `@IsOptional()`
**Automatisierung:** Yes

---

### TC-003-004 — Pflichtfeld fehlt: Leerer Body
**REQ-ID:** REQ-003
**Titel:** POST mit leerem Body → HTTP 400 mit mehreren Fehlermeldungen
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `POST /api/v1/articles` mit Body `{}`
**Then**
- HTTP Status ist `400`
- `body.success === false`
- `body.message` ist Array mit **mehr als einem** Element (für jedes fehlende Pflichtfeld mindestens 1 Message)

**Testdaten:** `{}`
**Orakel:** REQ-003; `CreateArticleDto` hat mehrere Pflichtfelder ohne `@IsOptional()`
**Automatisierung:** Yes

---

### TC-003-005 — Transform: Path-Param String → Number
**REQ-ID:** REQ-003
**Titel:** `:id` URL-Parameter wird von String zu Number transformiert
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; Artikel mit id=5 in DB

**Given** Artikel mit id=5 existiert
**When** `GET /api/v1/articles/5`
**Then**
- HTTP Status ist `200`
- `body.data.id === 5` (number, nicht `"5"`)
- Kein Fehler aufgrund des String-URL-Parameters

**Testdaten:** id=5 (als String in URL, als Number im System)
**Orakel:** REQ-003 — `transform: true`; `@Param('id') id: number` in Controller
**Automatisierung:** Yes
**Hinweis:** Test verifiziert indirekt, dass Transform funktioniert. Ein fehlgeschlagener Transform würde keine DB-Abfrage erzeugen (String-Vergleich statt Number-Vergleich in SQL).

---

### TC-003-006 — Transform: Query-Param String → Number
**REQ-ID:** REQ-003
**Titel:** `?days=30` wird intern als Number verarbeitet
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `GET /api/v1/dashboard/summary?days=30`
**Then**
- HTTP Status ist `200` (kein 400 wegen falschen Typs)
- Dashboard-Response enthält `filters.days === 30` (number)

**Testdaten:** `?days=30`
**Orakel:** REQ-003; `DashboardSummaryQueryDto` mit `@Type(() => Number)` und `@IsInt`
**Automatisierung:** Yes

---

### TC-003-007 — Nested DTO: Fehlende id in articleGroup
**REQ-ID:** REQ-003
**Titel:** POST /articles mit leerem `articleGroup`-Objekt → HTTP 400
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `POST /api/v1/articles` mit Body:
```json
{
  "name": "Test",
  "code": "X001",
  "price": 9.99,
  "type": "T",
  "unit": "Stk",
  "artNumber": "001",
  "articleGroup": {}
}
```
(Feld `id` in `articleGroup` fehlt)
**Then**
- HTTP Status ist `400`
- `body.message` enthält Hinweis auf `articleGroup.id`

**Testdaten:** Wie oben
**Orakel:** REQ-003; `IdDto.id` ist `@IsNumber()` ohne `@IsOptional()`
**Automatisierung:** Yes

---

## H) Coverage Summary

| Metrik | Wert |
|--------|------|
| Requirements in dieser Datei | 1 (REQ-003) |
| Testfälle gesamt | 7 (TC-003-001 bis TC-003-007) |
| Abgedeckte Szenarien | Whitelist-silent-strip, whitelist+pflichtfeld, pflichtfeld-einzel, pflichtfeld-leer, transform-path, transform-query, nested-dto |
| READY | 7 |
| BLOCKED | 0 |

**Nicht abgedeckt (begründet):**
- Typfehler (String statt Number in Feld): In Matrix enthalten, aber kein eigener TC — Pflichtfeld-Tests decken ähnliches Verhalten ab. Kann bei Bedarf ergänzt werden.

---

## I) Gaps & Blockers

| ID | Beschreibung | Betroffene REQ | Fehlende Info |
|----|-------------|----------------|---------------|
| GAP-003-1 | `forbidNonWhitelisted: false` ist implizit (kein Fehler bei Extra-Feldern) — falls dies geändert wird (auf `true`), würden TC-003-001 und TC-003-002 brechen | REQ-003 | Kein explizites Requirement dokumentiert ob Extra-Felder einen Fehler erzeugen sollen |
| GAP-003-2 | `transform: true` Verhalten bei ungültigen Typen (z.B. `?days=abc`) nicht getestet — NestJS kann 400 werfen oder NaN durchlassen | REQ-003 | Verhalten bei nicht-transformierbaren Werten nicht spezifiziert |

---

## J) Decision Needed

| ID | Entscheidung | Betroffene REQ |
|----|-------------|----------------|
| DEC-003-1 | Sollen Extra-Felder im Body einen **400-Fehler** erzeugen (`forbidNonWhitelisted: true`) oder **still entfernt** werden (`whitelist: true` ohne `forbidNonWhitelisted`)? Aktuell: silent-strip. | REQ-003 |
| DEC-003-2 | Was passiert bei `?days=abc` (nicht-numerischer Wert für `@IsInt`-Feld)? Soll 400 zurückgegeben werden oder Default-Wert verwendet? | REQ-003 |
