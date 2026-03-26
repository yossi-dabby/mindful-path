/**
 * @file test/utils/trustedCBTBatchValidator.test.js
 *
 * Validates the Base44 import-compatibility checker for TrustedCBTChunk batch files.
 *
 * PURPOSE
 * -------
 *  1. Verify TRUSTED_CBT_CHUNK_FIELDS contains exactly the 16 Base44 schema fields.
 *  2. Verify REQUIRED_FIELDS matches BulkImport.jsx (title, topic, content).
 *  3. Verify VALID_LANGUAGES matches BulkImport.jsx (7 languages).
 *  4. Verify validateRecord passes a fully valid record.
 *  5. Verify validateRecord fails on missing required fields.
 *  6. Verify validateRecord fails on invalid language.
 *  7. Verify validateRecord fails on invalid priority_score.
 *  8. Verify validateRecord fails on non-array tags.
 *  9. Verify validateRecord fails on extra non-Base44 fields (entity_type, content_source_type, chunk_index, evidence_level).
 * 10. Verify validateBatch passes for an all-valid batch.
 * 11. Verify validateBatch fails for a batch with mixed valid/invalid records.
 * 12. Verify validateBatch returns correct counts (totalRecords, validCount, invalidCount).
 * 13. Verify validateBatch summary starts with "PASS:" on success.
 * 14. Verify validateBatch summary starts with "FAIL:" on failure.
 * 15. Verify validateBatch handles non-array input gracefully.
 * 16. Verify the smoke file (first 3 records) passes batch validation.
 * 17. Verify the full batch file (10 records) passes batch validation.
 * 18. Verify every record in the full batch has is_active === false.
 * 19. Verify every record in the smoke file has is_active === false.
 * 20. Verify no record in either file contains non-Base44 fields.
 */

import { describe, it, expect } from 'vitest';
import {
  TRUSTED_CBT_CHUNK_FIELDS,
  REQUIRED_FIELDS,
  VALID_LANGUAGES,
  PRIORITY_SCORE_MIN,
  PRIORITY_SCORE_MAX,
  validateRecord,
  validateBatch,
} from '../../src/lib/trustedCBTBatchValidator.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadBatch(relativePath) {
  return JSON.parse(readFileSync(resolve(relativePath), 'utf8'));
}

function makeValidRecord(overrides = {}) {
  return {
    title: 'Test CBT Chunk',
    topic: 'anxiety',
    content: 'This is the clinical content for the chunk.',
    language: 'en',
    priority_score: 7,
    tags: ['anxiety', 'cbt'],
    is_active: false,
    ...overrides,
  };
}

// ─── 1. TRUSTED_CBT_CHUNK_FIELDS ──────────────────────────────────────────────

describe('TRUSTED_CBT_CHUNK_FIELDS', () => {
  it('contains exactly 16 Base44 schema fields', () => {
    expect(TRUSTED_CBT_CHUNK_FIELDS.size).toBe(16);
  });

  it('includes all expected Base44 fields', () => {
    const expected = [
      'title', 'topic', 'subtopic', 'population', 'clinical_goal',
      'content', 'short_summary', 'tags', 'source_name', 'source_type',
      'license_status', 'safety_notes', 'contraindications', 'language',
      'priority_score', 'is_active',
    ];
    for (const field of expected) {
      expect(TRUSTED_CBT_CHUNK_FIELDS.has(field)).toBe(true);
    }
  });

  it('does NOT include repo-only fields', () => {
    const forbidden = ['entity_type', 'content_source_type', 'chunk_index', 'evidence_level', 'id', 'chunk_id', 'source_id'];
    for (const field of forbidden) {
      expect(TRUSTED_CBT_CHUNK_FIELDS.has(field)).toBe(false);
    }
  });
});

// ─── 2. REQUIRED_FIELDS ───────────────────────────────────────────────────────

describe('REQUIRED_FIELDS', () => {
  it('contains exactly 3 required fields', () => {
    expect(REQUIRED_FIELDS.length).toBe(3);
  });

  it('requires title, topic, and content', () => {
    expect(REQUIRED_FIELDS).toContain('title');
    expect(REQUIRED_FIELDS).toContain('topic');
    expect(REQUIRED_FIELDS).toContain('content');
  });
});

// ─── 3. VALID_LANGUAGES ───────────────────────────────────────────────────────

describe('VALID_LANGUAGES', () => {
  it('contains exactly 7 supported languages', () => {
    expect(VALID_LANGUAGES.length).toBe(7);
  });

  it('includes all 7 app-supported languages', () => {
    for (const lang of ['en', 'he', 'es', 'fr', 'de', 'it', 'pt']) {
      expect(VALID_LANGUAGES).toContain(lang);
    }
  });
});

// ─── 4. validateRecord — valid record ─────────────────────────────────────────

describe('validateRecord — valid record', () => {
  it('passes a fully valid record', () => {
    const result = validateRecord(makeValidRecord(), 0);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes when optional fields are omitted', () => {
    const result = validateRecord({ title: 'T', topic: 'anxiety', content: 'C' }, 0);
    expect(result.valid).toBe(true);
  });

  it('passes with all 16 fields present', () => {
    const full = {
      title: 'Full Record',
      topic: 'depression',
      subtopic: 'behavioral activation',
      population: 'adults',
      clinical_goal: 'increase engagement',
      content: 'Full content text.',
      short_summary: 'Summary',
      tags: ['depression', 'activation'],
      source_name: 'CBT Guide',
      source_type: 'clinical_psychoeducation',
      license_status: 'public_domain_educational',
      safety_notes: 'Monitor for suicidal ideation.',
      contraindications: 'Severe depression',
      language: 'en',
      priority_score: 8,
      is_active: false,
    };
    const result = validateRecord(full, 0);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── 5. validateRecord — missing required fields ───────────────────────────────

describe('validateRecord — missing required fields', () => {
  it('fails when title is missing', () => {
    const result = validateRecord({ topic: 'anxiety', content: 'C' }, 0);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('"title"'))).toBe(true);
  });

  it('fails when topic is missing', () => {
    const result = validateRecord({ title: 'T', content: 'C' }, 0);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('"topic"'))).toBe(true);
  });

  it('fails when content is missing', () => {
    const result = validateRecord({ title: 'T', topic: 'anxiety' }, 0);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('"content"'))).toBe(true);
  });

  it('fails when title is empty string', () => {
    const result = validateRecord({ title: '   ', topic: 'anxiety', content: 'C' }, 0);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('"title"'))).toBe(true);
  });

  it('reports all missing required fields at once', () => {
    const result = validateRecord({}, 0);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('includes the record index in error messages', () => {
    const result = validateRecord({ topic: 'anxiety', content: 'C' }, 5);
    expect(result.errors[0]).toMatch(/\[5\]/);
  });
});

// ─── 6. validateRecord — invalid language ─────────────────────────────────────

describe('validateRecord — invalid language', () => {
  it('fails for an unrecognised language code', () => {
    const result = validateRecord(makeValidRecord({ language: 'xx' }), 0);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('language'))).toBe(true);
  });

  it('fails for a numeric language value', () => {
    const result = validateRecord(makeValidRecord({ language: 123 }), 0);
    expect(result.valid).toBe(false);
  });

  it('passes for each valid language code', () => {
    for (const lang of VALID_LANGUAGES) {
      const result = validateRecord(makeValidRecord({ language: lang }), 0);
      expect(result.valid).toBe(true);
    }
  });

  it('passes when language is omitted (optional field)', () => {
    const rec = { title: 'T', topic: 'anxiety', content: 'C' };
    const result = validateRecord(rec, 0);
    expect(result.valid).toBe(true);
  });
});

// ─── 7. validateRecord — invalid priority_score ───────────────────────────────

describe('validateRecord — invalid priority_score', () => {
  it('fails when priority_score is below minimum', () => {
    const result = validateRecord(makeValidRecord({ priority_score: -1 }), 0);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('priority_score'))).toBe(true);
  });

  it('fails when priority_score exceeds maximum', () => {
    const result = validateRecord(makeValidRecord({ priority_score: 11 }), 0);
    expect(result.valid).toBe(false);
  });

  it('fails when priority_score is not a number', () => {
    const result = validateRecord(makeValidRecord({ priority_score: 'high' }), 0);
    expect(result.valid).toBe(false);
  });

  it('passes for boundary value 0', () => {
    const result = validateRecord(makeValidRecord({ priority_score: PRIORITY_SCORE_MIN }), 0);
    expect(result.valid).toBe(true);
  });

  it('passes for boundary value 10', () => {
    const result = validateRecord(makeValidRecord({ priority_score: PRIORITY_SCORE_MAX }), 0);
    expect(result.valid).toBe(true);
  });

  it('passes when priority_score is omitted (optional field)', () => {
    const { priority_score: _, ...rec } = makeValidRecord();
    const result = validateRecord(rec, 0);
    expect(result.valid).toBe(true);
  });
});

// ─── 8. validateRecord — non-array tags ───────────────────────────────────────

describe('validateRecord — non-array tags', () => {
  it('fails when tags is a string', () => {
    const result = validateRecord(makeValidRecord({ tags: 'anxiety, panic' }), 0);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('"tags"'))).toBe(true);
  });

  it('fails when tags is a number', () => {
    const result = validateRecord(makeValidRecord({ tags: 5 }), 0);
    expect(result.valid).toBe(false);
  });

  it('fails when tags is an object', () => {
    const result = validateRecord(makeValidRecord({ tags: { a: 1 } }), 0);
    expect(result.valid).toBe(false);
  });

  it('passes when tags is an empty array', () => {
    const result = validateRecord(makeValidRecord({ tags: [] }), 0);
    expect(result.valid).toBe(true);
  });

  it('passes when tags is a non-empty array', () => {
    const result = validateRecord(makeValidRecord({ tags: ['anxiety'] }), 0);
    expect(result.valid).toBe(true);
  });

  it('passes when tags is omitted (optional field)', () => {
    const { tags: _, ...rec } = makeValidRecord();
    const result = validateRecord(rec, 0);
    expect(result.valid).toBe(true);
  });
});

// ─── 9. validateRecord — extra non-Base44 fields ──────────────────────────────

describe('validateRecord — extra non-Base44 fields', () => {
  it('fails when entity_type is present', () => {
    const result = validateRecord(makeValidRecord({ entity_type: 'TrustedCBTChunk' }), 0);
    expect(result.valid).toBe(false);
    expect(result.extraFields).toContain('entity_type');
  });

  it('fails when content_source_type is present', () => {
    const result = validateRecord(makeValidRecord({ content_source_type: 'external_trusted' }), 0);
    expect(result.valid).toBe(false);
    expect(result.extraFields).toContain('content_source_type');
  });

  it('fails when chunk_index is present', () => {
    const result = validateRecord(makeValidRecord({ chunk_index: 0 }), 0);
    expect(result.valid).toBe(false);
    expect(result.extraFields).toContain('chunk_index');
  });

  it('fails when evidence_level is present', () => {
    const result = validateRecord(makeValidRecord({ evidence_level: 'strong' }), 0);
    expect(result.valid).toBe(false);
    expect(result.extraFields).toContain('evidence_level');
  });

  it('lists all extra fields in the error message', () => {
    const result = validateRecord(makeValidRecord({ entity_type: 'T', chunk_index: 0 }), 0);
    expect(result.extraFields).toContain('entity_type');
    expect(result.extraFields).toContain('chunk_index');
  });
});

// ─── 10. validateBatch — all-valid batch ──────────────────────────────────────

describe('validateBatch — all-valid batch', () => {
  it('passes for an array of valid records', () => {
    const batch = [makeValidRecord({ title: 'A' }), makeValidRecord({ title: 'B' })];
    const result = validateBatch(batch);
    expect(result.valid).toBe(true);
    expect(result.validCount).toBe(2);
    expect(result.invalidCount).toBe(0);
  });

  it('passes for a single valid record array', () => {
    const result = validateBatch([makeValidRecord()]);
    expect(result.valid).toBe(true);
  });
});

// ─── 11. validateBatch — mixed batch ──────────────────────────────────────────

describe('validateBatch — mixed valid/invalid batch', () => {
  it('fails when one record has an error', () => {
    const batch = [makeValidRecord(), { topic: 'anxiety', content: 'C' }];
    const result = validateBatch(batch);
    expect(result.valid).toBe(false);
    expect(result.invalidCount).toBe(1);
    expect(result.validCount).toBe(1);
  });

  it('reports correct counts for a batch with multiple errors', () => {
    const batch = [makeValidRecord(), {}, { topic: 'anxiety' }];
    const result = validateBatch(batch);
    expect(result.totalRecords).toBe(3);
    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(2);
  });
});

// ─── 12. validateBatch — counts ───────────────────────────────────────────────

describe('validateBatch — totalRecords', () => {
  it('returns totalRecords equal to array length', () => {
    const batch = [makeValidRecord(), makeValidRecord(), makeValidRecord()];
    const result = validateBatch(batch);
    expect(result.totalRecords).toBe(3);
  });
});

// ─── 13–14. validateBatch — summary messages ──────────────────────────────────

describe('validateBatch — summary messages', () => {
  it('summary starts with "PASS:" when all records are valid', () => {
    const result = validateBatch([makeValidRecord()]);
    expect(result.summary).toMatch(/^PASS:/);
  });

  it('summary starts with "FAIL:" when any record is invalid', () => {
    const result = validateBatch([{}]);
    expect(result.summary).toMatch(/^FAIL:/);
  });

  it('FAIL summary includes error details', () => {
    const result = validateBatch([{ topic: 'anxiety' }]);
    expect(result.summary).toContain('"title"');
  });
});

// ─── 15. validateBatch — non-array input ──────────────────────────────────────

describe('validateBatch — non-array input', () => {
  it('fails gracefully for null input', () => {
    const result = validateBatch(null);
    expect(result.valid).toBe(false);
    expect(result.summary).toMatch(/^FAIL:/);
  });

  it('fails gracefully for a plain object', () => {
    const result = validateBatch({});
    expect(result.valid).toBe(false);
  });

  it('fails gracefully for a string', () => {
    const result = validateBatch('not an array');
    expect(result.valid).toBe(false);
  });
});

// ─── 16–17. Actual batch files ────────────────────────────────────────────────

describe('smoke file — trusted-cbt-batch-1.smoke.base44.json', () => {
  const records = loadBatch('src/data/trusted-cbt-batch-1.smoke.base44.json');

  it('loads as an array', () => {
    expect(Array.isArray(records)).toBe(true);
  });

  it('contains exactly 3 records', () => {
    expect(records.length).toBe(3);
  });

  it('passes batch validation', () => {
    const result = validateBatch(records);
    expect(result.valid).toBe(true);
    expect(result.summary).toMatch(/^PASS:/);
  });
});

describe('full batch file — trusted-cbt-batch-1.base44.json', () => {
  const records = loadBatch('src/data/trusted-cbt-batch-1.base44.json');

  it('loads as an array', () => {
    expect(Array.isArray(records)).toBe(true);
  });

  it('contains exactly 10 records', () => {
    expect(records.length).toBe(10);
  });

  it('passes batch validation', () => {
    const result = validateBatch(records);
    expect(result.valid).toBe(true);
    expect(result.summary).toMatch(/^PASS:/);
  });
});

// ─── 18–19. is_active === false ───────────────────────────────────────────────

describe('is_active constraint', () => {
  it('every record in the full batch has is_active === false', () => {
    const records = loadBatch('src/data/trusted-cbt-batch-1.base44.json');
    for (const [i, rec] of records.entries()) {
      expect(rec.is_active, `record[${i}] "${rec.title}" is_active`).toBe(false);
    }
  });

  it('every record in the smoke file has is_active === false', () => {
    const records = loadBatch('src/data/trusted-cbt-batch-1.smoke.base44.json');
    for (const [i, rec] of records.entries()) {
      expect(rec.is_active, `record[${i}] "${rec.title}" is_active`).toBe(false);
    }
  });
});

// ─── 20. No non-Base44 fields in either file ──────────────────────────────────

describe('no extra non-Base44 fields in batch files', () => {
  it('full batch file has no non-Base44 fields in any record', () => {
    const records = loadBatch('src/data/trusted-cbt-batch-1.base44.json');
    for (const [i, rec] of records.entries()) {
      const result = validateRecord(rec, i);
      expect(result.extraFields, `record[${i}] "${rec.title}" extra fields`).toHaveLength(0);
    }
  });

  it('smoke file has no non-Base44 fields in any record', () => {
    const records = loadBatch('src/data/trusted-cbt-batch-1.smoke.base44.json');
    for (const [i, rec] of records.entries()) {
      const result = validateRecord(rec, i);
      expect(result.extraFields, `record[${i}] "${rec.title}" extra fields`).toHaveLength(0);
    }
  });
});
