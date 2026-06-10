# REQ-002 — Response-Wrapper (ReS / ReE)

**Datum:** 2026-03-17 · **Branch:** first-init
**Eltern-Dokument:** `test-req/backend-requirements.md`
**Framework:** Framework-agnostisch (UNBELEGT) — Given/When/Then

---

## Requirement

| Feld | Wert |
|------|------|
| **ID** | REQ-002 |
| **Titel** | Response-Wrapper ReS / ReE |
| **Beschreibung** | Erfolgreiche Antworten haben exakt die Struktur `{ success: true, data: T }`. Fehlerantworten haben exakt die Struktur `{ success: false, statusCode: number, error: string, message: string[] }`. |
| **Quelle** | `apps/server/src/common/res.model.ts` |
| **Evidenz** | Klassen `ReS<T>` (Zeilen 10–20) und `ReE` (Zeilen 22–40); `ReturnHelper` als Basis mit `success = true` (Zeile 7) |
| **Priorität** | High |
| **Status** | CONFIRMED |

### Exakte Struktur aus Code

**ReS (Success):**
```
{
  success: true,        // boolean, immer true (ReturnHelper, Zeile 7)
  data: T               // generischer Payload (ReS, Zeile 19)
}
```

**ReE (Error):**
```
{
  success: false,       // boolean, immer false (FromData setzt ret.success = false, Zeile 25)
  statusCode: number,   // HTTP-Statuscode (Zeile 33)
  message: string[],    // Array von Fehlermeldungen (Zeile 37)
  error: string         // Fehlerbezeichnung (Zeile 39)
}
```

---

## E) Testdimensionen

| Dimension | Werte | Belegt durch |
|-----------|-------|--------------|
| **Response-Typ** | Success (ReS) / Error (ReE) | `res.model.ts` — zwei separate Klassen |
| **data-Feldtypen** | Array (z.B. `Article[]`) / Einzelobjekt (z.B. `Article`) / `null` (z.B. nach DELETE) | Controller-Rückgaben |
| **message-Feld** | Array mit einem Element / Array mit mehreren Elementen | `errors.filter.ts` Zeilen 25–27 |
| **statusCode-Werte** | 200, 201, 400, 404, 500 (HTTP-Standard) | `errors.filter.ts` Zeile 16–19 |
| **Fehlerquelle** | HttpException (NestJS-kontrolliert) / Unerwarteter Fehler (non-HttpException) | `errors.filter.ts` `@Catch()` — fängt alles |

**Nicht belegbare Dimensionen:** Locale, Content-Type-Varianten (kein explizites Content-Type-Handling dokumentiert)

---

## F) Testmatrix

| REQ-ID | Feature/Komponente | Szenario | Testtyp | Prio | +/- | Datenvarianten | Erwartetes Ergebnis | Auto | Notes |
|--------|-------------------|----------|---------|------|-----|---------------|---------------------|------|-------|
| REQ-002 | ReS Wrapper | Erfolgreicher GET gibt `success: true` zurück | API | High | + | `GET /api/v1/articles` | `{ success: true, data: [...] }` | Yes | |
| REQ-002 | ReS Wrapper | `data` enthält den Nutzdaten-Payload (kein Null bei Erfolg mit Daten) | API | High | + | `GET /api/v1/articles` mit 2 Artikeln in DB | `data.length === 2` | Yes | |
| REQ-002 | ReS Wrapper | `data` ist `null` nach erfolgreichem DELETE | API | High | + | `DELETE /api/v1/articles/:id` | `{ success: true, data: null }` | Yes | Evidenz: Controller gibt `ReS.FromData(null)` |
| REQ-002 | ReS Wrapper | Response enthält KEIN Feld `statusCode` bei Erfolg | API | Med | + | Beliebiger 200-Request | Kein `statusCode` im Body | Yes | ReS-Klasse hat kein statusCode-Feld |
| REQ-002 | ReS Wrapper | Response enthält KEIN Feld `error` bei Erfolg | API | Med | + | Beliebiger 200-Request | Kein `error` im Body | Yes | ReS-Klasse hat kein error-Feld |
| REQ-002 | ReE Wrapper | Fehlerhafte Response hat `success: false` | API | High | - | `GET /api/v1/articles/99999` (404) | `{ success: false, ... }` | Yes | |
| REQ-002 | ReE Wrapper | ReE enthält `statusCode` als Zahl | API | High | - | `GET /api/v1/articles/99999` | `statusCode: 404` | Yes | |
| REQ-002 | ReE Wrapper | ReE enthält `message` als Array (nicht String) | API | High | - | `GET /api/v1/articles/99999` | `message: [string]` | Yes | `errors.filter.ts:25-27` — normalisiert zu Array |
| REQ-002 | ReE Wrapper | ReE enthält `error` als String | API | High | - | `GET /api/v1/articles/99999` | `error: "Not Found"` o.ä. | Yes | |
| REQ-002 | ReE Wrapper | Unerwarteter Fehler (non-HttpException) gibt HTTP 500 und ReE zurück | API | High | - | Endpoint der intern crasht | `{ success: false, statusCode: 500, ... }` | Maybe | Benötigt Mock/Test-Endpoint der Exception wirft |
| REQ-002 | ReE Wrapper | `message` bei ValidationPipe-Fehler ist Array mit Beschreibungen | API | High | - | POST ohne Pflichtfelder | `message: ["name should not be empty", ...]` | Yes | NestJS ValidationPipe produziert Array |

---

## G) Testfälle

---

### TC-002-001 — Success-Response: Grundstruktur
**REQ-ID:** REQ-002
**Titel:** Erfolgreicher GET enthält `success: true` und `data`
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; DB mit mindestens 1 Artikel

**Given** das Backend ist gestartet
**And** mindestens 1 Artikel ist in der DB vorhanden
**When** `GET /api/v1/articles`
**Then**
- HTTP Status ist `200`
- Body ist gültiges JSON
- Body enthält Feld `success` mit Wert `true` (boolean)
- Body enthält Feld `data` (Array)
- Body enthält KEIN Feld `statusCode`
- Body enthält KEIN Feld `error`

**Testdaten:** Standard-Artikel-Datensatz
**Orakel:** `res.model.ts` — `ReS.FromData()` setzt `success = true`, `data = arg0`
**Automatisierung:** Yes

---

### TC-002-002 — Success-Response: data ist null nach DELETE
**REQ-ID:** REQ-002
**Titel:** DELETE gibt `{ success: true, data: null }` zurück
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; Artikel mit id=1 existiert in DB

**Given** Artikel mit id=1 existiert
**When** `DELETE /api/v1/articles/1`
**Then**
- HTTP Status ist `200`
- Body: `{ "success": true, "data": null }`

**Testdaten:** id=1 (existierender Artikel)
**Orakel:** Controller-Code: `return ReS.FromData(null)` nach erfolgreichem Delete
**Automatisierung:** Yes

---

### TC-002-003 — Error-Response: 404 Grundstruktur
**REQ-ID:** REQ-002
**Titel:** Nicht-existente Ressource gibt korrekte ReE-Struktur zurück
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; kein Artikel mit id=99999

**Given** kein Artikel mit id=99999 existiert
**When** `GET /api/v1/articles/99999`
**Then**
- HTTP Status ist `404`
- Body enthält Feld `success` mit Wert `false` (boolean)
- Body enthält Feld `statusCode` mit Wert `404` (number)
- Body enthält Feld `message` als Array (z.B. `["Not Found"]`)
- Body enthält Feld `error` als String
- Body enthält KEIN Feld `data`

**Testdaten:** id=99999 (nicht-existent)
**Orakel:** `errors.filter.ts` — `ReE.FromData(statusCode, name, message)`
**Automatisierung:** Yes

---

### TC-002-004 — Error-Response: message ist immer Array
**REQ-ID:** REQ-002
**Titel:** `message`-Feld in ReE ist immer ein Array, nie ein String
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** ein Request erzeugt einen Fehler (z.B. 404)
**When** `GET /api/v1/articles/99999`
**Then**
- `body.message` ist ein Array (`Array.isArray(body.message) === true`)
- Kein einzelner String (nicht `body.message === "Not Found"`)

**Testdaten:** id=99999
**Orakel:** `errors.filter.ts` Zeilen 25–27 — `message = Array.isArray(errorMessage) ? errorMessage : [errorMessage]`
**Automatisierung:** Yes

---

### TC-002-005 — Error-Response: ValidationPipe erzeugt message-Array
**REQ-ID:** REQ-002
**Titel:** POST ohne Pflichtfelder gibt ReE mit Array-Fehlermeldungen zurück
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `POST /api/v1/articles` mit leerem Body `{}`
**Then**
- HTTP Status ist `400`
- `body.success === false`
- `body.message` ist ein Array mit mindestens 1 Element
- Jedes Element in `body.message` ist ein String

**Testdaten:** `{}` (leerer Body)
**Orakel:** REQ-002 + REQ-003; NestJS ValidationPipe produziert Array von Constraint-Messages
**Automatisierung:** Yes

---

### TC-002-006 — Error-Response: unerwarteter Fehler gibt HTTP 500
**REQ-ID:** REQ-002
**Titel:** Non-HttpException wird zu HTTP 500 ReE
**Typ:** Unit / API
**Status:** READY

**Setup:** Mock oder Test-Endpoint der einen `new Error("Unexpected failure")` wirft

**Given** ein Endpunkt wirft eine unerwartete (non-HttpException) Exception
**When** der Endpunkt aufgerufen wird
**Then**
- HTTP Status ist `500`
- `body.success === false`
- `body.statusCode === 500`
- `body.message` ist ein Array mit `["Unexpected failure"]`
- `body.error` entspricht dem Error-Namen (z.B. `"Error"`)

**Testdaten:** Custom Error: `new Error("Unexpected failure")`
**Orakel:** `errors.filter.ts` Zeilen 16–19 — non-HttpException → `HttpStatus.INTERNAL_SERVER_ERROR`
**Automatisierung:** Maybe (benötigt kontrollierten Crash-Endpunkt oder Unit-Test des Filters)

---

### TC-002-007 — ReS: kein Cross-Kontamination mit ReE-Feldern
**REQ-ID:** REQ-002
**Titel:** Success-Response enthält keine Error-spezifischen Felder
**Typ:** API
**Status:** READY

**Setup:** Backend läuft, Artikel in DB

**Given** ein Request ist erfolgreich
**When** `GET /api/v1/articles`
**Then**
- `body.statusCode` ist `undefined`
- `body.error` ist `undefined`
- `body.message` ist `undefined`

**Orakel:** `res.model.ts` — `ReS` hat nur `success` und `data`; kein `statusCode`, `error`, `message`
**Automatisierung:** Yes

---

## H) Coverage Summary

| Metrik | Wert |
|--------|------|
| Requirements in dieser Datei | 1 (REQ-002) |
| Testfälle gesamt | 7 (TC-002-001 bis TC-002-007) |
| Abgedeckte Szenarien | ReS-Struktur, data=null, ReE-Struktur, message-Array-Typ, ValidationPipe, 500-Fehler, keine Kreuz-Kontamination |
| READY | 6 |
| BLOCKED | 0 |
| Maybe (Infrastruktur) | 1 (TC-002-006) |

---

## I) Gaps & Blockers

| ID | Beschreibung | Betroffene REQ | Fehlende Info |
|----|-------------|----------------|---------------|
| GAP-002-1 | TC-002-006 (500-Fehler) benötigt einen kontrollierten Crash-Endpunkt oder Unit-Test des ErrorFilter-Catch direkt | REQ-002 | Test-Infrastruktur: Entweder Unit-Test von ErrorFilter oder spezieller Test-Endpunkt |
| GAP-002-2 | Content-Type des Response nicht explizit geprüft — NestJS sendet standardmäßig `application/json`, aber kein expliziter Test | REQ-002 | Kein explizites Requirement für Content-Type dokumentiert |

---

## J) Decision Needed

| ID | Entscheidung | Betroffene REQ |
|----|-------------|----------------|
| DEC-002-1 | Soll `ReS` auch einen `statusCode` im Body enthalten (z.B. 201 bei POST)? Aktuell kein `statusCode` in `ReS`. Frontend muss auf HTTP-Status-Header angewiesen sein. | REQ-002 |
| DEC-002-2 | Bei unerwarteten Fehlern (500): Soll die interne Fehlermeldung (`error.message`) an den Client gesendet werden? Aktuell: ja (`message = [error.message]`). Das kann interne Details leaken. | REQ-002 |
