# REQ-005 — CORS Herkunftsbeschränkung

**Datum:** 2026-03-17 · **Branch:** first-init
**Eltern-Dokument:** `test-req/backend-requirements.md`
**Framework:** Framework-agnostisch (UNBELEGT) — Given/When/Then

---

## Requirement

| Feld | Wert |
|------|------|
| **ID** | REQ-005 |
| **Titel** | CORS — Herkunftsbeschränkung |
| **Beschreibung** | CORS erlaubt Anfragen von Ursprüngen, die in der Umgebungsvariable `CORS_ORIGIN` konfiguriert sind (kommagetrennte Liste). Wenn `CORS_ORIGIN` nicht gesetzt ist, wird `http://localhost:4200` als Default-Ursprung verwendet. Credentials (Cookies, Authorization-Header) sind erlaubt. Erlaubte HTTP-Methoden: GET, POST, PUT, PATCH, DELETE, OPTIONS. |
| **Quelle** | `apps/server/src/main.ts` Zeilen 14–18 |
| **Evidenz** | `app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:4200'], methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], credentials: true })` |
| **Priorität** | Med |
| **Status** | INFERIERT (Verhalten aus Code ableitbar; kein explizites Requirement-Dokument) |

### Exakte Konfiguration aus Code (`main.ts`, Zeilen 14–18)

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

**Analyse:**
- `CORS_ORIGIN` kann mehrere Ursprünge enthalten, getrennt durch `,` (komma) → `split(',')` → Array
- Wenn `CORS_ORIGIN` undefined oder leer: `??` Operator → Default `['http://localhost:4200']`
- `credentials: true` → `Access-Control-Allow-Credentials: true` im Response-Header
- `methods` → nur diese Methoden in Preflight-Response erlaubt

---

## E) Testdimensionen

| Dimension | Werte | Belegt durch |
|-----------|-------|--------------|
| **Origin-Varianten** | Erlaubter Ursprung (`http://localhost:4200`) / Nicht-erlaubter Ursprung (`http://evil.com`) / Mehrere Ursprünge via ENV | `main.ts` Zeile 15 |
| **ENV-Konfiguration** | `CORS_ORIGIN` nicht gesetzt (Default) / `CORS_ORIGIN` mit einem Wert / `CORS_ORIGIN` mit mehreren kommagetennten Werten | `process.env.CORS_ORIGIN?.split(',')` |
| **HTTP-Methoden** | GET, POST, PUT, PATCH, DELETE, OPTIONS (alle erlaubt) / Nicht deklarierte Methode (z.B. HEAD) | `methods`-Array |
| **Credentials** | Mit `credentials: true` / Ohne Credentials-Header | `credentials: true` |
| **Preflight** | OPTIONS-Preflight-Request / Direkter Request ohne Preflight | CORS-Standard; `OPTIONS` in `methods` |

**Nicht belegbare Dimensionen:** Whitelisting auf IP-Ebene, Rate-Limiting, geografische Einschränkungen

---

## F) Testmatrix

| REQ-ID | Feature/Komponente | Szenario | Testtyp | Prio | +/- | Datenvarianten | Erwartetes Ergebnis | Auto | Notes |
|--------|-------------------|----------|---------|------|-----|---------------|---------------------|------|-------|
| REQ-005 | CORS Default-Origin | Request von `http://localhost:4200` bekommt CORS-Header | API | High | + | `Origin: http://localhost:4200` | Response enthält `Access-Control-Allow-Origin: http://localhost:4200` | Yes | Default-Konfiguration ohne ENV |
| REQ-005 | CORS Default-Origin | Request ohne `Origin`-Header funktioniert | API | Med | + | Kein `Origin`-Header | HTTP 200 (CORS gilt nur für Cross-Origin-Requests) | Yes | INFERIERT: Requests ohne Origin sind keine Cross-Origin-Requests |
| REQ-005 | CORS Credentials | Response enthält `Access-Control-Allow-Credentials: true` | API | Med | + | Request mit `Origin: http://localhost:4200` | Header `Access-Control-Allow-Credentials: true` | Yes | Evidenz: `credentials: true` |
| REQ-005 | CORS Methods | OPTIONS-Preflight für GET ist erfolgreich | API | Med | + | `OPTIONS /api/v1/articles` mit `Origin: http://localhost:4200` | HTTP 204 oder 200; `Access-Control-Allow-Methods` enthält `GET` | Yes | |
| REQ-005 | CORS Methods | OPTIONS-Preflight enthält alle erlaubten Methoden | API | Med | + | `OPTIONS` Request | `Access-Control-Allow-Methods` enthält GET, POST, PUT, PATCH, DELETE, OPTIONS | Yes | Evidenz: methods-Array in `enableCors` |
| REQ-005 | CORS Non-Allowed Origin | Request von nicht-erlaubtem Ursprung wird blockiert | API | High | - | `Origin: http://attacker.com` | KEIN `Access-Control-Allow-Origin`-Header; Browser blockiert Response | Yes | Verhalten ist browserseitig; Server-seitig: kein ACAO-Header |
| REQ-005 | CORS ENV-Konfiguration | Mehrere Ursprünge via kommagetrennte `CORS_ORIGIN` ENV | API | Med | + | `CORS_ORIGIN=http://a.com,http://b.com`; Request von `http://a.com` | ACAO-Header für `http://a.com` | BLOCKED | Benötigt ENV-Setup in Testumgebung |
| REQ-005 | CORS ENV-Konfiguration | Zweiter Ursprung aus `CORS_ORIGIN` ebenfalls erlaubt | API | Med | + | `CORS_ORIGIN=http://a.com,http://b.com`; Request von `http://b.com` | ACAO-Header für `http://b.com` | BLOCKED | Benötigt ENV-Setup |

---

## G) Testfälle

---

### TC-005-001 — Default-Origin: CORS-Header vorhanden
**REQ-ID:** REQ-005
**Titel:** Request von `http://localhost:4200` erhält `Access-Control-Allow-Origin`-Header
**Typ:** API
**Status:** READY

**Setup:** Backend läuft ohne `CORS_ORIGIN` ENV gesetzt

**Given** das Backend ist gestartet ohne `CORS_ORIGIN` Umgebungsvariable
**When** `GET /api/v1/articles` mit HTTP-Header `Origin: http://localhost:4200`
**Then**
- HTTP Status ist `200`
- Response-Header enthält `Access-Control-Allow-Origin: http://localhost:4200`

**Testdaten:** Header: `Origin: http://localhost:4200`
**Orakel:** REQ-005; `main.ts` Zeile 15: `?? ['http://localhost:4200']` — Default-Origin
**Automatisierung:** Yes

---

### TC-005-002 — Credentials-Header vorhanden
**REQ-ID:** REQ-005
**Titel:** Response enthält `Access-Control-Allow-Credentials: true`
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `GET /api/v1/articles` mit Header `Origin: http://localhost:4200`
**Then**
- Response-Header enthält `Access-Control-Allow-Credentials: true`

**Testdaten:** Header: `Origin: http://localhost:4200`
**Orakel:** REQ-005; `main.ts` Zeile 17: `credentials: true`
**Automatisierung:** Yes

---

### TC-005-003 — Preflight: OPTIONS-Request erfolgreich
**REQ-ID:** REQ-005
**Titel:** OPTIONS-Preflight wird mit CORS-Headern beantwortet
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `OPTIONS /api/v1/articles` mit Headern:
```
Origin: http://localhost:4200
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```
**Then**
- HTTP Status ist `204` oder `200` (kein 404, kein 403)
- Response-Header enthält `Access-Control-Allow-Origin: http://localhost:4200`
- Response-Header enthält `Access-Control-Allow-Methods` mit `POST` darin

**Testdaten:** Preflight-Headers wie oben
**Orakel:** REQ-005; `methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']` in `enableCors`
**Automatisierung:** Yes

---

### TC-005-004 — Preflight: Alle erlaubten Methoden im Header
**REQ-ID:** REQ-005
**Titel:** `Access-Control-Allow-Methods` enthält alle konfigurierten Methoden
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `OPTIONS /api/v1/articles` mit `Origin: http://localhost:4200`
**Then**
- `Access-Control-Allow-Methods`-Header enthält: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

**Testdaten:** OPTIONS-Request mit Origin-Header
**Orakel:** REQ-005; `main.ts` Zeile 16: `methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']`
**Automatisierung:** Yes

---

### TC-005-005 — Non-Allowed Origin: Kein CORS-Header
**REQ-ID:** REQ-005
**Titel:** Request von nicht-erlaubtem Ursprung erhält keinen `Access-Control-Allow-Origin`-Header
**Typ:** API
**Status:** READY

**Setup:** Backend läuft ohne `CORS_ORIGIN` ENV gesetzt

**Given** das Backend ist gestartet mit Default-Origin `http://localhost:4200`
**When** `GET /api/v1/articles` mit Header `Origin: http://attacker.com`
**Then**
- Response-Header enthält **KEIN** `Access-Control-Allow-Origin`-Header
  **ODER** `Access-Control-Allow-Origin` ist NICHT `http://attacker.com`

**Testdaten:** Header: `Origin: http://attacker.com`
**Orakel:** REQ-005 — Express/NestJS CORS-Middleware gibt keinen ACAO-Header bei nicht-erlaubten Ursprüngen zurück
**Automatisierung:** Yes
**Hinweis:** Der HTTP-Response-Code kann trotzdem 200 sein — CORS-Enforcement findet browserseitig statt. Der Test prüft nur das Fehlen des Headers.

---

### TC-005-006 — ENV: Mehrere Ursprünge (kommagetrennt)
**REQ-ID:** REQ-005
**Titel:** `CORS_ORIGIN=http://app1.com,http://app2.com` erlaubt beide Ursprünge
**Typ:** API
**Status:** BLOCKED

**Blocker:** Benötigt Möglichkeit, `CORS_ORIGIN` ENV-Variable in der Testumgebung zu setzen. Testinfrastruktur dafür nicht definiert.

**Setup:** Backend gestartet mit `CORS_ORIGIN=http://app1.com,http://app2.com`

**Given** das Backend ist gestartet mit `CORS_ORIGIN=http://app1.com,http://app2.com`
**When** `GET /api/v1/articles` mit `Origin: http://app1.com`
**Then** `Access-Control-Allow-Origin: http://app1.com` im Response

**And When** `GET /api/v1/articles` mit `Origin: http://app2.com`
**Then** `Access-Control-Allow-Origin: http://app2.com` im Response

**Testdaten:** ENV-Variable + Origin-Header
**Orakel:** REQ-005; `main.ts` Zeile 15: `process.env.CORS_ORIGIN?.split(',')` → Array mit 2 Elementen
**Automatisierung:** Blocked

---

### TC-005-007 — Request ohne Origin-Header
**REQ-ID:** REQ-005
**Titel:** Request ohne `Origin`-Header wird normal verarbeitet
**Typ:** API
**Status:** READY

**Setup:** Backend läuft

**Given** das Backend ist gestartet
**When** `GET /api/v1/articles` **ohne** `Origin`-Header (z.B. direkter curl-Aufruf, Server-zu-Server)
**Then**
- HTTP Status ist `200`
- Response enthält `body.success === true`

**Testdaten:** Kein `Origin`-Header
**Orakel:** INFERIERT — CORS gilt nur für Browser-Cross-Origin-Requests; Requests ohne Origin-Header sind keine Cross-Origin-Requests und werden nicht blockiert
**Automatisierung:** Yes

---

## H) Coverage Summary

| Metrik | Wert |
|--------|------|
| Requirements in dieser Datei | 1 (REQ-005) |
| Testfälle gesamt | 7 (TC-005-001 bis TC-005-007) |
| Abgedeckte Szenarien | Default-Origin CORS-Header, Credentials-Header, OPTIONS-Preflight, alle Methods, non-allowed Origin, ENV Multi-Origin, kein Origin-Header |
| READY | 6 |
| BLOCKED | 1 (TC-005-006 — ENV-Setup fehlt) |

---

## I) Gaps & Blockers

| ID | Beschreibung | Betroffene REQ | Fehlende Info |
|----|-------------|----------------|---------------|
| GAP-005-1 | TC-005-006 (Multi-Origin via ENV) ist BLOCKED — kein definierter Weg, `CORS_ORIGIN` ENV in Testumgebung zu setzen und Backend neu zu starten | REQ-005 | Test-Setup-Strategie für ENV-Variablen |
| GAP-005-2 | `CORS_ORIGIN` mit führenden/nachfolgenden Leerzeichen in der ENV (`http://a.com , http://b.com`) — `split(',')` ohne `trim()` würde `"http://b.com"` mit Leerzeichen erzeugen → Mismatch | REQ-005 | Kein `trim()` nach `split(',')` im Code — Potential Defect |
| GAP-005-3 | Kein Test für leeren `CORS_ORIGIN`-String (`CORS_ORIGIN=""`) — `"".split(',')` ergibt `[""]` (kein valider Ursprung) statt Default | REQ-005 | Nullary-Coalescing `??` prüft nur `undefined/null`, nicht leeren String |

---

## J) Decision Needed

| ID | Entscheidung | Betroffene REQ |
|----|-------------|----------------|
| DEC-005-1 | Soll `CORS_ORIGIN` ENV trim()-Unterstützung erhalten? Aktuell kein `trim()` nach `split(',')`. Leerzeichen in ENV-Werten (häufiger Config-Fehler) würden zu CORS-Mismatch führen. | REQ-005 |
| DEC-005-2 | Was ist das gewünschte Verhalten wenn `CORS_ORIGIN=""` (leerer String)? Default-Fallback oder leere Allowlist? `""` ist weder `null` noch `undefined` — `?? default` wird NICHT ausgelöst. | REQ-005 |
| DEC-005-3 | Soll CORS auch für die Swagger-Docs-Routen (`/api/v1/doc`) gelten? Aktuell: CORS wird global aktiviert, gilt also auch für Swagger. Ist das gewünscht? | REQ-005 |
