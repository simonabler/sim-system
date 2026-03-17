# REQ-001 — Globaler API-Prefix

**Datum:** 2026-03-17 · **Branch:** first-init
**Eltern-Dokument:** `test-req/backend-requirements.md`
**Framework:** Framework-agnostisch (UNBELEGT) — Given/When/Then

---

## Requirement

| Feld | Wert |
|------|------|
| **ID** | REQ-001 |
| **Titel** | Globaler API-Prefix |
| **Beschreibung** | Alle Endpunkte sind unter dem Prefix `api/v1` erreichbar. Anfragen ohne diesen Prefix werden nicht vom Backend verarbeitet. |
| **Quelle** | `apps/server/src/main.ts` Zeile 20 |
| **Evidenz** | `app.setGlobalPrefix('api/v1')` — NestJS setzt den Prefix ohne führenden Slash; Routing wird intern zu `/api/v1/...` |
| **Priorität** | High |
| **Status** | CONFIRMED |

---

## E) Testdimensionen

| Dimension | Werte | Belegt durch |
|-----------|-------|--------------|
| **Prefix-Varianten** | Mit Prefix (`/api/v1/...`) / Ohne Prefix (`/...`) / Falscher Prefix (`/api/...`, `/v1/...`, `/api/v2/...`) | `main.ts` Zeile 20 |
| **HTTP-Methoden** | GET, POST, PUT, PATCH, DELETE, OPTIONS | `main.ts` Zeile 16 — `enableCors` methods-Liste |
| **Endpunkt-Auswahl** | Beliebiger existierender Endpunkt (z.B. `articles`, `customers`) | Alle Controller |

**Keine belegbaren Dimensionen für:** Rollen, Locale, Performance-Schwellen

---

## F) Testmatrix

| REQ-ID | Feature/Komponente | Szenario | Testtyp | Prio | +/- | Datenvarianten | Erwartetes Ergebnis | Auto | Notes |
|--------|-------------------|----------|---------|------|-----|---------------|---------------------|------|-------|
| REQ-001 | Global Routing | Request mit korrektem Prefix `/api/v1/articles` wird verarbeitet | API | High | + | `GET /api/v1/articles` | HTTP 200, Body `{ success: true, data: [...] }` | Yes | Standard-Happy-Path |
| REQ-001 | Global Routing | Request ohne Prefix `/articles` wird NICHT verarbeitet | API | High | - | `GET /articles` | HTTP 404 | Yes | NestJS gibt 404 bei unbekannter Route |
| REQ-001 | Global Routing | Request mit falschem Prefix `/api/articles` (ohne Version) | API | High | - | `GET /api/articles` | HTTP 404 | Yes | Prefix muss exakt `api/v1` sein |
| REQ-001 | Global Routing | Request mit falschem Prefix `/v1/articles` (ohne `api/`) | API | High | - | `GET /v1/articles` | HTTP 404 | Yes | |
| REQ-001 | Global Routing | Request mit falschem Prefix `/api/v2/articles` (falsche Version) | API | High | - | `GET /api/v2/articles` | HTTP 404 | Yes | Keine zweite API-Version vorhanden |
| REQ-001 | Global Routing | POST-Endpunkt ebenfalls unter `/api/v1/` erreichbar | API | High | + | `POST /api/v1/customers` | HTTP 201 oder 400 (kein 404) | Yes | Alle HTTP-Methoden nutzen denselben Prefix |
| REQ-001 | Global Routing | Root ohne Prefix `GET /` gibt 404 zurück (kein ungeschützter Root) | API | Med | - | `GET /` | HTTP 404 | Yes | INFERIERT: kein Root-Handler ohne Prefix dokumentiert |

---

## G) Testfälle

---

### TC-001-001 — Korrekter Prefix: Endpunkt erreichbar
**REQ-ID:** REQ-001
**Titel:** GET /api/v1/articles wird mit HTTP 200 beantwortet
**Typ:** API
**Status:** READY

**Setup:** Backend läuft; DB enthält mindestens 0 Artikel

**Given** das Backend ist gestartet
**When** `GET /api/v1/articles` wird aufgerufen
**Then**
- HTTP Status ist `200`
- Body enthält `success: true`
- Body enthält Feld `data` (Array)

**Testdaten:** Kein spezifisches Datum nötig (leere DB erlaubt)
**Orakel:** REQ-001 — `app.setGlobalPrefix('api/v1')`, `main.ts:20`
**Automatisierung:** Yes

---

### TC-001-002 — Fehlender Prefix: Route nicht gefunden
**REQ-ID:** REQ-001
**Titel:** GET /articles (ohne Prefix) gibt HTTP 404 zurück
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `GET /articles` (ohne `/api/v1`) wird aufgerufen
**Then**
- HTTP Status ist `404`

**Testdaten:** Keine
**Orakel:** REQ-001; NestJS-Verhalten bei unregistrierter Route
**Automatisierung:** Yes

---

### TC-001-003 — Falscher Prefix: /api/articles
**REQ-ID:** REQ-001
**Titel:** GET /api/articles (ohne Version) gibt HTTP 404 zurück
**Typ:** API
**Status:** READY

**Given** das Backend ist gestartet
**When** `GET /api/articles` wird aufgerufen
**Then**
- HTTP Status ist `404`

**Orakel:** REQ-001
**Automatisierung:** Yes

---

### TC-001-004 — Falscher Prefix: /v1/articles
**REQ-ID:** REQ-001
**Titel:** GET /v1/articles (ohne api/) gibt HTTP 404 zurück
**Typ:** API
**Status:** READY

**Given** das Backend ist gestartet
**When** `GET /v1/articles` wird aufgerufen
**Then**
- HTTP Status ist `404`

**Orakel:** REQ-001
**Automatisierung:** Yes

---

### TC-001-005 — Falscher Prefix: falsche Versionsnummer
**REQ-ID:** REQ-001
**Titel:** GET /api/v2/articles gibt HTTP 404 zurück
**Typ:** API
**Status:** READY

**Given** das Backend ist gestartet
**When** `GET /api/v2/articles` wird aufgerufen
**Then**
- HTTP Status ist `404`

**Orakel:** REQ-001; kein zweiter Versionspfad registriert
**Automatisierung:** Yes

---

### TC-001-006 — POST-Endpunkt nutzt denselben Prefix
**REQ-ID:** REQ-001
**Titel:** POST /api/v1/customers ist routing-seitig erreichbar (kein 404)
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `POST /api/v1/customers` mit leerem Body `{}` aufgerufen wird
**Then**
- HTTP Status ist **NICHT** `404`
- (Erwartet: 400 wegen fehlenden Pflichtfeldern — das ist ok)
- HTTP 404 wäre ein Routing-Fehler → Testfailure

**Testdaten:** `{}` (leerer Body)
**Orakel:** REQ-001; REQ-003 (ValidationPipe gibt 400 für fehlende Felder)
**Automatisierung:** Yes

---

## H) Coverage Summary

| Metrik | Wert |
|--------|------|
| Requirements in dieser Datei | 1 (REQ-001) |
| Testfälle gesamt | 6 (TC-001-001 bis TC-001-006) |
| Abgedeckte Szenarien | Positiv-Pfad, 4 × Negativ-Prefix-Varianten, HTTP-Methoden |
| READY | 6 |
| BLOCKED | 0 |

---

## I) Gaps & Blockers

| ID | Beschreibung | Betroffene REQ | Fehlende Info |
|----|-------------|----------------|---------------|
| GAP-001-1 | Swagger-Docs unter `/api/v1/doc` — ist der Swagger-Endpoint selbst Teil des Prefix-Tests? | REQ-001 | Kein eigener TC, da Swagger als Dev-Tool gilt |
| GAP-001-2 | Kein TC für `OPTIONS /api/v1/articles` (CORS-Preflight) — überschneidet sich mit REQ-005 | REQ-001, REQ-005 | Scope-Entscheidung: wird in REQ-005 abgedeckt |

---

## J) Decision Needed

| ID | Entscheidung | Betroffene REQ |
|----|-------------|----------------|
| DEC-001-1 | Soll `GET /api/v1/` (Root mit Prefix) einen definierten Response liefern? Derzeit gibt `AppController.GET /` — ohne Prefix — "V1" zurück. Mit Prefix wäre das `/api/v1/`. Verhalten unklar. | REQ-001 |
| DEC-001-2 | Soll bei zukünftigen API-Versionen `/api/v2/` eingeführt werden? Dann müssen Routing-Tests erweitert werden. | REQ-001 |
