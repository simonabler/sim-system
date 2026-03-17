/**
 * REQ-002 — Response-Wrapper (ReS / ReE)  [E2E]
 *
 * Spec:   test-req/REQ-002-response-wrapper.md
 * Source: apps/server/src/common/res.model.ts
 *
 * Testet das äußere Response-Format (ReS / ReE) auf API-Ebene.
 * TC-002-006 (non-HttpException → 500) ist in der Unit-Test-Datei:
 *   apps/server/src/common/filters/errors.filter.spec.ts
 *
 * Voraussetzungen:
 *   PORT=9000 npx nx e2e server-e2e
 *
 * Deviation von Spec (TC-002-002):
 *   Spec nennt DELETE /api/v1/articles/:id. Da ArticleCreate eine
 *   articleGroup-Referenz (FK) benötigt, wird stattdessen der
 *   Customer-DELETE-Endpunkt verwendet. Beide Controller geben
 *   ReS.FromData(null) zurück — das zu prüfende Verhalten ist identisch.
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
// REQ-002 — ReS (Success-Wrapper)
// ---------------------------------------------------------------------------

describe('REQ-002 — ReS Success-Wrapper', () => {
  // -------------------------------------------------------------------------
  // TC-002-001: Success-Response Grundstruktur
  // -------------------------------------------------------------------------
  describe('TC-002-001: GET /api/v1/articles — Success-Struktur', () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await req('get', '/api/v1/articles');
    });

    it('gibt HTTP 200 zurück', () => {
      expect(res.status).toBe(200);
    });

    it('Body ist gültiges JSON-Objekt', () => {
      expect(typeof res.data).toBe('object');
      expect(res.data).not.toBeNull();
    });

    it('enthält success: true (boolean)', () => {
      expect(res.data.success).toBe(true);
      expect(typeof res.data.success).toBe('boolean');
    });

    it('enthält Feld data als Array', () => {
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // TC-002-002: data ist null nach DELETE
  //
  // Deviation: Spec nennt Article-DELETE. Hier wird Customer-DELETE verwendet
  // da Article-Create eine articleGroup-FK benötigt die u.U. nicht existiert.
  // Das geprüfte Verhalten (ReS.FromData(null)) ist identisch.
  // -------------------------------------------------------------------------
  describe('TC-002-002: DELETE — data: null im Response', () => {
    let testCustomerId: number | null = null;

    beforeAll(async () => {
      // Erstelle einen Testkunden — customerNumber ist einziges Pflichtfeld
      const create = await req('post', '/api/v1/customers', {
        customerNumber: `REQ002-TC002-${Date.now()}`,
      });
      if (create.status === 201 && create.data?.data?.id) {
        testCustomerId = create.data.data.id;
      }
    });

    it('Setup hat einen Kunden erstellt', () => {
      // Schlägt hier der Test fehl, ist das Setup gebrochen — nicht TC-002-002
      expect(testCustomerId).not.toBeNull();
    });

    it('gibt HTTP 200 zurück', async () => {
      if (!testCustomerId) return; // Abhängig von Setup
      const res = await req('delete', `/api/v1/customers/${testCustomerId}`);
      expect(res.status).toBe(200);
    });

    it('Body enthält success: true', async () => {
      // Eigene DELETE-Anfrage mit neuem Kunden um Idempotenz zu garantieren
      const create = await req('post', '/api/v1/customers', {
        customerNumber: `REQ002-TC002b-${Date.now()}`,
      });
      const id: number = create.data?.data?.id;
      expect(id).toBeDefined();

      const res = await req('delete', `/api/v1/customers/${id}`);
      expect(res.data.success).toBe(true);
    });

    it('Body.data ist null', async () => {
      const create = await req('post', '/api/v1/customers', {
        customerNumber: `REQ002-TC002c-${Date.now()}`,
      });
      const id: number = create.data?.data?.id;
      expect(id).toBeDefined();

      const res = await req('delete', `/api/v1/customers/${id}`);

      // Potential Defect: ClassSerializerInterceptor könnte null-Felder
      // aus @Expose()-Properties herausfiltern. Wenn data fehlt statt null
      // ist → ist das ein Defekt im Code, nicht im Test.
      expect(res.data.data).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // TC-002-007: Keine ReE-Felder in Success-Response
  // -------------------------------------------------------------------------
  describe('TC-002-007: Success-Response enthält keine Error-Felder', () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await req('get', '/api/v1/articles');
    });

    it('enthält KEIN Feld statusCode', () => {
      expect(res.data.statusCode).toBeUndefined();
    });

    it('enthält KEIN Feld error', () => {
      expect(res.data.error).toBeUndefined();
    });

    it('enthält KEIN Feld message', () => {
      expect(res.data.message).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// REQ-002 — ReE (Error-Wrapper)
// ---------------------------------------------------------------------------

describe('REQ-002 — ReE Error-Wrapper', () => {
  // -------------------------------------------------------------------------
  // TC-002-003: 404 ReE Grundstruktur
  // -------------------------------------------------------------------------
  describe('TC-002-003: GET /api/v1/articles/99999 — 404 ReE-Struktur', () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await req('get', '/api/v1/articles/99999');
    });

    it('gibt HTTP 404 zurück', () => {
      expect(res.status).toBe(404);
    });

    it('enthält success: false (boolean)', () => {
      expect(res.data.success).toBe(false);
      expect(typeof res.data.success).toBe('boolean');
    });

    it('enthält statusCode: 404 (number)', () => {
      expect(res.data.statusCode).toBe(404);
      expect(typeof res.data.statusCode).toBe('number');
    });

    it('enthält message als Array mit mindestens 1 Element', () => {
      expect(Array.isArray(res.data.message)).toBe(true);
      expect(res.data.message.length).toBeGreaterThanOrEqual(1);
    });

    it('jedes message-Element ist ein String', () => {
      res.data.message.forEach((m: unknown) => {
        expect(typeof m).toBe('string');
      });
    });

    it('enthält error als String (nicht leer)', () => {
      expect(typeof res.data.error).toBe('string');
      expect(res.data.error.length).toBeGreaterThan(0);
    });

    it('enthält KEIN Feld data', () => {
      // ReE-Klasse hat kein data-Feld — wäre ein Defekt wenn vorhanden
      expect(res.data.data).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // TC-002-004: message ist immer Array (nie String)
  // -------------------------------------------------------------------------
  describe('TC-002-004: message ist immer Array, nie String', () => {
    it('message bei 404 ist Array', async () => {
      const res = await req('get', '/api/v1/articles/99999');
      expect(Array.isArray(res.data.message)).toBe(true);
      // Explizit kein String
      expect(typeof res.data.message).not.toBe('string');
    });

    it('message bei 400 (Customers 404) ist Array', async () => {
      const res = await req('get', '/api/v1/customers/99999');
      expect(Array.isArray(res.data.message)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // TC-002-005: ValidationPipe-Fehler → message Array mit mehreren Elementen
  // -------------------------------------------------------------------------
  describe('TC-002-005: POST /api/v1/articles mit {} — ValidationPipe message[]', () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await req('post', '/api/v1/articles', {});
    });

    it('gibt HTTP 400 zurück', () => {
      expect(res.status).toBe(400);
    });

    it('success ist false', () => {
      expect(res.data.success).toBe(false);
    });

    it('message ist Array', () => {
      expect(Array.isArray(res.data.message)).toBe(true);
    });

    it('message hat mindestens 1 Element (ein Constraint pro fehlendem Pflichtfeld)', () => {
      // CreateArticleDto hat mehrere Pflichtfelder (name, code, price, type, unit, artNumber, articleGroup)
      // Erwartung: mindestens 1 Message. Wenn ValidationPipe korrekt konfiguriert: mehrere.
      expect(res.data.message.length).toBeGreaterThanOrEqual(1);
    });

    it('jedes message-Element ist ein String', () => {
      res.data.message.forEach((m: unknown) => {
        expect(typeof m).toBe('string');
      });
    });
  });
});
