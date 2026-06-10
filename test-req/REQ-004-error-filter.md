# REQ-004 — Global ErrorFilter

**Datum:** 2026-03-17 · **Branch:** first-init
**Eltern-Dokument:** `test-req/backend-requirements.md`
**Framework:** Framework-agnostisch (UNBELEGT) — Given/When/Then

---

## Requirement

| Feld | Wert |
|------|------|
| **ID** | REQ-004 |
| **Titel** | Global ErrorFilter |
| **Beschreibung** | Alle nicht behandelten Exceptions werden durch `ErrorFilter` abgefangen und im `ReE`-Format zurückgegeben. (1) `HttpException`-Subklassen: HTTP-Status aus `error.getStatus()`; Message aus `error.getResponse().message`; Name aus `error.getResponse().error \|\| error.name`. (2) Non-`HttpException`-Fehler: HTTP 500; Message aus `[error.message]`; Name aus `error.name`. |
| **Quelle** | `apps/server/src/main.ts` Zeile 21; `apps/server/src/common/filters/errors.filter.ts` |
| **Evidenz** | `app.useGlobalFilters(new ErrorFilter())`; `@Catch()` (fängt ALLE Exceptions); Statuscode-Logik Zeilen 16–19; Message-Normalisierung Zeilen 22–27 |
| **Priorität** | High |
| **Status** | CONFIRMED |

### Exakte Logik aus Code (`errors.filter.ts`)

```typescript
// Zeilen 16–19: HTTP-Statuscode-Bestimmung
const statusCode: number =
  error instanceof HttpException
    ? error.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;   // 500 für alle non-HttpException

// Zeilen 22–27: Message-Normalisierung
if (error instanceof HttpException) {
  const errorMessage = (error.getResponse() as any)?.message;
  message = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
} else {
  message = [error.message];             // Non-HttpException: einzel-element Array
}

// Zeilen 30–33: Error-Name
const name = error instanceof HttpException
  ? (error.getResponse() as any)?.error || error.name
  : error.name;

// Zeile 35: Finale Response
response.status(statusCode).json(ReE.FromData(statusCode, name, message));
```

**Wichtig:** `@Catch()` ohne Argument fängt **alle** Exceptions — inklusive TypeError, RangeError, DB-Fehler usw.

---

## E) Testdimensionen

| Dimension | Werte | Belegt durch |
|-----------|-------|--------------|
| **Exception-Typ** | `HttpException`-Subklasse (NotFoundException, BadRequestException, UnprocessableEntityException, ...) / Non-HttpException (Error, TypeError, DB-Error) | `errors.filter.ts` Zeile 17 |
| **HTTP-Status** | 400 (Bad Request) / 404 (Not Found) / 422 (Unprocessable Entity) / 500 (Internal Server Error) | `HttpStatus.*` aus NestJS; Filter-Logik |
| **message-Format** | Single-String → Array-wrap / Bereits Array → passthrough | `errors.filter.ts` Zeilen 24–26 |
| **error-Name** | Aus `getResponse().error` / Aus `error.name` als Fallback / Aus `error.name` bei non-HttpException | `errors.filter.ts` Zeilen 30–33 |
| **console.error** | Fehler wird geloggt | `errors.filter.ts` Zeile 22 |

**Nicht belegbare Dimensionen:** Retry-Logik, Rate-Limiting, Logging-Targets (nur `console.error`)

---

## F) Testmatrix

| REQ-ID | Feature/Komponente | Szenario | Testtyp | Prio | +/- | Datenvarianten | Erwartetes Ergebnis | Auto | Notes |
|--------|-------------------|----------|---------|------|-----|---------------|---------------------|------|-------|
| REQ-004 | ErrorFilter — HttpException | `NotFoundException` (404) wird zu ReE mit statusCode=404 | API/Unit | High | - | `GET /api/v1/articles/99999` | `{ success:false, statusCode:404, error:string, message:[string] }` | Yes | Standard-Fehlerfall |
| REQ-004 | ErrorFilter — HttpException | `BadRequestException` (400) wird zu ReE mit statusCode=400 | API/Unit | High | - | POST ohne Pflichtfeld | `{ success:false, statusCode:400, ... }` | Yes | |
| REQ-004 | ErrorFilter — HttpException | `UnprocessableEntityException` (422) wird zu ReE mit statusCode=422 | Unit | Med | - | Service wirft 422 | `statusCode: 422` | Yes | |
| REQ-004 | ErrorFilter — HttpException | message ist Array wenn HttpException.getResponse().message bereits Array | Unit | High | - | ValidationPipe-Fehler mit mehreren Messages | `message: string[]` mit >1 Element | Yes | Evidenz: Zeile 25 `Array.isArray() ? passthrough` |
| REQ-004 | ErrorFilter — HttpException | message wird zu Array gewrappt wenn es ein String ist | Unit | High | - | HttpException mit String-Message | `message: ["single message"]` (Array!) | Yes | Evidenz: Zeile 26 `: [errorMessage]` |
| REQ-004 | ErrorFilter — non-HttpException | Nicht-HttpException wird zu HTTP 500 | Unit | High | - | `new Error("crash")` | `statusCode: 500` | Maybe | Benötigt kontrollierten Crash |
| REQ-004 | ErrorFilter — non-HttpException | message bei non-HttpException ist `[error.message]` | Unit | High | - | `new Error("DB connection lost")` | `message: ["DB connection lost"]` | Maybe | |
| REQ-004 | ErrorFilter — non-HttpException | error-Name bei non-HttpException ist `error.name` | Unit | Med | - | `new TypeError("x")` | `error: "TypeError"` | Maybe | |
| REQ-004 | ErrorFilter — Response-Format | Alle Fehler-Responses haben exakt die ReE-Struktur | API | High | - | Verschiedene Fehler | `{ success, statusCode, error, message }` — kein anderes Format | Yes | Integration zwischen ErrorFilter und ReE |
| REQ-004 | ErrorFilter — Scope | Global registriert — gilt für ALLE Controller | API | High | + | Fehler in verschiedenen Controllern | Immer ReE-Format | Yes | `app.useGlobalFilters(new ErrorFilter())` |

---

## G) Testfälle

---

### TC-004-001 — HttpException: NotFoundException → ReE 404
**REQ-ID:** REQ-004
**Titel:** NotFoundException wird zu vollständiger ReE-Response mit statusCode=404
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; kein Artikel mit id=99999

**Given** kein Artikel mit id=99999 existiert
**When** `GET /api/v1/articles/99999`
**Then**
- HTTP-Status-Header: `404`
- `body.success === false`
- `body.statusCode === 404`
- `body.error` ist ein String (nicht leer)
- `body.message` ist ein Array
- `body.message.length >= 1`
- Body enthält KEIN Feld `data`

**Testdaten:** id=99999 (nicht-existent)
**Orakel:** REQ-004; `errors.filter.ts` Zeilen 17–18; `ReE.FromData()`
**Automatisierung:** Yes

---

### TC-004-002 — HttpException: BadRequestException → ReE 400
**REQ-ID:** REQ-004
**Titel:** ValidationPipe-Fehler (400) wird korrekt zu ReE
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `POST /api/v1/articles` mit `{}`
**Then**
- HTTP-Status-Header: `400`
- `body.success === false`
- `body.statusCode === 400`
- `body.message` ist ein Array mit mindestens 1 Element

**Testdaten:** `{}`
**Orakel:** REQ-004; REQ-003; ValidationPipe wirft `BadRequestException`; ErrorFilter fängt sie ab
**Automatisierung:** Yes

---

### TC-004-003 — message als Array (passthrough, wenn bereits Array)
**REQ-ID:** REQ-004
**Titel:** Wenn NestJS eine Array-Message liefert, bleibt sie Array
**Typ:** Unit
**Status:** READY

**Setup:** Unit-Test des `ErrorFilter.catch()`

**Given** ein `BadRequestException` mit `message: ["field1 error", "field2 error"]` wird geworfen
**When** `ErrorFilter.catch(error, host)` aufgerufen wird
**Then**
- `response.message` ist `["field1 error", "field2 error"]`
- `response.message` wurde **nicht** erneut in ein Array verpackt: nicht `[["field1 error", "field2 error"]]`

**Testdaten:** `new BadRequestException({ message: ["field1 error", "field2 error"], error: "Bad Request" })`
**Orakel:** `errors.filter.ts` Zeile 25: `Array.isArray(errorMessage) ? errorMessage : [errorMessage]`
**Automatisierung:** Yes

---

### TC-004-004 — message als String → wird zu Array gewrappt
**REQ-ID:** REQ-004
**Titel:** String-Message in HttpException wird zu einelementigem Array
**Typ:** Unit
**Status:** READY

**Setup:** Unit-Test des `ErrorFilter.catch()`

**Given** ein `BadRequestException` mit `message: "single error message"` (String) wird geworfen
**When** `ErrorFilter.catch(error, host)` aufgerufen wird
**Then**
- `response.message` ist `["single error message"]` (Array mit einem Element)
- `response.message` ist NICHT `"single error message"` (kein String)

**Testdaten:** `new BadRequestException("single error message")`
**Orakel:** `errors.filter.ts` Zeile 26: `: [errorMessage]` — String wird zu Array
**Automatisierung:** Yes

---

### TC-004-005 — Non-HttpException → HTTP 500
**REQ-ID:** REQ-004
**Titel:** Nicht-HttpException erzeugt HTTP 500
**Typ:** Unit
**Status:** READY

**Setup:** Unit-Test des `ErrorFilter.catch()`; Mock-Response-Objekt

**Given** ein nicht-HttpException-Fehler `new Error("DB connection lost")` tritt auf
**When** `ErrorFilter.catch(error, host)` aufgerufen wird
**Then**
- `response.status` wird mit `500` aufgerufen
- `body.success === false`
- `body.statusCode === 500`
- `body.message === ["DB connection lost"]`
- `body.error === "Error"`

**Testdaten:** `new Error("DB connection lost")`
**Orakel:** `errors.filter.ts` Zeile 19: `HttpStatus.INTERNAL_SERVER_ERROR`; Zeile 27: `message = [error.message]`; Zeile 33: `error.name`
**Automatisierung:** Yes (Unit-Test mit gemocktem `host` und `response`)

---

### TC-004-006 — Non-HttpException: TypeError → korrekter error-Name
**REQ-ID:** REQ-004
**Titel:** TypeError erzeugt `error: "TypeError"` im ReE
**Typ:** Unit
**Status:** READY

**Setup:** Unit-Test des `ErrorFilter.catch()`

**Given** ein `new TypeError("Cannot read property of undefined")` tritt auf
**When** `ErrorFilter.catch(error, host)` aufgerufen wird
**Then**
- `body.error === "TypeError"`
- `body.statusCode === 500`

**Testdaten:** `new TypeError("Cannot read property of undefined")`
**Orakel:** `errors.filter.ts` Zeile 33: `error.name` → `"TypeError"` für TypeError-Instanzen
**Automatisierung:** Yes (Unit)

---

### TC-004-007 — Globaler Scope: ErrorFilter gilt für alle Controller
**REQ-ID:** REQ-004
**Titel:** ReE-Format wird auch von CustomerController zurückgegeben
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; kein Customer mit id=99999

**Given** kein Customer mit id=99999 existiert
**When** `GET /api/v1/customers/99999`
**Then**
- HTTP Status ist `404`
- `body.success === false`
- `body.statusCode === 404`

**Testdaten:** id=99999
**Orakel:** REQ-004 — Global registriert via `app.useGlobalFilters()`
**Automatisierung:** Yes

---

## H) Coverage Summary

| Metrik | Wert |
|--------|------|
| Requirements in dieser Datei | 1 (REQ-004) |
| Testfälle gesamt | 7 (TC-004-001 bis TC-004-007) |
| Abgedeckte Szenarien | 404, 400, message-Array-passthrough, message-String-wrap, 500, TypeError-Name, globaler Scope |
| READY | 7 |
| BLOCKED | 0 |
| Unit-Tests (Filter direkt) | 4 (TC-004-003 bis TC-004-006) |
| API-Tests (Endpunkt-Level) | 3 (TC-004-001, TC-004-002, TC-004-007) |

**Nicht abgedeckt (begründet):**
- 422 UnprocessableEntity: in Matrix als Med markiert; kein dedizierter TC (Verhalten analog zu 400/404)
- console.error-Logging: Nicht als funktionaler Test modellierbar ohne Log-Interception-Infrastruktur

---

## I) Gaps & Blockers

| ID | Beschreibung | Betroffene REQ | Fehlende Info |
|----|-------------|----------------|---------------|
| GAP-004-1 | Unit-Tests für ErrorFilter (TC-004-003 bis TC-004-006) benötigen einen gemockten `ArgumentsHost` mit `switchToHttp()` / `getResponse()` / `getRequest()` | REQ-004 | Test-Framework + Mock-Infrastruktur erforderlich |
| GAP-004-2 | DB-spezifische Fehler (z.B. UNIQUE-Constraint-Verletzung von TypeORM) werden als non-HttpException behandelt → HTTP 500 statt 409. Ist das gewollt? | REQ-004 | Kein spezifischer Handler für DB-Fehler dokumentiert → siehe UQ-001 aus Eltern-Dokument |

---

## J) Decision Needed

| ID | Entscheidung | Betroffene REQ |
|----|-------------|----------------|
| DEC-004-1 | Sollen DB-Constraint-Fehler (TypeORM QueryFailedError bei UNIQUE-Verletzung) einen spezifischen HTTP-Status bekommen (z.B. 409 Conflict) statt generisch HTTP 500? Aktuell: 500 (non-HttpException). | REQ-004 |
| DEC-004-2 | Soll die interne Fehlermeldung (`error.message`) bei HTTP 500 an den Client gesendet werden? Aktuell: ja. Das kann Implementierungsdetails leaken (z.B. SQL-Fehlertext). | REQ-004 |
| DEC-004-3 | Soll `console.error` durch ein strukturiertes Logging-System (z.B. NestJS Logger) ersetzt werden? Aktuell ist nur `console.error` im Filter vorhanden. | REQ-004 |
