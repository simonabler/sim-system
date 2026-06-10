/**
 * REQ-002 + REQ-004 — ErrorFilter (Unit)
 *
 * Spec:   test-req/REQ-002-response-wrapper.md
 *         test-req/REQ-004-error-filter.md
 * Source: apps/server/src/common/filters/errors.filter.ts
 *
 * Testet ErrorFilter.catch() direkt mit gemocktem ArgumentsHost.
 * Dadurch ist der Test deterministisch ohne laufenden Server.
 *
 * TC-Zuordnung:
 *   TC-002-006 — Non-HttpException → HTTP 500 + ReE
 *   TC-004-003 — message-Array passthrough (kein double-wrap)
 *   TC-004-004 — message-String → einelementiges Array
 *   TC-004-005 — Non-HttpException → HTTP 500 (message + statusCode)
 *   TC-004-006 — TypeError → error: "TypeError"
 *
 * Ausführen: npx nx test server --testFile=errors.filter.spec.ts
 */

import { ArgumentsHost, BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ErrorFilter } from './errors.filter';

// ---------------------------------------------------------------------------
// Mock-Fabrik für ArgumentsHost
// ---------------------------------------------------------------------------

interface MockResponseCapture {
  statusCode: number | null;
  body: Record<string, unknown> | null;
}

function createMockHost(): { host: ArgumentsHost; capture: MockResponseCapture } {
  const capture: MockResponseCapture = { statusCode: null, body: null };

  const mockJson = jest.fn((body: Record<string, unknown>) => {
    capture.body = body;
  });

  // response.status(code) muss ein Objekt mit .json() zurückgeben
  const mockStatus = jest.fn((code: number) => {
    capture.statusCode = code;
    return { json: mockJson };
  });

  const mockHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue({ status: mockStatus }),
      getRequest: jest.fn().mockReturnValue({}),
    }),
  } as unknown as ArgumentsHost;

  return { host: mockHost, capture };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ErrorFilter', () => {
  let filter: ErrorFilter;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new ErrorFilter();
    // Unterdrücke console.error während der Tests (errors.filter.ts Zeile 22)
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // TC-002-006 / TC-004-005: Non-HttpException → HTTP 500
  // -------------------------------------------------------------------------
  describe('TC-002-006 / TC-004-005: Non-HttpException gibt HTTP 500 + ReE zurück', () => {
    it('setzt HTTP-Statuscode 500', () => {
      const { host, capture } = createMockHost();
      filter.catch(new Error('Unexpected failure'), host);
      expect(capture.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('Body: success ist false', () => {
      const { host, capture } = createMockHost();
      filter.catch(new Error('Unexpected failure'), host);
      expect(capture.body?.success).toBe(false);
    });

    it('Body: statusCode ist 500', () => {
      const { host, capture } = createMockHost();
      filter.catch(new Error('Unexpected failure'), host);
      expect(capture.body?.statusCode).toBe(500);
    });

    it('Body: message ist Array mit error.message', () => {
      const { host, capture } = createMockHost();
      filter.catch(new Error('DB connection lost'), host);
      expect(capture.body?.message).toEqual(['DB connection lost']);
    });

    it('Body: message ist Array, kein String', () => {
      const { host, capture } = createMockHost();
      filter.catch(new Error('some error'), host);
      expect(Array.isArray(capture.body?.message)).toBe(true);
    });

    it('Body: error ist error.name ("Error" für generisches Error)', () => {
      const { host, capture } = createMockHost();
      filter.catch(new Error('msg'), host);
      expect(capture.body?.error).toBe('Error');
    });

    it('TC-004-006: Body: error ist "TypeError" für TypeError-Instanz', () => {
      const { host, capture } = createMockHost();
      filter.catch(new TypeError('type mismatch'), host);
      expect(capture.body?.error).toBe('TypeError');
    });

    it('Body: error ist "RangeError" für RangeError-Instanz', () => {
      const { host, capture } = createMockHost();
      filter.catch(new RangeError('out of bounds'), host);
      expect(capture.body?.error).toBe('RangeError');
    });
  });

  // -------------------------------------------------------------------------
  // TC-004-003 + TC-004-004: HttpException — message-Normalisierung
  // -------------------------------------------------------------------------
  describe('TC-004-003 / TC-004-004: HttpException-Pfad — message-Normalisierung', () => {
    it('TC-004-004: message wird zu Array gewrappt wenn es ein String ist', () => {
      const { host, capture } = createMockHost();
      // BadRequestException mit String-Message
      filter.catch(new BadRequestException('single string message'), host);
      expect(Array.isArray(capture.body?.message)).toBe(true);
      expect(capture.body?.message).toEqual(['single string message']);
    });

    it('TC-004-003: message bleibt Array wenn es bereits ein Array ist (passthrough)', () => {
      const { host, capture } = createMockHost();
      // NestJS ValidationPipe erzeugt BadRequestException mit Array
      const exception = new BadRequestException({
        message: ['field1 must be a string', 'field2 should not be empty'],
        error: 'Bad Request',
      });
      filter.catch(exception, host);
      expect(capture.body?.message).toEqual([
        'field1 must be a string',
        'field2 should not be empty',
      ]);
      // KEIN doppeltes Wrapping: nicht [['field1...', 'field2...']]
      expect(Array.isArray((capture.body?.message as unknown[])?.[0])).toBe(false);
    });

    it('statusCode stimmt mit HTTP-Status überein (404)', () => {
      const { host, capture } = createMockHost();
      filter.catch(new NotFoundException('not found'), host);
      expect(capture.statusCode).toBe(404);
      expect(capture.body?.statusCode).toBe(404);
    });

    it('statusCode stimmt mit HTTP-Status überein (400)', () => {
      const { host, capture } = createMockHost();
      filter.catch(new BadRequestException('bad'), host);
      expect(capture.statusCode).toBe(400);
      expect(capture.body?.statusCode).toBe(400);
    });
  });

  // -------------------------------------------------------------------------
  // console.error wird aufgerufen (belegt Zeile 22 in errors.filter.ts)
  // -------------------------------------------------------------------------
  describe('Logging-Verhalten', () => {
    it('ruft console.error mit dem Fehler auf', () => {
      const { host } = createMockHost();
      const error = new Error('logged error');
      filter.catch(error, host);
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });
});
