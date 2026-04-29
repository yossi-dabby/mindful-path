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
 * @param {string} url - The URL to open for viewing.
 * @returns {void}
 */
export function openFile(url) {
  if (!url || typeof url !== 'string') return;
  window.open(url.trim(), '_blank', 'noopener,noreferrer');
}
