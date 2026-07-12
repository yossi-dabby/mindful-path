export function isValidPdfJsWorkerContentType(contentType = '') {
  return (
    contentType.includes('javascript') ||
    contentType.includes('ecmascript') ||
    contentType.includes('text/plain')
  );
}

export function isPdfJsWorkerRelatedError(error) {
  const message = error?.message || String(error);
  return /worker|dynamically imported module|fake worker/i.test(message);
}

export async function validateWorkerUrl(
  workerUrl,
  signal,
  { fetchImpl = fetch, logger = console } = {}
) {
  logger.log('[PDFJS_WORKER_FETCH_TEST_START]', { workerUrl });

  try {
    const response = await fetchImpl(workerUrl, {
      method: 'GET',
      cache: 'no-store',
      signal,
    });

    if (!response.ok) {
      throw new Error(`Worker fetch returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (!isValidPdfJsWorkerContentType(contentType)) {
      throw new Error(
        `Worker URL returned wrong content-type "${contentType}" — likely served as HTML or SPA catch-all`
      );
    }

    logger.log('[PDFJS_WORKER_FETCH_TEST_OK]', {
      workerUrl,
      status: response.status,
      contentType,
    });
  } catch (error) {
    logger.error('[PDFJS_WORKER_FETCH_TEST_FAILED]', {
      workerUrl,
      reason: error?.message || String(error),
    });
    throw error;
  }
}

export async function loadPdfDocumentWithWorkerFallback({
  url,
  signal,
  workerSrc,
  getDocument,
  validateWorker = validateWorkerUrl,
  logger = console,
}) {
  const loadDocument = async (options) => {
    const loadingTask = getDocument(options);

    let abortHandler = null;
    if (signal) {
      abortHandler = () => loadingTask.destroy();
      signal.addEventListener('abort', abortHandler, { once: true });
    }

    try {
      return await loadingTask.promise;
    } finally {
      if (signal && abortHandler) {
        signal.removeEventListener('abort', abortHandler);
      }
    }
  };

  try {
    await validateWorker(workerSrc, signal, { logger });
    return await loadDocument({ url });
  } catch (error) {
    if (!isPdfJsWorkerRelatedError(error)) {
      throw error;
    }

    logger.warn('[PDFJS_WORKER_RETRY_DISABLE_WORKER]', {
      fileUrl: url,
      reason: error?.message || String(error),
    });

    return await loadDocument({ url, disableWorker: true });
  }
}
