/**
 * PdfJsViewer — renders a PDF file using PDF.js (canvas-based).
 *
 * Why PDF.js instead of <iframe>:
 *  - Android Chrome/WebView does not render PDFs inside iframes — it downloads
 *    them instead. PDF.js renders each page as an HTML <canvas>, which works on
 *    all platforms including installed Android PWAs.
 *
 * Worker configuration:
 *  - workerSrc is set to a stable public .js URL: /pdfjs/pdf.worker.min.js
 *    This file is copied from node_modules by scripts/copy-pdf-worker.cjs at
 *    postinstall / prebuild time.
 *
 *  - Using a .js extension (not .mjs) ensures Base44 / custom-domain hosting
 *    serves the file with a JavaScript MIME type rather than
 *    application/octet-stream, which browsers refuse to load as a module worker.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadPdfDocumentWithWorkerFallback } from './pdfJsViewerUtils';

// Stable public .js URL for the PDF.js worker — served with a JS MIME type by
// all hosts (including Base44 custom domain) so the browser accepts it as a
// module worker. The file is placed here by scripts/copy-pdf-worker.cjs.
const PDF_WORKER_URL = '/pdfjs/pdf.worker.min.js';

// Set worker once at module init so it is resolved before any getDocument call.
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
console.log('[PDFJS_VERSION]', pdfjsLib.version || 'unknown');
console.log('[PDFJS_WORKER_URL]', PDF_WORKER_URL);

// ─── Build-version marker ──────────────────────────────────────────────────
// __PDF_VIEWER_BUILD__ is a build-time string injected by vite.config.js
// `define`. Logging it at mount confirms which Production bundle is running
// on Android (helps distinguish a stale cached build from the latest one).
/** @type {string} ISO timestamp set by vite.config.js define at build time */
const BUILD_MARKER =
  typeof __PDF_VIEWER_BUILD__ !== 'undefined'
    ? __PDF_VIEWER_BUILD__
    : 'dev';

// ─── Internal helpers ──────────────────────────────────────────────────────

/** Pick canvas width: prefer container measurement, fall back to window width. */
function getContainerWidth(containerEl) {
  if (containerEl) {
    const w = containerEl.clientWidth;
    if (w > 0) return w;
  }
  return typeof window !== 'undefined' ? window.innerWidth : 800;
}

/** Render a single PDF page into a new <canvas> and append it to container. */
async function renderPage(page, containerEl, isFirst) {
  const containerWidth = getContainerWidth(containerEl);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = containerWidth / baseViewport.width;
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(scaledViewport.width);
  canvas.height = Math.floor(scaledViewport.height);
  // Explicit CSS width makes canvas fluid on orientation change.
  canvas.style.width = '100%';
  canvas.style.display = 'block';
  if (!isFirst) {
    canvas.style.marginTop = '8px';
  }

  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
  containerEl.appendChild(canvas);
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * @param {{ fileUrl: string|null }} props
 *   fileUrl — the fully-resolved PDF URL (static /forms/ path or signed HTTPS URL).
 *
 * Scrolling is delegated to the parent container (PdfViewer.jsx content area).
 * PdfJsViewer fills its container and does not create its own scroll context.
 */
export default function PdfJsViewer({ fileUrl }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const renderPdf = useCallback(async (url, signal) => {
    if (!url) return;

    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setErrorMessage(null);
    container.innerHTML = '';

    console.log('[PDFJS_LOAD_START]', {
      fileUrl: url,
      build: BUILD_MARKER,
      workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
      containerWidth: getContainerWidth(container),
    });

    try {
      console.log('[PDFJS_WORKER_URL]', pdfjsLib.GlobalWorkerOptions.workerSrc);
      const pdf = await loadPdfDocumentWithWorkerFallback({
        url,
        signal,
        workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
        getDocument: pdfjsLib.getDocument,
        logger: console,
      });
      if (signal.aborted) return;

      console.log('[PDFJS_DOCUMENT_LOADED]', { pageCount: pdf.numPages });

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (signal.aborted) return;
        const page = await pdf.getPage(pageNum);
        if (signal.aborted) return;
        await renderPage(page, container, pageNum === 1);
        if (pageNum === 1) {
          console.log('[PDFJS_FIRST_PAGE_RENDERED]');
          setIsLoading(false);
        }
      }

      if (pdf.numPages === 0) {
        setIsLoading(false);
      }
    } catch (err) {
      if (signal.aborted) return;
      console.error('[PDFJS_ERROR]', err);
      setErrorMessage(err?.message || 'Unknown PDF error');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fileUrl) {
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    renderPdf(fileUrl, ac.signal);
    return () => ac.abort();
  }, [fileUrl, renderPdf]);

  // Re-render on resize / orientation change so canvas widths stay correct.
  useEffect(() => {
    if (!fileUrl) return;

    let debounceTimer = null;
    let debounceAc = null;

    const onResize = () => {
      clearTimeout(debounceTimer);
      if (debounceAc) debounceAc.abort();
      debounceAc = new AbortController();
      // Capture `debounceAc` into a local `ac` so the setTimeout closure holds
      // a stable reference even if a second resize fires and reassigns `debounceAc`
      // before the 200ms delay elapses.
      const ac = debounceAc;
      debounceTimer = setTimeout(() => {
        renderPdf(fileUrl, ac.signal);
      }, 200);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      clearTimeout(debounceTimer);
      if (debounceAc) debounceAc.abort();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [fileUrl, renderPdf]);

  return (
    <div style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
      {isLoading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '4rem',
          }}
          aria-label={t('common.loading', 'Loading...')}
        >
          <Loader2
            className="h-7 w-7 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            paddingTop: '4rem',
            textAlign: 'center',
            color: 'var(--destructive, #ef4444)',
          }}
        >
          <p style={{ margin: 0 }}>
            {t('pdf_viewer.error_loading', 'Could not load the PDF.')}
          </p>
          <p
            data-testid="pdfjs-error-message"
            style={{ margin: 0, fontSize: '0.75rem', opacity: 0.75 }}
          >
            {errorMessage}
          </p>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', textDecoration: 'underline' }}
            >
              {t('common.open_pdf_directly', 'Open PDF directly')}
            </a>
          )}
        </div>
      )}

      {/* Canvas pages are appended here by the render loop */}
      <div ref={containerRef} />
    </div>
  );
}
