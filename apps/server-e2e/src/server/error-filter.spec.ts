/**
 * REQ-004 — Global ErrorFilter  [E2E]
 *
 * Spec:   test-req/REQ-004-error-filter.md
 * Source: apps/server/src/common/filters/errors.filter.ts
 *         apps/server/src/main.ts — app.useGlobalFilters(new ErrorFilter())
 *
 * Alle Tests laufen gegen den laufenden Server.
 * Voraussetzungen: PORT=9000 npx nx e2e server-e2e
 *
 * TC-Zuordnung (E2E-Ebene):
 *   TC-004-001 — NotFoundException (404) → vollständige ReE-Struktur
 *   TC-004-002 — BadRequestException (400) aus ValidationPipe → ReE
 *   TC-004-007 — Globaler Scope: ErrorFilter gilt für alle Controller (CustomerController)
 *
 * Unit-Tests (TC-004-003 bis TC-004-006) sind in:
 *   apps/server/src/common/filters/errors.filter.spec.ts
 */

import axios, { AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// Helper — wirft niemals bei 4xx/5xx
// ---------------------------------------------------------------------------
async function req(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
): Promise<AxiosResponse> {
  return axios.request({ method, url, data, validateStatus: () => true });
}

// ---------------------------------------------------------------------------
// TC-004-001 — HttpException: NotFoundException → ReE 404
// ---------------------------------------------------------------------------

describe('REQ-004 — TC-004-001: NotFoundException → ReE mit statusCode 404', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    res = await req('get', '/api/v1/articles/99999');
  });

  it('gibt HTTP 404 zurück', () => {
    expect(res.status).toBe(404);
  });

  it('success ist false (boolean)', () => {
    expect(res.data.success).toBe(false);
    expect(typeof res.data.success).toBe('boolean');
  });

  it('statusCode ist 404 (number)', () => {
    expect(res.data.statusCode).toBe(404);
    expect(typeof res.data.statusCode).toBe('number');
  });

  it('message ist ein Array', () => {
    expect(Array.isArray(res.data.message)).toBe(true);
  });

  it('message hat mindestens 1 Element', () => {
    expect(res.data.message.length).toBeGreaterThanOrEqual(1);
  });

  it('jedes message-Element ist ein String', () => {
    (res.data.message as unknown[]).forEach((m) => {
      expect(typeof m).toBe('string');
    });
  });

  it('error ist ein nicht-leerer String', () => {
    expect(typeof res.data.error).toBe('string');
    expect(res.data.error.length).toBeGreaterThan(0);
  });

  it('Body enthält KEIN Feld data (ReE hat kein data-Feld)', () => {
    // ReE.FromData() setzt nur success, statusCode, message, error
    // kein data-Feld → wäre Defekt wenn vorhanden
    expect(res.data.data).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// TC-004-002 — BadRequestException (ValidationPipe) → ReE 400
// ---------------------------------------------------------------------------

describe('REQ-004 — TC-004-002: BadRequestException (ValidationPipe) → ReE 400', () => {
  let res: AxiosResponse;

  beforeAll(async () => {
    // POST mit leerem Body → ValidationPipe wirft BadRequestException
    // ErrorFilter fängt sie ab und formatiert als ReE
    res = await req('post', '/api/v1/articles', {});
  });

  it('gibt HTTP 400 zurück', () => {
    expect(res.status).toBe(400);
  });

  it('success ist false', () => {
    expect(res.data.success).toBe(false);
  });

  it('statusCode ist 400 (number)', () => {
    expect(res.data.statusCode).toBe(400);
    expect(typeof res.data.statusCode).toBe('number');
  });

  it('message ist ein Array (ValidationPipe erzeugt Array mit einem Eintrag pro Constraint)', () => {
    expect(Array.isArray(res.data.message)).toBe(true);
    expect(res.data.message.length).toBeGreaterThanOrEqual(1);
  });

  it('jedes message-Element ist ein String (kein Array-in-Array = kein double-wrap)', () => {
    // Beweist TC-004-003: message-Array wird nicht erneut eingewickelt
    (res.data.message as unknown[]).forEach((m) => {
      expect(typeof m).toBe('string');
    });
  });

  it('error ist ein nicht-leerer String', () => {
    expect(typeof res.data.error).toBe('string');
    expect(res.data.error.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// TC-004-007 — Globaler Scope: ErrorFilter gilt für ALLE Controller
// ---------------------------------------------------------------------------

describe('REQ-004 — TC-004-007: Globaler Scope — ErrorFilter gilt für CustomerController', () => {
  // Beweis: app.useGlobalFilters(new ErrorFilter()) registriert den Filter
  // für alle Controller, nicht nur für einen spezifischen.
  // CustomerController ist ein anderer Controller als ArticleController.

  let res: AxiosResponse;

  beforeAll(async () => {
    res = await req('get', '/api/v1/customers/99999');
  });

  it('gibt HTTP 404 zurück', () => {
    expect(res.status).toBe(404);
  });

  it('success ist false — ErrorFilter greift auch im CustomerController', () => {
    expect(res.data.success).toBe(false);
  });

  it('statusCode ist 404', () => {
    expect(res.data.statusCode).toBe(404);
  });

  it('message ist ein Array', () => {
    expect(Array.isArray(res.data.message)).toBe(true);
  });

  it('error ist ein nicht-leerer String', () => {
    expect(typeof res.data.error).toBe('string');
    expect(res.data.error.length).toBeGreaterThan(0);
  });

  it('Body enthält KEIN Feld data', () => {
    expect(res.data.data).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// REQ-004 — ReE-Struktur-Vollständigkeit (alle Pflichtfelder vorhanden)
// ---------------------------------------------------------------------------

describe('REQ-004 — ReE-Vollständigkeit: alle 4 Pflichtfelder bei jedem Fehler', () => {
  // Prüft dass kein Feld aus dem ReE-Format fehlt (success, statusCode, message, error)
  // Basiert auf ReE.FromData(statusCode, name, message) aus res.model.ts

  it('404-Response hat alle 4 ReE-Felder: success, statusCode, message, error', async () => {
    const res = await req('get', '/api/v1/articles/99999');
    expect(res.data).toHaveProperty('success');
    expect(res.data).toHaveProperty('statusCode');
    expect(res.data).toHaveProperty('message');
    expect(res.data).toHaveProperty('error');
  });

  it('400-Response hat alle 4 ReE-Felder: success, statusCode, message, error', async () => {
    const res = await req('post', '/api/v1/articles', {});
    expect(res.data).toHaveProperty('success');
    expect(res.data).toHaveProperty('statusCode');
    expect(res.data).toHaveProperty('message');
    expect(res.data).toHaveProperty('error');
  });
});
