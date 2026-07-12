import { describe, expect, it, vi } from 'vitest';
import {
  isPdfJsWorkerRelatedError,
  isValidPdfJsWorkerContentType,
  loadPdfDocumentWithWorkerFallback,
  validatePdfUrl,
  validateWorkerUrl,
} from '../../src/components/forms/pdfJsViewerUtils.js';

function createLogger() {
  return {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe('pdfJsViewerUtils', () => {
  it('accepts JavaScript-like worker content types and rejects HTML', () => {
    expect(isValidPdfJsWorkerContentType('application/javascript')).toBe(true);
    expect(isValidPdfJsWorkerContentType('text/javascript; charset=utf-8')).toBe(true);
    expect(isValidPdfJsWorkerContentType('application/ecmascript')).toBe(true);
    expect(isValidPdfJsWorkerContentType('text/plain')).toBe(true);
    expect(isValidPdfJsWorkerContentType('text/html')).toBe(false);
  });

  it('validateWorkerUrl rejects text/html worker responses', async () => {
    const logger = createLogger();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name) => (name === 'content-type' ? 'text/html' : null),
      },
    });

    await expect(
      validateWorkerUrl('/assets/pdf.worker.min.mjs', undefined, { fetchImpl, logger })
    ).rejects.toThrow(/wrong content-type "text\/html"/i);

    expect(logger.error).toHaveBeenCalled();
  });

  it('validateWorkerUrl rejects application/octet-stream with the Base44 MIME error message', async () => {
    const logger = createLogger();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name) => (name === 'content-type' ? 'application/octet-stream' : null),
      },
    });

    await expect(
      validateWorkerUrl('/pdfjs/pdf.worker.min.js', undefined, { fetchImpl, logger })
    ).rejects.toThrow(
      'PDF.js worker is not served as JavaScript. Base44 is serving the worker with the wrong MIME type.'
    );

    expect(logger.error).toHaveBeenCalled();
  });

  it('retries with disableWorker=true after worker-related failures', async () => {
    const logger = createLogger();
    const getDocument = vi
      .fn()
      .mockReturnValueOnce({
        promise: Promise.reject(new Error('Setting up fake worker failed')),
        destroy: vi.fn(),
      })
      .mockReturnValueOnce({
        promise: Promise.resolve({ numPages: 1 }),
        destroy: vi.fn(),
      });

    const pdf = await loadPdfDocumentWithWorkerFallback({
      url: '/forms/en/children/cbt-core/stage-01/example.pdf',
      workerSrc: '/assets/pdf.worker.min.mjs',
      getDocument,
      validateWorker: vi.fn().mockResolvedValue(undefined),
      logger,
    });

    expect(pdf).toEqual({ numPages: 1 });
    expect(getDocument).toHaveBeenNthCalledWith(1, {
      url: '/forms/en/children/cbt-core/stage-01/example.pdf',
    });
    expect(getDocument).toHaveBeenNthCalledWith(2, {
      url: '/forms/en/children/cbt-core/stage-01/example.pdf',
      disableWorker: true,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      '[PDFJS_WORKER_RETRY_DISABLE_WORKER]',
      expect.objectContaining({
        fileUrl: '/forms/en/children/cbt-core/stage-01/example.pdf',
      })
    );
  });

  it('does not classify plain PDF load errors as worker-related', () => {
    expect(isPdfJsWorkerRelatedError(new Error('Invalid PDF structure'))).toBe(false);
  });

  // ─── validatePdfUrl ──────────────────────────────────────────────────────

  it('validatePdfUrl accepts a valid PDF response (first bytes %PDF)', async () => {
    const logger = createLogger();
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 206,
      headers: { get: (name) => (name === 'content-type' ? 'application/pdf' : null) },
      arrayBuffer: async () => pdfBytes.buffer,
    });

    await expect(
      validatePdfUrl('/forms/en/example.pdf', undefined, { fetchImpl, logger })
    ).resolves.toBeUndefined();

    expect(logger.log).toHaveBeenCalledWith(
      '[PDFJS_PDF_FETCH_TEST_OK]',
      expect.objectContaining({ firstFive: '%PDF-' })
    );
  });

  it('validatePdfUrl rejects an HTML SPA catch-all response by content-type', async () => {
    const logger = createLogger();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (name) => (name === 'content-type' ? 'text/html; charset=utf-8' : null) },
      arrayBuffer: async () => new Uint8Array([]).buffer,
    });

    await expect(
      validatePdfUrl('/forms/en/example.pdf', undefined, { fetchImpl, logger })
    ).rejects.toThrow(/wrong content-type.*HTML page/i);

    expect(logger.error).toHaveBeenCalledWith(
      '[PDF_BYTES_NOT_PDF]',
      expect.objectContaining({ reason: expect.stringContaining('HTML content-type') })
    );
  });

  it('validatePdfUrl rejects when first bytes are not %PDF', async () => {
    const logger = createLogger();
    const notPdfBytes = new Uint8Array([0x3c, 0x21, 0x44, 0x4f, 0x43]); // <!DOC
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (name) => (name === 'content-type' ? 'application/octet-stream' : null) },
      arrayBuffer: async () => notPdfBytes.buffer,
    });

    await expect(
      validatePdfUrl('/forms/en/example.pdf', undefined, { fetchImpl, logger })
    ).rejects.toThrow(/did not return a valid PDF/i);

    expect(logger.error).toHaveBeenCalledWith(
      '[PDF_BYTES_NOT_PDF]',
      expect.objectContaining({ firstFive: '<!DOC' })
    );
  });

  it('validatePdfUrl does not throw on HTTP 4xx — lets PDF.js handle it', async () => {
    const logger = createLogger();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: { get: () => null },
    });

    await expect(
      validatePdfUrl('/forms/en/example.pdf', undefined, { fetchImpl, logger })
    ).resolves.toBeUndefined();

    expect(logger.warn).toHaveBeenCalledWith(
      '[PDFJS_PDF_FETCH_TEST_FAILED]',
      expect.objectContaining({ status: 403 })
    );
  });

  it('validatePdfUrl does not throw on network errors — lets PDF.js handle it', async () => {
    const logger = createLogger();
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      validatePdfUrl('/forms/en/example.pdf', undefined, { fetchImpl, logger })
    ).resolves.toBeUndefined();

    expect(logger.warn).toHaveBeenCalledWith(
      '[PDFJS_PDF_FETCH_TEST_FAILED]',
      expect.objectContaining({ reason: 'Failed to fetch' })
    );
  });

  it('loadPdfDocumentWithWorkerFallback calls validatePdfUrl before loading', async () => {
    const logger = createLogger();
    const validatePdf = vi.fn().mockResolvedValue(undefined);
    const getDocument = vi.fn().mockReturnValue({
      promise: Promise.resolve({ numPages: 2 }),
      destroy: vi.fn(),
    });

    await loadPdfDocumentWithWorkerFallback({
      url: '/forms/en/example.pdf',
      workerSrc: '/assets/pdf.worker.min.mjs',
      getDocument,
      validateWorker: vi.fn().mockResolvedValue(undefined),
      validatePdf,
      logger,
    });

    expect(validatePdf).toHaveBeenCalledWith(
      '/forms/en/example.pdf',
      undefined,
      expect.objectContaining({ logger })
    );
  });

  it('loadPdfDocumentWithWorkerFallback propagates validatePdf content errors', async () => {
    const logger = createLogger();
    const contentError = new Error(
      'PDF URL returned wrong content-type "text/html; charset=utf-8" — URL is serving an HTML page instead of a PDF file'
    );
    const validatePdf = vi.fn().mockRejectedValue(contentError);
    const getDocument = vi.fn();

    await expect(
      loadPdfDocumentWithWorkerFallback({
        url: '/forms/en/example.pdf',
        workerSrc: '/assets/pdf.worker.min.mjs',
        getDocument,
        validateWorker: vi.fn().mockResolvedValue(undefined),
        validatePdf,
        logger,
      })
    ).rejects.toThrow(/HTML page/i);

    expect(getDocument).not.toHaveBeenCalled();
  });
});
