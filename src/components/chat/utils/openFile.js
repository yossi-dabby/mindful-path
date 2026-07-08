/**
 * openFile — safe, browser-native file open helper.
 *
 * Opens a PDF viewer URL in a new browser tab/window.
 * Does NOT use the `download` attribute.
 *
 * Popup-blocker safe: if window.open is blocked (Android Chrome, installed PWA,
 * or popup blockers), falls back to same-tab navigation via window.location.href.
 *
 * Security:
 *  - Only accepts non-empty string URLs; returns early for falsy/non-string values.
 *  - Uses noopener,noreferrer on the new window.
 *
 * @param {string} url - The URL to open for viewing.
 */
export function openFile(url) {
  if (!url || typeof url !== 'string') return;
  const safeUrl = url.trim();
  if (!safeUrl) return;

  // Try to open in a new tab; fall back to same-tab if the popup is blocked
  // (Android Chrome, installed PWA, and strict popup blockers all block window.open
  // that is triggered outside a direct trusted user gesture or after an async gap).
  const openedWindow = window.open(safeUrl, '_blank', 'noopener,noreferrer');
  if (!openedWindow) {
    window.location.href = safeUrl;
  }
}
