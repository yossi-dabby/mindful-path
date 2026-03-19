/**
 * @file base44/functions/ingestTrustedDocument/entry.ts
 *
 * Therapist Upgrade — Phase 4 — External Trusted Knowledge Ingestion
 *
 * Admin-only function that ingests an approved external trusted-knowledge
 * source into normalized chunk records for later retrieval.
 *
 * FEATURE FLAGS
 * -------------
 * THERAPIST_UPGRADE_ENABLED              — master gate (must be 'true')
 * THERAPIST_UPGRADE_TRUSTED_INGESTION_ENABLED — phase gate (must be 'true')
 * Both must be 'true' for any ingestion to proceed.
 *
 * SOURCE SEPARATION
 * -----------------
 * All output chunks carry content_source_type = 'external_trusted'.
 * This marker separates external chunks from internal content (Exercise,
 * Resource, JournalTemplate, Psychoeducation) in the knowledge index.
 * The existing internal indexing pipeline (backfillKnowledgeIndex,
 * indexContentRecord) is NOT modified by this function.
 *
 * HTML INGESTION
 * --------------
 * For HTML source_type, the function:
 * 1. Fetches the approved URL with a bounded timeout.
 * 2. Strips structural noise: <script>, <style>, <nav>, <header>, <footer>,
 *    <aside> elements.
 * 3. Prefers <main> or <article> content if present; falls back to <body>.
 * 4. Strips remaining HTML tags to produce clean text.
 * 5. Normalizes whitespace.
 * 6. Chunks the text using paragraph-aware chunking.
 * 7. Preserves full provenance on every chunk.
 *
 * PDF INGESTION — PHASE 4 LIMITATION
 * ------------------------------------
 * Full live PDF binary extraction is not safely available in this Deno
 * environment without external library dependencies. Phase 4 supports PDF
 * sources via the pdf_text path only: the caller provides pre-extracted text
 * via the pre_extracted_text field. The function then normalizes, chunks, and
 * adds provenance as for the HTML path.
 *
 * PDF sources with no pre_extracted_text provided are returned as
 * mode='pdf_unsupported' without error, so they do not block the phase.
 * Full live PDF extraction is deferred to a future phase when a bounded,
 * reliable extraction path is confirmed safe.
 *
 * ISOLATION
 * ---------
 * This function does NOT change the current default therapist path. It is
 * only reachable when both upgrade flags are enabled. It does NOT connect
 * ingested chunks to therapist runtime behavior in any way.
 *
 * INPUT
 * -----
 * {
 *   source_url:           string,   // Must match an approved registry entry
 *   pre_extracted_text?:  string,   // Required for pdf_text path; ignored for HTML
 *   dry_run?:             boolean,  // Validate + normalize without indexing (default: false)
 * }
 *
 * OUTPUT (success)
 * ----------------
 * {
 *   success: true,
 *   mode: 'live' | 'dry_run' | 'pdf_unsupported',
 *   source: object,         // Source record with full provenance
 *   chunks: object[],       // Chunk records with full provenance
 *   total_chunks: number,
 * }
 *
 * OUTPUT (error / gated)
 * ----------------------
 * { success: false, error: string }                    — validation / fetch error
 * { success: false, error: string, gated: true }       — flag off (HTTP 503)
 * { success: false, error: string, not_approved: true } — source not in registry
 *
 * See docs/therapist-upgrade-stage2-plan.md — Task 4.1
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─── Feature flag evaluation ──────────────────────────────────────────────────

function isIngestionEnabled(): boolean {
  return (
    Deno.env.get('THERAPIST_UPGRADE_ENABLED') === 'true' &&
    Deno.env.get('THERAPIST_UPGRADE_TRUSTED_INGESTION_ENABLED') === 'true'
  );
}

// ─── Approved source registry ─────────────────────────────────────────────────
// Mirrors src/lib/externalKnowledgeSource.js — APPROVED_TRUSTED_SOURCES.
// Duplicated here because inter-function imports and npm module imports for
// shared front-end lib files are not available in the Deno edge runtime.

const EXTERNAL_CONTENT_SOURCE_TYPE = 'external_trusted';

const EXTERNAL_SOURCE_TYPES = Object.freeze({
  HTML:     'html',
  PDF:      'pdf',
  PDF_TEXT: 'pdf_text',
});

const APPROVED_TRUSTED_SOURCES = Object.freeze([
  Object.freeze({ source_id: 'who-mhgap-ig-v2',       url: 'https://www.who.int/publications/i/item/9789241549790',                                                                                                                   publisher: 'World Health Organization',                                           domain: 'who.int',              source_type: 'html', publication_date: '2016-01-01', title: 'WHO mhGAP Intervention Guide v2.0' }),
  Object.freeze({ source_id: 'nice-depression-ng222',  url: 'https://www.nice.org.uk/guidance/ng222',                                                                                                                                publisher: 'National Institute for Health and Care Excellence',                   domain: 'nice.org.uk',          source_type: 'html', publication_date: '2022-06-29', title: 'NICE Depression in adults: treatment and management' }),
  Object.freeze({ source_id: 'nice-selfharm-ng225',    url: 'https://www.nice.org.uk/guidance/ng225',                                                                                                                                publisher: 'National Institute for Health and Care Excellence',                   domain: 'nice.org.uk',          source_type: 'html', publication_date: '2022-09-07', title: 'NICE Self-harm: assessment, management and preventing recurrence' }),
  Object.freeze({ source_id: 'va-dod-suicide-risk-cpg', url: 'https://www.healthquality.va.gov/guidelines/MH/srb/',                                                                                                                 publisher: 'U.S. Department of Veterans Affairs / Department of Defense',        domain: 'healthquality.va.gov', source_type: 'html', publication_date: '2019-01-01', title: 'VA/DoD Clinical Practice Guideline – Suicide Risk – Provider Summary' }),
  Object.freeze({ source_id: 'samhsa-tip57',           url: 'https://store.samhsa.gov/product/tip-57-trauma-informed-care-behavioral-health-services/PEP14-02-00-002',                                                              publisher: 'Substance Abuse and Mental Health Services Administration',          domain: 'store.samhsa.gov',     source_type: 'html', publication_date: '2014-01-01', title: 'SAMHSA TIP 57 Trauma-Informed Care in Behavioral Health Services' }),
  Object.freeze({ source_id: 'nimh-asq-toolkit',       url: 'https://www.nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials',                                                                                   publisher: 'National Institute of Mental Health',                                domain: 'nimh.nih.gov',         source_type: 'html', publication_date: null,         title: 'NIMH ASQ Toolkit landing page' }),
  Object.freeze({ source_id: 'nimh-asq-pdf',           url: 'https://www.nimh.nih.gov/sites/default/files/documents/research/research-conducted-at-nimh/asq-toolkit-materials/asq-tool/asq_english.pdf',                            publisher: 'National Institute of Mental Health',                                domain: 'nimh.nih.gov',         source_type: 'pdf',  publication_date: null,         title: 'NIMH ASQ screening tool PDF' }),
  Object.freeze({ source_id: 'columbia-cssrs',         url: 'https://cssrs.columbia.edu/the-columbia-scale-c-ssrs/cssrs-for-communities-and-healthcare/',                                                                           publisher: 'Columbia Lighthouse Project',                                        domain: 'cssrs.columbia.edu',   source_type: 'html', publication_date: null,         title: 'Columbia / C-SSRS public screening resources' }),
]);

function lookupApprovedSource(url: string) {
  if (!url) return null;
  const normalized = url.trim().toLowerCase();
  return APPROVED_TRUSTED_SOURCES.find(
    (src) => src.url.toLowerCase() === normalized,
  ) ?? null;
}

// ─── HTML content extraction ──────────────────────────────────────────────────

/**
 * Extracts clean readable text from raw HTML.
 *
 * Strategy:
 * 1. Remove <script>, <style>, <nav>, <header>, <footer>, <aside> blocks.
 * 2. Prefer <main> or <article> content; fall back to full body.
 * 3. Strip remaining HTML tags.
 * 4. Normalize whitespace.
 *
 * This is a bounded regex-based approach that avoids external HTML-parser
 * dependencies in the Deno runtime. It is intentionally conservative — it
 * may leave some navigation fragments in edge cases but will never include
 * script or style content.
 */
function extractHtmlText(html: string): string {
  let text = html;

  // Remove entire script and style blocks (including content).
  // Use [^>]* before > in closing tags to match variants like </script > or </style anything>.
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi, ' ');
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style[^>]*>/gi, ' ');
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');

  // Remove structural noise elements (including their content)
  text = text.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ');
  text = text.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, ' ');
  text = text.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, ' ');
  text = text.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, ' ');

  // Try to extract <main> or <article> content first
  const mainMatch = text.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = text.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (mainMatch) text = mainMatch[1];
  else if (articleMatch) text = articleMatch[1];

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities.
  // &amp; is decoded last to avoid double-unescaping (e.g. &amp;lt; → &lt; → <).
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&amp;/g, '&');

  // Normalize whitespace: collapse runs of spaces/tabs, preserve paragraph breaks
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

// ─── Text chunking ────────────────────────────────────────────────────────────

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP    = 100;

/**
 * Finds a good split boundary near max_pos within text.
 * Prefers sentence end → word boundary → hard cut.
 */
function findSplitBoundary(text: string, maxPos: number): number {
  const searchFrom = Math.floor(maxPos * 0.7);
  for (let i = maxPos; i >= searchFrom; i--) {
    if (text[i] === '.' || text[i] === '?' || text[i] === '!') {
      if (i + 1 >= text.length || text[i + 1] === ' ' || text[i + 1] === '\n') {
        return i + 1;
      }
    }
  }
  for (let i = maxPos; i >= searchFrom; i--) {
    if (text[i] === ' ' || text[i] === '\n') return i + 1;
  }
  return maxPos;
}

/**
 * Splits text into chunks using paragraph-aware chunking with overlap.
 * Mirrors the logic in chunkContentDocument/entry.ts.
 */
function splitIntoChunks(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
): string[] {
  if (!text || text.length === 0) return [];
  if (text.length <= chunkSize) return [text.trim()];

  const rawChunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  let current = '';

  for (const paragraph of paragraphs) {
    const separator = current.length > 0 ? '\n\n' : '';
    const combined  = current + separator + paragraph;

    if (combined.length <= chunkSize) {
      current = combined;
    } else {
      if (current.length > 0) {
        rawChunks.push(current.trim());
        const overlapText = current.length > overlap
          ? current.slice(current.length - overlap)
          : current;
        current = overlapText + '\n\n' + paragraph;
      } else {
        current = paragraph;
      }
      while (current.length > chunkSize) {
        const splitAt = findSplitBoundary(current, chunkSize);
        rawChunks.push(current.slice(0, splitAt).trim());
        const overlapStart = Math.max(0, splitAt - overlap);
        current = current.slice(overlapStart).trim();
      }
    }
  }

  if (current.trim().length > 0) rawChunks.push(current.trim());
  return rawChunks.filter((c) => c.length > 0);
}

// ─── Source + chunk record builders ──────────────────────────────────────────

function buildSourceRecord(approvedEntry: Record<string, unknown>, retrievalDate: string) {
  return {
    source_id:           approvedEntry.source_id,
    title:               approvedEntry.title,
    url:                 approvedEntry.url,
    publisher:           approvedEntry.publisher,
    domain:              approvedEntry.domain,
    source_type:         approvedEntry.source_type,
    retrieval_date:      retrievalDate,
    publication_date:    approvedEntry.publication_date ?? null,
    status:              'active',
    ingestion_status:    'complete',
    error_state:         null,
    source_fingerprint:  null,
    content_source_type: EXTERNAL_CONTENT_SOURCE_TYPE,
  };
}

function buildChunkRecords(
  rawChunks: string[],
  approvedEntry: Record<string, unknown>,
  retrievalDate: string,
): object[] {
  const total = rawChunks.length;
  return rawChunks.map((text, index) => ({
    chunk_id:            `${approvedEntry.source_id}::chunk_${index}`,
    source_id:           approvedEntry.source_id,
    source_url:          approvedEntry.url,
    source_title:        approvedEntry.title,
    publisher:           approvedEntry.publisher,
    domain:              approvedEntry.domain,
    retrieval_date:      retrievalDate,
    publication_date:    approvedEntry.publication_date ?? null,
    section_context:     null,
    page_number:         null,
    chunk_index:         index,
    total_chunks:        total,
    chunk_text:          text,
    character_count:     text.length,
    content_source_type: EXTERNAL_CONTENT_SOURCE_TYPE,
    language:            'en',
    version:             1,
    metadata:            {
      source_id:   approvedEntry.source_id,
      publisher:   approvedEntry.publisher,
      domain:      approvedEntry.domain,
      source_type: approvedEntry.source_type,
    },
  }));
}

// ─── Request handler ──────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  try {
    // ── Admin gate ─────────────────────────────────────────────────────────
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // ── Feature flag gate ──────────────────────────────────────────────────
    if (!isIngestionEnabled()) {
      return Response.json(
        {
          success: false,
          error:   'Ingestion is not enabled. Set THERAPIST_UPGRADE_ENABLED=true and THERAPIST_UPGRADE_TRUSTED_INGESTION_ENABLED=true to enable.',
          gated:   true,
        },
        { status: 503 },
      );
    }

    // ── Parse and validate input ───────────────────────────────────────────
    const body = await req.json();
    const {
      source_url,
      pre_extracted_text,
      dry_run = false,
    } = body ?? {};

    if (!source_url || typeof source_url !== 'string') {
      return Response.json(
        { success: false, error: 'source_url is required and must be a string.' },
        { status: 400 },
      );
    }

    // ── Approved source validation ─────────────────────────────────────────
    const approvedEntry = lookupApprovedSource(source_url);
    if (!approvedEntry) {
      return Response.json(
        {
          success:      false,
          error:        `Source URL is not in the approved registry: ${source_url}`,
          not_approved: true,
        },
        { status: 400 },
      );
    }

    const retrievalDate = new Date().toISOString();

    // ── PDF source handling ────────────────────────────────────────────────
    if (approvedEntry.source_type === EXTERNAL_SOURCE_TYPES.PDF) {
      if (!pre_extracted_text || typeof pre_extracted_text !== 'string' || pre_extracted_text.trim() === '') {
        // Safe fallback: PDF without pre-extracted text is noted as unsupported
        // in Phase 4. Full live PDF extraction is deferred to a future phase.
        return Response.json({
          success:      true,
          mode:         'pdf_unsupported',
          source:       buildSourceRecord({ ...approvedEntry, ingestion_status: 'skipped' } as Record<string, unknown>, retrievalDate),
          chunks:       [],
          total_chunks: 0,
          note:         'PDF binary extraction is not yet available in Phase 4. Provide pre_extracted_text to ingest this source.',
        });
      }
      // PDF with pre-extracted text — treat as text input
      const cleanText = pre_extracted_text.trim();
      const rawChunks = splitIntoChunks(cleanText);

      if (rawChunks.length === 0) {
        return Response.json(
          { success: false, error: 'pre_extracted_text produced no usable chunks after normalization.' },
          { status: 400 },
        );
      }

      const source = buildSourceRecord(approvedEntry as Record<string, unknown>, retrievalDate);
      const chunks = buildChunkRecords(rawChunks, approvedEntry as Record<string, unknown>, retrievalDate);

      return Response.json({
        success:      true,
        mode:         dry_run ? 'dry_run' : 'live',
        source,
        chunks:       dry_run ? [] : chunks,
        chunks_would_index: dry_run ? chunks.length : undefined,
        total_chunks: dry_run ? 0 : chunks.length,
        dry_run_would_index: dry_run ? chunks.length : undefined,
      });
    }

    // ── HTML source ingestion ──────────────────────────────────────────────
    // Fetch with a bounded timeout to avoid hanging indefinitely.
    const controller  = new AbortController();
    const timeoutId   = setTimeout(() => controller.abort(), 15_000);

    let rawHtml: string;
    try {
      const response = await fetch(approvedEntry.url as string, {
        signal: controller.signal,
        headers: { 'User-Agent': 'MindfulPath-KnowledgeIngestion/1.0 (admin-only; non-commercial; research)' },
      });
      if (!response.ok) {
        return Response.json(
          { success: false, error: `Fetch failed: HTTP ${response.status} for ${approvedEntry.url}` },
          { status: 502 },
        );
      }
      rawHtml = await response.text();
    } catch (fetchErr: unknown) {
      const message = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      return Response.json(
        { success: false, error: `Fetch error: ${message}` },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const cleanText = extractHtmlText(rawHtml);
    if (!cleanText || cleanText.length < 50) {
      return Response.json(
        { success: false, error: 'HTML extraction produced insufficient text content.' },
        { status: 422 },
      );
    }

    const rawChunks = splitIntoChunks(cleanText);
    if (rawChunks.length === 0) {
      return Response.json(
        { success: false, error: 'Chunking produced no usable chunks from extracted text.' },
        { status: 422 },
      );
    }

    const source = buildSourceRecord(approvedEntry as Record<string, unknown>, retrievalDate);
    const chunks = buildChunkRecords(rawChunks, approvedEntry as Record<string, unknown>, retrievalDate);

    return Response.json({
      success:      true,
      mode:         dry_run ? 'dry_run' : 'live',
      source,
      chunks:       dry_run ? [] : chunks,
      total_chunks: dry_run ? 0 : chunks.length,
      dry_run_would_index: dry_run ? chunks.length : undefined,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
});
