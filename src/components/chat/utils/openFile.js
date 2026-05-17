/**
 * openFile — safe, browser-native file open helper.
 *
 * Opens a URL for viewing in a new browser tab/window.
 * Does NOT use the `download` attribute.
 * Does NOT fetch a blob.
 * Does NOT force a Content-Disposition download.
 *
 * Security:
 *  - Only accepts non-empty string URLs; returns early for falsy/non-string values.
 *  - Uses noopener,noreferrer on the new window.
 *
 * Platform note:
 *  In some hosted preview environments (e.g. Base44 preview), static assets may
 *  be served with a `Content-Disposition: attachment` response header, which
 *  causes the browser to download the file even when opened via window.open.
 *  This is a platform/server-side constraint outside the app's control.
 *  The correct server-side fix is to serve PDFs under /forms/ without
 *  Content-Disposition: attachment. No client-side workaround can reliably
 *  override server-enforced download headers across all browsers.
 *
 * @param {string} url - The URL to open for viewing.
 * @returns {void}
 */
export function openFile(url) {
  if (!url || typeof url !== 'string') return;
  window.open(url.trim(), '_blank', 'noopener,noreferrer');
}
