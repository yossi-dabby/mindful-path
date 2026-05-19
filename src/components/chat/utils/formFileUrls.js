/**
 * Open/Download URL builders are intentionally separate so behavior can diverge
 * without changing call sites (e.g. viewer route for open vs attachment route for download).
 */
export function getFormOpenUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'https://example.local');
    parsed.searchParams.delete('download');
    const normalized = parsed.pathname + parsed.search + parsed.hash;
    return trimmed.startsWith('/') ? normalized : parsed.toString();
  } catch {
    return trimmed;
  }
}

export function getFormDownloadUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'https://example.local');
    parsed.searchParams.set('download', '1');
    const normalized = parsed.pathname + parsed.search + parsed.hash;
    return trimmed.startsWith('/') ? normalized : parsed.toString();
  } catch {
    return trimmed;
  }
}
