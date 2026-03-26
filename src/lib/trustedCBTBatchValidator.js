/**
 * @file src/lib/trustedCBTBatchValidator.js
 *
 * Lightweight Base44 import-compatibility validator for TrustedCBTChunk batch files.
 *
 * Validates that a JSON batch file contains records that are fully compatible
 * with the Base44 BulkImport flow used in KnowledgeStudio (/KnowledgeStudio →
 * Bulk Import tab). Fails clearly on:
 *   - missing required fields (title, topic, content)
 *   - invalid language value
 *   - invalid priority_score (out of 0–10 range)
 *   - non-array tags
 *   - extra non-Base44 fields
 *
 * This is a pure validation utility with no side effects. It does not write to
 * any database, call any API, or import from production code paths.
 *
 * Usage (Node.js):
 *   node -e "
 *     const { validateBatchFile } = require('./src/lib/trustedCBTBatchValidator.js');
 *     const result = validateBatchFile('./src/data/trusted-cbt-batch-1.base44.json');
 *     console.log(result.summary);
 *   "
 *
 * Or import in tests:
 *   import { validateBatch, TRUSTED_CBT_CHUNK_FIELDS, REQUIRED_FIELDS } from './trustedCBTBatchValidator.js';
 */

// ─── Schema constants ─────────────────────────────────────────────────────────

/**
 * The complete set of fields that the Base44 TrustedCBTChunk entity accepts.
 * Derived from the normalizeRecord() function in BulkImport.jsx.
 *
 * @type {ReadonlySet<string>}
 */
export const TRUSTED_CBT_CHUNK_FIELDS = Object.freeze(new Set([
  'title',
  'topic',
  'subtopic',
  'population',
  'clinical_goal',
  'content',
  'short_summary',
  'tags',
  'source_name',
  'source_type',
  'license_status',
  'safety_notes',
  'contraindications',
  'language',
  'priority_score',
  'is_active',
]));

/**
 * Fields that must be present and non-empty in every record.
 * Matches the REQUIRED constant in BulkImport.jsx.
 *
 * @type {ReadonlyArray<string>}
 */
export const REQUIRED_FIELDS = Object.freeze(['title', 'topic', 'content']);

/**
 * Supported language codes — must match the LANGUAGES constant in BulkImport.jsx.
 *
 * @type {ReadonlyArray<string>}
 */
export const VALID_LANGUAGES = Object.freeze(['en', 'he', 'es', 'fr', 'de', 'it', 'pt']);

/** Minimum valid priority_score. */
export const PRIORITY_SCORE_MIN = 0;

/** Maximum valid priority_score. */
export const PRIORITY_SCORE_MAX = 10;

// ─── Record-level validation ──────────────────────────────────────────────────

/**
 * Validates a single TrustedCBTChunk record for Base44 import compatibility.
 *
 * @param {Record<string, unknown>} record - The record to validate.
 * @param {number} index - Zero-based index of the record in the batch (for error messages).
 * @returns {{ valid: boolean, errors: string[], extraFields: string[] }}
 */
export function validateRecord(record, index) {
  const errors = [];
  const extraFields = [];

  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { valid: false, errors: [`[${index}] Record must be a plain object`], extraFields: [] };
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    const val = record[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      errors.push(`[${index}] Missing required field: "${field}"`);
    }
  }

  // Validate language
  if (record.language !== undefined && !VALID_LANGUAGES.includes(record.language)) {
    errors.push(
      `[${index}] Invalid language "${record.language}". Must be one of: ${VALID_LANGUAGES.join(', ')}`
    );
  }

  // Validate priority_score
  if (record.priority_score !== undefined) {
    const score = Number(record.priority_score);
    if (isNaN(score) || score < PRIORITY_SCORE_MIN || score > PRIORITY_SCORE_MAX) {
      errors.push(
        `[${index}] Invalid priority_score "${record.priority_score}". Must be a number between ${PRIORITY_SCORE_MIN} and ${PRIORITY_SCORE_MAX}`
      );
    }
  }

  // Validate tags is an array
  if (record.tags !== undefined && !Array.isArray(record.tags)) {
    errors.push(`[${index}] "tags" must be an array, got: ${typeof record.tags}`);
  }

  // Detect extra non-Base44 fields
  for (const key of Object.keys(record)) {
    if (!TRUSTED_CBT_CHUNK_FIELDS.has(key)) {
      extraFields.push(key);
    }
  }
  if (extraFields.length > 0) {
    errors.push(
      `[${index}] Extra non-Base44 fields found (must be removed before import): ${extraFields.map(f => `"${f}"`).join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    extraFields,
  };
}

// ─── Batch-level validation ───────────────────────────────────────────────────

/**
 * Validates an array of TrustedCBTChunk records for Base44 import compatibility.
 *
 * @param {unknown[]} records - The array of records to validate.
 * @returns {{ valid: boolean, totalRecords: number, validCount: number, invalidCount: number, results: Array, summary: string }}
 */
export function validateBatch(records) {
  if (!Array.isArray(records)) {
    return {
      valid: false,
      totalRecords: 0,
      validCount: 0,
      invalidCount: 0,
      results: [],
      summary: 'FAIL: Input must be a JSON array',
    };
  }

  const results = records.map((rec, i) => validateRecord(rec, i));
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.length - validCount;

  const failLines = results
    .filter(r => !r.valid)
    .flatMap(r => r.errors)
    .map(e => `  • ${e}`)
    .join('\n');

  const valid = invalidCount === 0;
  const summary = valid
    ? `PASS: All ${validCount} record(s) are Base44 import-compatible`
    : `FAIL: ${invalidCount}/${results.length} record(s) have errors:\n${failLines}`;

  return {
    valid,
    totalRecords: records.length,
    validCount,
    invalidCount,
    results,
    summary,
  };
}

// ─── File-level validation (Node.js only) ────────────────────────────────────

/**
 * Reads and validates a JSON batch file.
 * Only callable in a Node.js environment (uses `fs` and `path` — not available in browser).
 *
 * @param {string} filePath - Absolute or relative path to the JSON file.
 * @returns {{ valid: boolean, totalRecords: number, validCount: number, invalidCount: number, results: Array, summary: string }}
 */
export function validateBatchFile(filePath) {
  // Dynamic require for Node.js compatibility — avoids bundler issues in browser context
  // eslint-disable-next-line no-undef
  const fs = require('fs');
  // eslint-disable-next-line no-undef
  const path = require('path');
  const absolutePath = path.resolve(filePath);
  let raw;
  try {
    raw = fs.readFileSync(absolutePath, 'utf8');
  } catch (e) {
    return {
      valid: false,
      totalRecords: 0,
      validCount: 0,
      invalidCount: 0,
      results: [],
      summary: `FAIL: Cannot read file "${absolutePath}": ${e.message}`,
    };
  }

  let records;
  try {
    records = JSON.parse(raw);
  } catch (e) {
    return {
      valid: false,
      totalRecords: 0,
      validCount: 0,
      invalidCount: 0,
      results: [],
      summary: `FAIL: JSON parse error in "${absolutePath}": ${e.message}`,
    };
  }

  return validateBatch(records);
}
