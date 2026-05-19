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
