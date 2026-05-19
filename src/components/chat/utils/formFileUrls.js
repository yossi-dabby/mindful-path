/**
 * Open/Download URL builders are intentionally separate so behavior can diverge
 * without changing call sites (e.g. viewer route for open vs attachment route for download).
 */
export function getFormOpenUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed || null;
}

export function getFormDownloadUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed || null;
}
