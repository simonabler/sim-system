/**
 * REQ-001 — Globaler API-Prefix
 *
 * Spec:   test-req/REQ-001-global-api-prefix.md
 * Source: apps/server/src/main.ts — app.setGlobalPrefix('api/v1')
 *
 * Voraussetzungen:
 *   - Server läuft auf PORT (default 3000, für dieses Projekt: 9000)
 *   - DB muss erreichbar sein (leere DB ist erlaubt)
 *   - Starten: PORT=9000 npx nx e2e server-e2e
 *
 * ACHTUNG: Alle Requests verwenden `validateStatus: () => true` damit
 * axios bei 4xx/5xx nicht wirft und wir den Status direkt prüfen können.
 */

import axios from 'axios';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Axios-Request der niemals wirft — gibt immer die Response zurück. */
async function request(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
) {
  return axios.request({
    method,
    url,
    data,
    validateStatus: () => true, // niemals Ausnahme auf 4xx/5xx
  });
}

// ---------------------------------------------------------------------------
// REQ-001 — Globaler API-Prefix
// ---------------------------------------------------------------------------

describe('REQ-001 — Globaler API-Prefix', () => {
  // -------------------------------------------------------------------------
  // TC-001-001: Korrekter Prefix → Endpunkt erreichbar
  // -------------------------------------------------------------------------
  describe('TC-001-001: GET /api/v1/articles — korrekter Prefix', () => {
    it('gibt HTTP 200 zurück', async () => {
      const res = await request('get', '/api/v1/articles');
      expect(res.status).toBe(200);
    });

    it('Body enthält success: true', async () => {
      const res = await request('get', '/api/v1/articles');
      expect(res.data).toHaveProperty('success', true);
    });

    it('Body enthält Feld data als Array', async () => {
      const res = await request('get', '/api/v1/articles');
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // TC-001-002: Kein Prefix → 404
  // -------------------------------------------------------------------------
  describe('TC-001-002: GET /articles — kein Prefix', () => {
    it('gibt HTTP 404 zurück (Route nicht registriert)', async () => {
      const res = await request('get', '/articles');
      expect(res.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // TC-001-003: Falscher Prefix /api/articles — ohne Version
  // -------------------------------------------------------------------------
  describe('TC-001-003: GET /api/articles — falscher Prefix (ohne Version)', () => {
    it('gibt HTTP 404 zurück', async () => {
      const res = await request('get', '/api/articles');
      expect(res.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // TC-001-004: Falscher Prefix /v1/articles — ohne api/
  // -------------------------------------------------------------------------
  describe('TC-001-004: GET /v1/articles — falscher Prefix (ohne api/)', () => {
    it('gibt HTTP 404 zurück', async () => {
      const res = await request('get', '/v1/articles');
      expect(res.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // TC-001-005: Falscher Prefix /api/v2/articles — falsche Version
  // -------------------------------------------------------------------------
  describe('TC-001-005: GET /api/v2/articles — falsche Versionsnummer', () => {
    it('gibt HTTP 404 zurück (keine zweite API-Version registriert)', async () => {
      const res = await request('get', '/api/v2/articles');
      expect(res.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // TC-001-006: POST unter korrektem Prefix — routing-seitig erreichbar
  // Leerer Body erzeugt 400 (Validation) — das bestätigt, dass Routing OK ist.
  // HTTP 404 wäre ein Routing-Fehler und würde den Test failen lassen.
  // -------------------------------------------------------------------------
  describe('TC-001-006: POST /api/v1/customers — Routing funktioniert für POST', () => {
    it('gibt NICHT HTTP 404 zurück (Routing ist korrekt)', async () => {
      const res = await request('post', '/api/v1/customers', {});
      expect(res.status).not.toBe(404);
    });

    it('gibt HTTP 400 zurück (Validation schlägt an, nicht Routing)', async () => {
      const res = await request('post', '/api/v1/customers', {});
      // ValidationPipe wirft 400 bei fehlendem Pflichtfeld customerNumber
      // Wenn dieser Test fehlschlägt (z.B. 201), ist Validierung deaktiviert → Potential Defect
      expect(res.status).toBe(400);
    });
  });
});
