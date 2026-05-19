/**
 * openFile — safe, browser-native file open helper.
 *
 * Opens a PDF for viewing in a new browser tab/window.
 * Does NOT use the `download` attribute.
 * Uses a Blob URL for same-origin files to avoid server-side
 * Content-Disposition: attachment forcing a download on Open.
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

  const isSameOrigin =
    safeUrl.startsWith('/') ||
    (typeof window !== 'undefined' && safeUrl.startsWith(window.location.origin));

  if (!isSameOrigin) {
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  try {
    const response = await fetch(safeUrl, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`[openFile] Fetch failed: ${response.status}`);

    const pdfBlob = await response.blob();
    const blob = pdfBlob.type === 'application/pdf'
      ? pdfBlob
      : new Blob([pdfBlob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  }
}
