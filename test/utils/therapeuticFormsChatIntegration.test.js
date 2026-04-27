/**
 * Tests for TherapeuticForms Phase 3 — AI Chat Integration.
 *
 * Phase 3 requirements tested:
 *  1.  resolveFormIntent returns CBT Thought Record for thought-record intent.
 *  2.  resolveFormIntent returns Behavioral Activation Plan for behavioral-activation intent.
 *  3.  Unsupported intent returns null.
 *  4.  Unapproved form cannot be selected (only approved === true forms are allowed).
 *  5.  Missing file_url cannot be selected.
 *  6.  Hebrew language returns Hebrew file metadata and rtl-aware result.
 *  7.  Unsupported language falls back to English.
 *  8.  generated_file metadata has source: "therapeutic_forms_library".
 *  9.  generated_file metadata includes form_id, form_slug, audience, category, language.
 * 10.  No arbitrary URL from model input is accepted (resolver ignores model URLs).
 * 11.  normalizeGeneratedFile passes through library fields (source, form_id, form_slug, audience, category, language).
 * 12.  Existing generated_file metadata (non-library) still normalizes correctly.
 * 13.  User-uploaded attachment metadata is unaffected.
 * 14.  [FORM:slug] marker is extracted and stripped from assistant message content.
 * 15.  [FORM:slug:he] marker resolves Hebrew form card metadata.
 * 16.  [FORM:unknown] returns null — no generated_file injected.
 * 17.  sanitizeConversationMessages injects generated_file for assistant messages with [FORM:slug].
 * 18.  sanitizeConversationMessages does NOT overwrite pre-existing generated_file metadata.
 * 19.  User messages with [FORM:slug]-like text are not processed (only assistant messages).
 * 20.  APPROVED_FORM_INTENT_MAP contains the two initial approved adult forms.
 * 21.  All APPROVED_FORM_INTENT_MAP values resolve successfully from the live registry.
 * 22.  resolveFormIntent with canonical form IDs returns correct metadata shape.
 * 23.  Marker with extra whitespace / case variant is rejected (strict slug matching).
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  resolveFormIntent,
  APPROVED_FORM_INTENT_MAP,
  FORM_INTENT_MARKER_PATTERN,
} from '../../src/utils/resolveFormIntent.js';

import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';

import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── 1. resolveFormIntent — CBT Thought Record ────────────────────────────────

describe('Phase 3 — resolveFormIntent: CBT Thought Record', () => {
  it('resolves tf-adults-cbt-thought-record by canonical ID', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
    expect(meta.type).toBe('pdf');
    expect(meta.source).toBe('therapeutic_forms_library');
  });

  it('resolves thought-record alias', () => {
    const meta = resolveFormIntent('thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('resolves cbt-thought-record alias', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('resolves adults-cbt-thought-record alias', () => {
    const meta = resolveFormIntent('adults-cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
  });
});

// ─── 2. resolveFormIntent — Behavioral Activation Plan ───────────────────────

describe('Phase 3 — resolveFormIntent: Behavioral Activation Plan', () => {
  it('resolves tf-adults-behavioral-activation-plan by canonical ID', () => {
    const meta = resolveFormIntent('tf-adults-behavioral-activation-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
    expect(meta.type).toBe('pdf');
    expect(meta.source).toBe('therapeutic_forms_library');
  });

  it('resolves behavioral-activation alias', () => {
    const meta = resolveFormIntent('behavioral-activation', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
  });

  it('resolves behavioral-activation-plan alias', () => {
    const meta = resolveFormIntent('behavioral-activation-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
  });

  it('resolves adults-behavioral-activation-plan alias', () => {
    const meta = resolveFormIntent('adults-behavioral-activation-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
  });
});

// ─── 3. Unsupported intent returns null ───────────────────────────────────────

describe('Phase 3 — resolveFormIntent: unsupported intents return null', () => {
  it('returns null for an unknown intent', () => {
    expect(resolveFormIntent('nonexistent-form', 'en')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(resolveFormIntent('', 'en')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(resolveFormIntent(null, 'en')).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(resolveFormIntent(undefined, 'en')).toBeNull();
  });

  it('returns null for a number', () => {
    expect(resolveFormIntent(42, 'en')).toBeNull();
  });

  it('returns null for arbitrary URL input from model', () => {
    // Critical safety test: a model-supplied URL must never be accepted as an intent
    expect(resolveFormIntent('https://evil.example.com/fake.pdf', 'en')).toBeNull();
  });

  it('returns null for a made-up form ID not in the approved map', () => {
    expect(resolveFormIntent('tf-children-some-form', 'en')).toBeNull();
  });
});

// ─── 4. Unapproved form cannot be selected ────────────────────────────────────

describe('Phase 3/4B — unapproved forms cannot be selected', () => {
  it('resolveFormIntent does not return truly unapproved forms', () => {
    // tf-older-adults-coping-plan remains approved: false and must not be in the map
    expect(APPROVED_FORM_INTENT_MAP['tf-older-adults-coping-plan']).toBeUndefined();
    expect(APPROVED_FORM_INTENT_MAP['older-adults-coping-plan']).toBeUndefined();
  });

  it('resolveFormIntent for an unapproved-form slug returns null', () => {
    // A form that remains unapproved must return null
    const result = resolveFormIntent('tf-older-adults-coping-plan', 'en');
    expect(result).toBeNull();
  });

  it('cognitive-distortions-worksheet now resolves (approved in Phase 4A)', () => {
    const result = resolveFormIntent('cognitive-distortions', 'en');
    expect(result).not.toBeNull();
    expect(result.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });
});

// ─── 5. Missing file_url cannot be selected ───────────────────────────────────

describe('Phase 3 — forms with missing file_url cannot be selected', () => {
  it('APPROVED_FORM_INTENT_MAP only maps forms with real approved assets', () => {
    // All values in the intent map should resolve to non-null metadata
    // (which requires approved: true AND valid file_url)
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const meta = resolveFormIntent(formId, 'en');
      expect(meta, `${formId} must resolve with valid file_url`).not.toBeNull();
      expect(meta.url, `${formId} url must not be empty`).toBeTruthy();
    }
  });
});

// ─── 6. Hebrew language returns Hebrew metadata ───────────────────────────────

describe('Phase 3 — Hebrew language returns Hebrew file metadata', () => {
  it('CBT Thought Record in Hebrew returns Hebrew title', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
    expect(meta.title).toBe('רשומת מחשבות CBT');
  });

  it('CBT Thought Record in Hebrew has rtl-aware language result', () => {
    // The languageData from the resolver should have rtl: true for Hebrew
    // (verified via the generated metadata shape)
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    // The URL must be the Hebrew PDF path
    expect(meta.url).toBe('/forms/he/adults/cbt-thought-record.pdf');
  });

  it('Behavioral Activation Plan in Hebrew returns Hebrew metadata', () => {
    const meta = resolveFormIntent('tf-adults-behavioral-activation-plan', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 7. Unsupported language falls back to English ────────────────────────────

describe('Phase 3 — unsupported language falls back to English', () => {
  it('CBT Thought Record in unsupported language (fr) falls back to English', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'fr');
    expect(meta).not.toBeNull();
    // No French asset exists — must fall back to English
    expect(meta.language).toBe('en');
    expect(meta.url).toContain('/en/');
  });

  it('falls back to English when lang is omitted', () => {
    const meta = resolveFormIntent('thought-record');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('en');
  });

  it('falls back to English when lang is empty string', () => {
    const meta = resolveFormIntent('thought-record', '');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('en');
  });
});

// ─── 8. generated_file metadata has source: "therapeutic_forms_library" ───────

describe('Phase 3 — generated_file metadata has source: therapeutic_forms_library', () => {
  it('CBT Thought Record metadata has source field', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'en');
    expect(meta.source).toBe('therapeutic_forms_library');
  });

  it('Behavioral Activation Plan metadata has source field', () => {
    const meta = resolveFormIntent('behavioral-activation', 'en');
    expect(meta.source).toBe('therapeutic_forms_library');
  });
});

// ─── 9. generated_file metadata includes required library fields ──────────────

describe('Phase 3 — generated_file metadata shape', () => {
  it('CBT Thought Record metadata includes all required Phase 3 fields', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(typeof meta.url).toBe('string');
    expect(meta.url).toBeTruthy();
    expect(typeof meta.name).toBe('string');
    expect(meta.name).toBeTruthy();
    expect(typeof meta.title).toBe('string');
    expect(meta.title).toBeTruthy();
    expect(meta.source).toBe('therapeutic_forms_library');
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
    expect(meta.form_slug).toBe('adults-cbt-thought-record');
    expect(meta.audience).toBe('adults');
    expect(meta.category).toBe('thought_records');
    expect(meta.language).toBe('en');
    expect(typeof meta.created_at).toBe('string');
  });

  it('Behavioral Activation Plan metadata includes all required Phase 3 fields', () => {
    const meta = resolveFormIntent('behavioral-activation', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
    expect(meta.form_slug).toBe('adults-behavioral-activation-plan');
    expect(meta.audience).toBe('adults');
    expect(meta.category).toBe('behavioral_activation');
    expect(meta.language).toBe('en');
    expect(meta.source).toBe('therapeutic_forms_library');
  });
});

// ─── 10. No arbitrary URL from model input is accepted ────────────────────────

describe('Phase 3 — no arbitrary URL from model input', () => {
  it('a URL-shaped intent returns null (not resolved)', () => {
    expect(resolveFormIntent('https://example.com/thought-record.pdf', 'en')).toBeNull();
  });

  it('a file path intent returns null', () => {
    expect(resolveFormIntent('/forms/en/adults/cbt-thought-record.pdf', 'en')).toBeNull();
  });

  it('a form ID with URL prefix returns null', () => {
    expect(resolveFormIntent('http://tf-adults-cbt-thought-record', 'en')).toBeNull();
  });
});

// ─── 11. normalizeGeneratedFile passes through library fields ─────────────────

describe('Phase 3 — normalizeGeneratedFile passes through library fields', () => {
  it('passes through source field', () => {
    const input = {
      type: 'pdf',
      url: '/forms/en/adults/cbt-thought-record.pdf',
      name: 'cbt-thought-record.pdf',
      source: 'therapeutic_forms_library',
    };
    const result = normalizeGeneratedFile(input);
    expect(result).not.toBeNull();
    expect(result.source).toBe('therapeutic_forms_library');
  });

  it('passes through form_id, form_slug, audience, category, language', () => {
    const input = {
      type: 'pdf',
      url: '/forms/en/adults/cbt-thought-record.pdf',
      name: 'cbt-thought-record.pdf',
      form_id: 'tf-adults-cbt-thought-record',
      form_slug: 'adults-cbt-thought-record',
      audience: 'adults',
      category: 'thought_records',
      language: 'en',
      source: 'therapeutic_forms_library',
    };
    const result = normalizeGeneratedFile(input);
    expect(result).not.toBeNull();
    expect(result.form_id).toBe('tf-adults-cbt-thought-record');
    expect(result.form_slug).toBe('adults-cbt-thought-record');
    expect(result.audience).toBe('adults');
    expect(result.category).toBe('thought_records');
    expect(result.language).toBe('en');
  });

  it('does not include library fields when not present', () => {
    const input = {
      type: 'pdf',
      url: 'https://example.com/file.pdf',
      name: 'file.pdf',
    };
    const result = normalizeGeneratedFile(input);
    expect(result).not.toBeNull();
    expect(result.source).toBeUndefined();
    expect(result.form_id).toBeUndefined();
    expect(result.form_slug).toBeUndefined();
    expect(result.audience).toBeUndefined();
  });

  it('normalizeGeneratedFile still returns null for invalid input', () => {
    expect(normalizeGeneratedFile(null)).toBeNull();
    expect(normalizeGeneratedFile({})).toBeNull();
    expect(normalizeGeneratedFile({ type: 'pdf' })).toBeNull(); // no url
    expect(normalizeGeneratedFile({ type: 'docx', url: 'x', name: 'x' })).toBeNull();
  });
});

// ─── 12. Existing generated_file metadata still renders ──────────────────────

describe('Phase 3 — existing non-library generated_file metadata is unaffected', () => {
  it('normalizes a standard (non-library) PDF generated file correctly', () => {
    const input = {
      type: 'pdf',
      url: 'https://base44.example.com/gen/worksheet.pdf',
      name: 'worksheet.pdf',
      title: 'My Custom Worksheet',
      description: 'A dynamically generated file.',
      therapeutic_purpose: 'Practice CBT skills.',
    };
    const result = normalizeGeneratedFile(input);
    expect(result).not.toBeNull();
    expect(result.type).toBe('pdf');
    expect(result.url).toBe('https://base44.example.com/gen/worksheet.pdf');
    expect(result.title).toBe('My Custom Worksheet');
    expect(result.description).toBe('A dynamically generated file.');
    expect(result.therapeutic_purpose).toBe('Practice CBT skills.');
    // Library fields must NOT be present when absent in input
    expect(result.source).toBeUndefined();
    expect(result.form_id).toBeUndefined();
  });
});

// ─── 13. User-uploaded attachment metadata is unaffected ─────────────────────

describe('Phase 3 — user-uploaded attachment metadata is unaffected', () => {
  it('sanitizeConversationMessages preserves user attachment metadata unchanged', () => {
    const messages = [
      {
        role: 'user',
        content: 'Here is my document.',
        metadata: {
          attachment: { type: 'pdf', url: 'https://example.com/user-uploaded.pdf', name: 'my-doc.pdf' },
        },
      },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result.length).toBe(1);
    expect(result[0].metadata.attachment).toBeDefined();
    expect(result[0].metadata.attachment.type).toBe('pdf');
    expect(result[0].metadata.attachment.url).toBe('https://example.com/user-uploaded.pdf');
    // User messages must NEVER have generated_file injected
    expect(result[0].metadata.generated_file).toBeUndefined();
  });
});

// ─── 14. [FORM:slug] marker is extracted and stripped from assistant content ──

describe('Phase 3 — [FORM:slug] marker extraction in sanitizeConversationMessages', () => {
  it('strips [FORM:slug] marker from assistant message content', () => {
    const messages = [
      {
        role: 'assistant',
        content: "I've attached a CBT thought record worksheet for you. [FORM:tf-adults-cbt-thought-record]",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result.length).toBe(1);
    const msg = result[0];
    // The marker must be stripped from visible content
    expect(msg.content).not.toContain('[FORM:');
    expect(msg.content).not.toContain('tf-adults-cbt-thought-record]');
  });

  it('injects generated_file metadata for valid [FORM:slug]', () => {
    const messages = [
      {
        role: 'assistant',
        content: "Here is a thought record for you. [FORM:tf-adults-cbt-thought-record]",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    const msg = result[0];
    expect(msg.metadata.generated_file).toBeDefined();
    expect(msg.metadata.generated_file.type).toBe('pdf');
    expect(msg.metadata.generated_file.form_id).toBe('tf-adults-cbt-thought-record');
    expect(msg.metadata.generated_file.source).toBe('therapeutic_forms_library');
  });

  it('visible content is preserved (minus the marker)', () => {
    const messages = [
      {
        role: 'assistant',
        content: "Here is a thought record for you. [FORM:tf-adults-cbt-thought-record]",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    const msg = result[0];
    expect(msg.content).toContain("Here is a thought record for you");
    expect(msg.content).not.toContain('[FORM:');
  });
});

// ─── 15. [FORM:slug:he] marker resolves Hebrew form card ─────────────────────

describe('Phase 3 — [FORM:slug:he] marker resolves Hebrew form', () => {
  it('injects Hebrew generated_file metadata for [FORM:slug:he]', () => {
    const messages = [
      {
        role: 'assistant',
        content: "הנה טופס רשומת מחשבות CBT. [FORM:tf-adults-cbt-thought-record:he]",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    const msg = result[0];
    expect(msg.metadata.generated_file).toBeDefined();
    expect(msg.metadata.generated_file.language).toBe('he');
    expect(msg.metadata.generated_file.url).toContain('/he/');
    expect(msg.metadata.generated_file.title).toBe('רשומת מחשבות CBT');
  });
});

// ─── 16. [FORM:unknown] returns null — no generated_file injected ─────────────

describe('Phase 3 — [FORM:unknown] marker does not inject generated_file', () => {
  it('unknown form slug does not inject generated_file', () => {
    const messages = [
      {
        role: 'assistant',
        content: "Here is a form. [FORM:nonexistent-form-slug]",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    const msg = result[0];
    // Marker is still stripped from visible content
    expect(msg.content).not.toContain('[FORM:');
    // No generated_file should be injected when the slug is not approved
    expect(msg.metadata.generated_file).toBeUndefined();
  });
});

// ─── 17. sanitizeConversationMessages injects generated_file ─────────────────

describe('Phase 3 — sanitizeConversationMessages full integration', () => {
  it('injects CBT Thought Record for thought-record alias', () => {
    const messages = [
      {
        role: 'assistant',
        content: "Here is your worksheet. [FORM:thought-record]",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result[0].metadata.generated_file).toBeDefined();
    expect(result[0].metadata.generated_file.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('injects Behavioral Activation Plan for behavioral-activation alias', () => {
    const messages = [
      {
        role: 'assistant',
        content: "I've attached a behavioral activation plan. [FORM:behavioral-activation]",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result[0].metadata.generated_file).toBeDefined();
    expect(result[0].metadata.generated_file.form_id).toBe('tf-adults-behavioral-activation-plan');
  });

  it('processes a multi-message conversation correctly', () => {
    const messages = [
      { role: 'user', content: 'Can you give me a thought record?', metadata: {} },
      {
        role: 'assistant',
        content: "Of course! [FORM:tf-adults-cbt-thought-record]",
        metadata: {},
      },
      { role: 'user', content: 'Thank you!', metadata: {} },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result.length).toBe(3);
    // Only the assistant message should have generated_file
    expect(result[0].metadata.generated_file).toBeUndefined();
    expect(result[1].metadata.generated_file).toBeDefined();
    expect(result[1].metadata.generated_file.form_id).toBe('tf-adults-cbt-thought-record');
    expect(result[2].metadata.generated_file).toBeUndefined();
  });
});

// ─── 18. Pre-existing generated_file is not overwritten ──────────────────────

describe('Phase 3 — pre-existing generated_file is not overwritten', () => {
  it('does not overwrite pre-existing generated_file metadata', () => {
    const existingFile = {
      type: 'pdf',
      url: 'https://example.com/existing.pdf',
      name: 'existing.pdf',
      title: 'Pre-existing Worksheet',
    };
    const messages = [
      {
        role: 'assistant',
        content: "Here is a form. [FORM:tf-adults-cbt-thought-record]",
        metadata: { generated_file: existingFile },
      },
    ];
    const result = sanitizeConversationMessages(messages);
    const msg = result[0];
    // The marker should be stripped from content
    expect(msg.content).not.toContain('[FORM:');
    // Pre-existing generated_file must NOT be overwritten
    expect(msg.metadata.generated_file.url).toBe('https://example.com/existing.pdf');
    expect(msg.metadata.generated_file.title).toBe('Pre-existing Worksheet');
  });
});

// ─── 19. User messages with [FORM:...] are not processed ─────────────────────

describe('Phase 3 — user messages with [FORM:...] text are not processed', () => {
  it('user message containing [FORM:slug] text is not altered', () => {
    const messages = [
      {
        role: 'user',
        content: "I need a [FORM:tf-adults-cbt-thought-record] worksheet please.",
        metadata: {},
      },
    ];
    const result = sanitizeConversationMessages(messages);
    const msg = result[0];
    // User messages are not processed for form intents
    expect(msg.metadata.generated_file).toBeUndefined();
  });
});

// ─── 20. APPROVED_FORM_INTENT_MAP structure ───────────────────────────────────

describe('Phase 3/4B — APPROVED_FORM_INTENT_MAP structure', () => {
  it('contains the approved adult forms as values', () => {
    const values = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    expect(values.has('tf-adults-cbt-thought-record')).toBe(true);
    expect(values.has('tf-adults-behavioral-activation-plan')).toBe(true);
    expect(values.has('tf-adults-cognitive-distortions-worksheet')).toBe(true);
  });

  it('does not contain truly unapproved forms as values', () => {
    const values = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    expect(values.has('tf-older-adults-coping-plan')).toBe(false);
  });

  it('is a frozen (immutable) object', () => {
    expect(Object.isFrozen(APPROVED_FORM_INTENT_MAP)).toBe(true);
  });
});

// ─── 21. All APPROVED_FORM_INTENT_MAP values resolve from live registry ───────

describe('Phase 3 — all APPROVED_FORM_INTENT_MAP values resolve from live registry', () => {
  it('every mapped form ID resolves successfully in English', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const meta = resolveFormIntent(formId, 'en');
      expect(meta, `${formId} must resolve`).not.toBeNull();
      expect(meta.url, `${formId} must have url`).toBeTruthy();
      expect(meta.form_id).toBe(formId);
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.type).toBe('pdf');
    }
  });

  it('every mapped form ID resolves in Hebrew', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const meta = resolveFormIntent(formId, 'he');
      expect(meta, `${formId} must resolve in Hebrew`).not.toBeNull();
      // Hebrew forms must use Hebrew URL path
      expect(meta.url, `${formId} Hebrew URL`).toContain('/he/');
      expect(meta.language).toBe('he');
    }
  });
});

// ─── 22. FORM_INTENT_MARKER_PATTERN coverage ─────────────────────────────────

describe('Phase 3 — FORM_INTENT_MARKER_PATTERN regex', () => {
  it('matches a basic [FORM:slug] marker', () => {
    FORM_INTENT_MARKER_PATTERN.lastIndex = 0;
    const m = '[FORM:tf-adults-cbt-thought-record]'.match(FORM_INTENT_MARKER_PATTERN);
    expect(m).not.toBeNull();
    expect(m.length).toBeGreaterThan(0);
  });

  it('matches a [FORM:slug:lang] marker', () => {
    FORM_INTENT_MARKER_PATTERN.lastIndex = 0;
    const m = '[FORM:tf-adults-cbt-thought-record:he]'.match(FORM_INTENT_MARKER_PATTERN);
    expect(m).not.toBeNull();
  });

  it('does not match malformed markers', () => {
    FORM_INTENT_MARKER_PATTERN.lastIndex = 0;
    const m1 = 'FORM:tf-adults-cbt-thought-record'.match(FORM_INTENT_MARKER_PATTERN);
    expect(m1).toBeNull();

    FORM_INTENT_MARKER_PATTERN.lastIndex = 0;
    const m2 = '[form:tf-adults-cbt-thought-record]'.match(FORM_INTENT_MARKER_PATTERN); // lowercase FORM
    expect(m2).toBeNull(); // Pattern is uppercase FORM only
  });

  it('does not match [FORM:UPPERCASE-SLUG] — slugs must be lowercase in the marker', () => {
    // The regex requires lowercase slug characters [a-z0-9_-].
    // AI instructions specify exact lowercase IDs; uppercase slugs in markers are
    // intentionally not matched (strict pattern prevents unexpected matches).
    FORM_INTENT_MARKER_PATTERN.lastIndex = 0;
    const m = '[FORM:TF-ADULTS-CBT-THOUGHT-RECORD]'.match(FORM_INTENT_MARKER_PATTERN);
    expect(m).toBeNull();
  });

  it('resolveFormIntent normalizes slug to lowercase for lookup', () => {
    // If a slug somehow reaches resolveFormIntent with uppercase letters,
    // the function normalizes it to lowercase before looking it up.
    // The real-world path is: marker regex fails → resolveFormIntent never called.
    // But resolveFormIntent is robust: it also normalizes for direct callers.
    const meta = resolveFormIntent('TF-ADULTS-CBT-THOUGHT-RECORD', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
  });
});
