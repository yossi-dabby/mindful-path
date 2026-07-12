import { describe, expect, it, vi } from 'vitest';
import {
  isPdfJsWorkerRelatedError,
  isValidPdfJsWorkerContentType,
  loadPdfDocumentWithWorkerFallback,
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
});
