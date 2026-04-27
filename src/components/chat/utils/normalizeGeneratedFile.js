/**
 * Normalises and validates a message.metadata.generated_file object.
 *
 * Contract:
 *   {
 *     type:                 'pdf',   // REQUIRED — only 'pdf' is supported in v1
 *     url:                  string,  // REQUIRED — Base44 file URL
 *     name:                 string,  // REQUIRED — file name (default: 'worksheet.pdf')
 *     title?:               string,
 *     description?:         string,
 *     therapeutic_purpose?: string,
 *     created_at?:          string,
 *   }
 *
 * Returns null when the object is absent, invalid, or has an unsupported type.
 * Never throws.
 */
export function normalizeGeneratedFile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.type !== 'pdf') return null;
  const url = typeof raw.url === 'string' && raw.url.trim() ? raw.url.trim() : null;
  if (!url) return null;
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'worksheet.pdf';
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : null;
  const description = typeof raw.description === 'string' && raw.description.trim()
    ? raw.description.trim()
    : null;
  const therapeuticPurpose = typeof raw.therapeutic_purpose === 'string' && raw.therapeutic_purpose.trim()
    ? raw.therapeutic_purpose.trim()
    : null;
  return {
    type: 'pdf',
    url,
    name,
    title,
    description,
    therapeutic_purpose: therapeuticPurpose,
  };
}
