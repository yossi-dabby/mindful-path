/**
 * PdfJsViewer — renders a PDF file using PDF.js (canvas-based).
 *
 * Why PDF.js instead of <iframe>:
 *  - Android Chrome/WebView does not render PDFs inside iframes — it downloads
 *    them instead. PDF.js renders each page as an HTML <canvas>, which works on
 *    all platforms including installed Android PWAs.
 *
 * Worker configuration:
 *  - workerSrc is set to a Vite-bundled, content-hashed URL produced by the
 *    `?url` import. This ensures Android Production always loads the correct
 *    worker from the same bundle, not from an external CDN.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Set worker once at module init so it is resolved before any getDocument call.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// ─── Build-version marker ──────────────────────────────────────────────────
// __PDF_VIEWER_BUILD__ is defined by vite.config.js at build time.
// Logging this on mount lets us confirm which bundle is running on Android.
const BUILD_MARKER = typeof __PDF_VIEWER_BUILD__ !== 'undefined'
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

    console.log('[PDFJS_LOAD_START]', {
      fileUrl: url,
      build: BUILD_MARKER,
      workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
      containerWidth: getContainerWidth(container),
    });

    try {
      const loadingTask = pdfjsLib.getDocument({ url });

      // Allow callers to cancel in-flight loads (e.g. unmount, new URL).
      signal.addEventListener('abort', () => loadingTask.destroy());

      const pdf = await loadingTask.promise;
      if (signal.aborted) return;

      console.log('[PDFJS_DOCUMENT_LOADED]', { pageCount: pdf.numPages });

      // Clear previous render.
      container.innerHTML = '';

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
    const onResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const ac = new AbortController();
        renderPdf(fileUrl, ac.signal);
      }, 200);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [fileUrl, renderPdf]);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
        padding: '8px',
        backgroundColor: 'inherit',
      }}
    >
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
        </div>
      )}

      {/* Canvas pages are appended here by the render loop */}
      <div ref={containerRef} />
    </div>
  );
}
