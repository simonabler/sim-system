/**
 * REQ-005 — CORS Herkunftsbeschränkung  [E2E]
 *
 * Spec:   test-req/REQ-005-cors.md
 * Source: apps/server/src/main.ts — app.enableCors({ origin, methods, credentials })
 *
 * Alle Tests laufen gegen den laufenden Server.
 * Voraussetzungen: PORT=9000 npx nx e2e server-e2e
 *
 * TC-Zuordnung:
 *   TC-005-001 — Default-Origin (http://localhost:4200) → ACAO-Header vorhanden
 *   TC-005-002 — credentials: true → ACAC-Header vorhanden
 *   TC-005-003 — OPTIONS-Preflight → CORS-Header + Status 204/200
 *   TC-005-004 — OPTIONS-Preflight → ACAM-Header enthält alle konfigurierten Methoden
 *   TC-005-005 — Non-Allowed Origin → KEIN ACAO-Header für http://attacker.com
 *   TC-005-006 — Multi-Origin via CORS_ORIGIN ENV → BLOCKED (ENV-Setup fehlt)
 *   TC-005-007 — Request ohne Origin-Header → HTTP 200 (kein CORS-Block)
 *
 * Hinweise:
 *   - Axios gibt Response-Header in Kleinbuchstaben zurück (Node.js HTTP-Spezifikation):
 *     z.B. 'access-control-allow-origin', nicht 'Access-Control-Allow-Origin'
 *   - CORS-Enforcement findet browserseitig statt. Der Server sendet (oder sendet nicht)
 *     die CORS-Header — der Test prüft nur das Vorhandensein/Fehlen dieser Header.
 *   - TC-005-005: Der HTTP-Status kann trotzdem 200 sein; entscheidend ist das Fehlen
 *     des ACAO-Headers für nicht-erlaubte Ursprünge.
 *
 * Potential Defects (dokumentiert in test-req/REQ-005-cors.md, GAP-005-2 + GAP-005-3):
 *   - CORS_ORIGIN mit Leerzeichen nach Komma: split(',') ohne trim() → Mismatch
 *   - CORS_ORIGIN="" (leerer String): ?? wird nicht ausgelöst → [""] statt Default
 */

import axios, { AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// Helper — wirft niemals bei 4xx/5xx, sendet Origin-Header
// ---------------------------------------------------------------------------
async function req(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options',
  url: string,
  headers?: Record<string, string>,
  data?: unknown,
): Promise<AxiosResponse> {
  return axios.request({ method, url, headers, data, validateStatus: () => true });
}

// ---------------------------------------------------------------------------
// TC-005-001 — Default-Origin: ACAO-Header vorhanden
// ---------------------------------------------------------------------------

describe('REQ-005 — TC-005-001: Default-Origin http://localhost:4200 → ACAO-Header', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    res = await req('get', '/api/v1/articles', { Origin: 'http://localhost:4200' });
  });

  it('gibt HTTP 200 zurück', () => {
    expect(res.status).toBe(200);
  });

  it('Response enthält Access-Control-Allow-Origin-Header', () => {
    // Axios liefert Header-Namen in lowercase
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('Access-Control-Allow-Origin ist http://localhost:4200', () => {
    // Evidenz: main.ts Zeile 15 — Default-Origin wenn CORS_ORIGIN nicht gesetzt
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
  });
});

// ---------------------------------------------------------------------------
// TC-005-002 — Credentials-Header: ACAC: true
// ---------------------------------------------------------------------------

describe('REQ-005 — TC-005-002: credentials:true → Access-Control-Allow-Credentials: true', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    res = await req('get', '/api/v1/articles', { Origin: 'http://localhost:4200' });
  });

  it('Response enthält Access-Control-Allow-Credentials-Header', () => {
    expect(res.headers['access-control-allow-credentials']).toBeDefined();
  });

  it('Access-Control-Allow-Credentials ist "true" (String im Header)', () => {
    // HTTP-Header sind Strings — "true" nicht boolean true
    // Evidenz: main.ts Zeile 17 — credentials: true → Express setzt den Header
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// TC-005-003 — OPTIONS-Preflight: CORS-Header + akzeptabler Status
// ---------------------------------------------------------------------------

describe('REQ-005 — TC-005-003: OPTIONS-Preflight → CORS-Header + Status 204/200', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    res = await req('options', '/api/v1/articles', {
      Origin: 'http://localhost:4200',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    });
  });

  it('gibt HTTP 204 oder 200 zurück (kein 404, kein 403)', () => {
    // NestJS/Express CORS-Middleware antwortet auf Preflight mit 204 (No Content)
    // Manchmal auch 200 — beides ist valide
    expect([200, 204]).toContain(res.status);
  });

  it('Response enthält Access-Control-Allow-Origin-Header', () => {
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
  });

  it('Response enthält Access-Control-Allow-Methods-Header', () => {
    expect(res.headers['access-control-allow-methods']).toBeDefined();
  });

  it('Access-Control-Allow-Methods enthält POST', () => {
    const methods: string = res.headers['access-control-allow-methods'] ?? '';
    expect(methods.toUpperCase()).toContain('POST');
  });
});

// ---------------------------------------------------------------------------
// TC-005-004 — OPTIONS-Preflight: Alle erlaubten Methoden im ACAM-Header
// ---------------------------------------------------------------------------

describe('REQ-005 — TC-005-004: OPTIONS-Preflight → ACAM enthält alle konfigurierten Methoden', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    res = await req('options', '/api/v1/articles', {
      Origin: 'http://localhost:4200',
      'Access-Control-Request-Method': 'GET',
    });
  });

  it('ACAM-Header ist vorhanden', () => {
    expect(res.headers['access-control-allow-methods']).toBeDefined();
  });

  // Evidenz: main.ts Zeile 16 — methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])(
    'ACAM enthält Methode: %s',
    (method) => {
      const allowed: string = res.headers['access-control-allow-methods'] ?? '';
      expect(allowed.toUpperCase()).toContain(method);
    },
  );
});

// ---------------------------------------------------------------------------
// TC-005-005 — Non-Allowed Origin: KEIN ACAO-Header
// ---------------------------------------------------------------------------

describe('REQ-005 — TC-005-005: Non-Allowed Origin → kein ACAO-Header für http://attacker.com', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    res = await req('get', '/api/v1/articles', { Origin: 'http://attacker.com' });
  });

  it(
    'Access-Control-Allow-Origin ist NICHT "http://attacker.com"' +
      ' (Browser würde Request blockieren)',
    () => {
      // Express/NestJS CORS-Middleware sendet keinen ACAO-Header wenn Origin nicht erlaubt ist.
      // Der HTTP-Status kann trotzdem 200 sein — CORS ist ein Browser-Mechanismus.
      // Entscheidend ist das Fehlen des Headers (oder ein anderer Wert als der Angreifer-Origin).
      const acao = res.headers['access-control-allow-origin'];
      expect(acao).not.toBe('http://attacker.com');
    },
  );

  it('ACAO-Header fehlt vollständig (kein wildcard, kein attacker.com)', () => {
    // Falls '*' gesetzt wäre → credentials:true + origin:'*' ist ungültig (Browser-Fehler)
    // → dieser Test würde auch bei falscher '*'-Konfiguration helfen
    const acao = res.headers['access-control-allow-origin'];
    expect(acao).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// TC-005-006 — Multi-Origin via CORS_ORIGIN ENV — BLOCKED
// ---------------------------------------------------------------------------

describe('REQ-005 — TC-005-006: Multi-Origin via CORS_ORIGIN ENV [BLOCKED]', () => {
  /**
   * BLOCKED: Dieser Test erfordert, dass der Server mit einer spezifischen
   * CORS_ORIGIN-Umgebungsvariable gestartet wurde (z.B. CORS_ORIGIN=http://app1.com,http://app2.com).
   *
   * Da die E2E-Tests gegen einen extern gestarteten Server laufen (PORT=9000),
   * kann die ENV-Variable nicht innerhalb des Tests gesetzt werden.
   *
   * Blocker: Test-Setup-Strategie für ENV-Variablen ist nicht definiert.
   * Quelle: test-req/REQ-005-cors.md — GAP-005-1
   *
   * Wenn die Infrastruktur vorhanden ist (z.B. Docker mit ENV), können folgende
   * Assertions eingesetzt werden:
   *   - GET /api/v1/articles mit Origin: http://app1.com → ACAO: http://app1.com
   *   - GET /api/v1/articles mit Origin: http://app2.com → ACAO: http://app2.com
   */
  it.todo('TC-005-006a: CORS_ORIGIN=http://app1.com,http://app2.com → app1.com erlaubt');
  it.todo('TC-005-006b: CORS_ORIGIN=http://app1.com,http://app2.com → app2.com erlaubt');
});

// ---------------------------------------------------------------------------
// TC-005-007 — Request ohne Origin-Header → HTTP 200
// ---------------------------------------------------------------------------

describe('REQ-005 — TC-005-007: Request ohne Origin-Header → HTTP 200 (kein CORS-Block)', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    // Kein Origin-Header → simuliert Server-zu-Server oder direkten curl-Aufruf
    // CORS gilt nur für Browser-Cross-Origin-Requests
    res = await req('get', '/api/v1/articles');
  });

  it('gibt HTTP 200 zurück', () => {
    expect(res.status).toBe(200);
  });

  it('success ist true', () => {
    expect(res.data.success).toBe(true);
  });

  it('Response enthält Feld data', () => {
    expect(res.data).toHaveProperty('data');
  });

  it('KEIN ACAO-Header wenn kein Origin-Header gesendet wurde', () => {
    // INFERIERT: CORS-Middleware setzt ACAO nur wenn Origin-Header vorhanden
    // Requests ohne Origin sind nicht cross-origin → kein ACAO notwendig
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
