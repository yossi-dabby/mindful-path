/**
 * openFile — safe, browser-native file open helper.
 *
 * Opens a PDF viewer URL in a new browser tab/window.
 * Does NOT use the `download` attribute.
 *
 * Security:
 *  - Only accepts non-empty string URLs; returns early for falsy/non-string values.
 *  - Uses noopener,noreferrer on the new window.
 *
 * @param {string} url - The URL to open for viewing.
 * @returns {Promise<void>}
 */
export async function openFile(url) {
  if (!url || typeof url !== 'string') return;
  const safeUrl = url.trim();
  if (!safeUrl) return;

  const openedWindow = window.open(safeUrl, '_blank', 'noopener,noreferrer');
  if (!openedWindow) {
    throw new Error('[openFile] Failed to open viewer window. Check popup blocker settings and try again.');
  }
}
