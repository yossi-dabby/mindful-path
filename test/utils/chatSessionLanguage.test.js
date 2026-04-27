/**
 * Tests for Phase 3B: Chat message session_language metadata + [FORM:] marker resolution.
 *
 * Covers:
 *   1. sanitizeConversationMessages injects `session_language` into user message metadata.
 *   2. Existing metadata is preserved (session_language not overwritten).
 *   3. Hebrew session language resolves [FORM:slug] to Hebrew path.
 *   4. English session language resolves [FORM:slug] to English path.
 *   5. Explicit marker language overrides session language.
 *   6. Unsupported session language falls back to English.
 *   7. Attachment metadata in user messages remains unaffected.
 *   8. Existing generated_file in assistant metadata is not overwritten.
 *   9. normalizeSessionLanguage validates and normalizes language codes.
 *  10. Messages without a [FORM:] marker are unaffected by the resolver.
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeConversationMessages,
  normalizeSessionLanguage,
} from '../../src/components/utils/validateAgentOutput.jsx';

// ─── normalizeSessionLanguage ─────────────────────────────────────────────────

describe('normalizeSessionLanguage', () => {
  it('returns en for undefined', () => {
    expect(normalizeSessionLanguage(undefined)).toBe('en');
  });

  it('returns en for null', () => {
    expect(normalizeSessionLanguage(null)).toBe('en');
  });

  it('returns en for empty string', () => {
    expect(normalizeSessionLanguage('')).toBe('en');
  });

  it('returns en for unsupported language code', () => {
    expect(normalizeSessionLanguage('zz')).toBe('en');
  });

  it('returns he for he', () => {
    expect(normalizeSessionLanguage('he')).toBe('he');
  });

  it('handles BCP-47 tags like he-IL by extracting the primary subtag', () => {
    expect(normalizeSessionLanguage('he-IL')).toBe('he');
  });

  it('normalizes to lowercase', () => {
    expect(normalizeSessionLanguage('HE')).toBe('he');
  });

  it('returns all supported codes unchanged', () => {
    for (const lang of ['en', 'he', 'es', 'fr', 'de', 'it', 'pt']) {
      expect(normalizeSessionLanguage(lang)).toBe(lang);
    }
  });
});

// ─── session_language injection into user messages ────────────────────────────

describe('sanitizeConversationMessages — session_language injection', () => {
  it('injects session_language into plain user message metadata', () => {
    const messages = [{ role: 'user', content: 'Hello', metadata: {} }];
    const result = sanitizeConversationMessages(messages, 'he');
    expect(result[0].metadata.session_language).toBe('he');
  });

  it('injects session_language when metadata is missing entirely', () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const result = sanitizeConversationMessages(messages, 'fr');
    expect(result[0].metadata.session_language).toBe('fr');
  });

  it('defaults to en when no sessionLanguage is passed', () => {
    const messages = [{ role: 'user', content: 'Hello', metadata: {} }];
    const result = sanitizeConversationMessages(messages);
    expect(result[0].metadata.session_language).toBe('en');
  });

  it('does NOT override existing session_language in user message metadata', () => {
    const messages = [
      { role: 'user', content: 'Hello', metadata: { session_language: 'es' } }
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    expect(result[0].metadata.session_language).toBe('es');
  });

  it('preserves all other metadata fields on user message', () => {
    const messages = [
      {
        role: 'user',
        content: 'Hello',
        metadata: { custom_field: 'keep_me', pdf_page_count: 3 }
      }
    ];
    const result = sanitizeConversationMessages(messages, 'de');
    expect(result[0].metadata.custom_field).toBe('keep_me');
    expect(result[0].metadata.pdf_page_count).toBe(3);
    expect(result[0].metadata.session_language).toBe('de');
  });
});

// ─── [FORM:] marker resolution ────────────────────────────────────────────────

const APPROVED_SLUG = 'tf-adults-cbt-thought-record';
const EN_FORM_URL   = '/forms/en/adults/cbt-thought-record.pdf';
const HE_FORM_URL   = '/forms/he/adults/cbt-thought-record.pdf';

describe('sanitizeConversationMessages — [FORM:] resolution in assistant messages', () => {
  it('resolves [FORM:slug] to English when sessionLanguage is en', () => {
    const messages = [
      { role: 'user',      content: 'Please share the form.',   metadata: {} },
      { role: 'assistant', content: `Here is the form: [FORM:${APPROVED_SLUG}]`, metadata: {} }
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.metadata.generated_file).toBeDefined();
    expect(assistantMsg.metadata.generated_file.url).toBe(EN_FORM_URL);
  });

  it('resolves [FORM:slug] to Hebrew when sessionLanguage is he', () => {
    const messages = [
      { role: 'user',      content: 'תשלח לי את הטופס.',        metadata: {} },
      { role: 'assistant', content: `הנה הטופס: [FORM:${APPROVED_SLUG}]`, metadata: {} }
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.metadata.generated_file).toBeDefined();
    expect(assistantMsg.metadata.generated_file.url).toBe(HE_FORM_URL);
  });

  it('explicit marker language overrides session language', () => {
    const messages = [
      { role: 'user',      content: 'Hello.',                   metadata: {} },
      { role: 'assistant', content: `Form here: [FORM:${APPROVED_SLUG}:he]`, metadata: {} }
    ];
    // sessionLanguage is English, but marker says :he
    const result = sanitizeConversationMessages(messages, 'en');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.metadata.generated_file).toBeDefined();
    expect(assistantMsg.metadata.generated_file.url).toBe(HE_FORM_URL);
  });

  it('uses previous user message metadata.session_language when no param given', () => {
    const messages = [
      { role: 'user',      content: 'Hello.', metadata: { session_language: 'he' } },
      { role: 'assistant', content: `Form: [FORM:${APPROVED_SLUG}]`, metadata: {} }
    ];
    // Pass 'en' as sessionLanguage param but user message metadata says 'he'
    // The previous message metadata wins when it is set
    const result = sanitizeConversationMessages(messages, 'en');
    const assistantMsg = result.find(m => m.role === 'assistant');
    // msg.metadata.session_language is undefined on the assistant, so it reads
    // from previousMessage.metadata.session_language = 'he'
    expect(assistantMsg.metadata.generated_file.url).toBe(HE_FORM_URL);
  });

  it('falls back to English for an unsupported sessionLanguage', () => {
    const messages = [
      { role: 'user',      content: 'Hello.',                   metadata: {} },
      { role: 'assistant', content: `Form: [FORM:${APPROVED_SLUG}]`, metadata: {} }
    ];
    const result = sanitizeConversationMessages(messages, 'zz');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.metadata.generated_file.url).toBe(EN_FORM_URL);
  });

  it('strips the [FORM:] marker from the visible assistant message content', () => {
    const messages = [
      { role: 'user',      content: 'Give me the form.',        metadata: {} },
      { role: 'assistant', content: `Here it is. [FORM:${APPROVED_SLUG}]`, metadata: {} }
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.content).not.toMatch(/\[FORM:/);
  });

  it('returns generated_file metadata with correct shape fields', () => {
    const messages = [
      { role: 'user',      content: 'Hi.',                      metadata: {} },
      { role: 'assistant', content: `[FORM:${APPROVED_SLUG}]`,  metadata: {} }
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const gf = result.find(m => m.role === 'assistant').metadata.generated_file;
    expect(gf.type).toBe('pdf');
    expect(gf.source).toBe('therapeutic_forms_library');
    expect(gf.form_id).toBe(APPROVED_SLUG);
    expect(typeof gf.name).toBe('string');
    expect(typeof gf.title).toBe('string');
  });

  it('does NOT override an existing generated_file already present in assistant metadata', () => {
    const existingFile = { type: 'pdf', url: '/existing.pdf', name: 'existing.pdf', title: 'Existing' };
    const messages = [
      { role: 'user',      content: 'Hi.',                      metadata: {} },
      {
        role: 'assistant',
        content: `Here is the form: [FORM:${APPROVED_SLUG}]`,
        metadata: { generated_file: existingFile }
      }
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.metadata.generated_file).toEqual(existingFile);
  });

  it('leaves assistant messages without a [FORM:] marker unchanged', () => {
    const messages = [
      { role: 'user',      content: 'Hello.',         metadata: {} },
      { role: 'assistant', content: 'How are you?',   metadata: {} }
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.metadata.generated_file).toBeUndefined();
  });
});

// ─── Attachment metadata unaffected ──────────────────────────────────────────

describe('sanitizeConversationMessages — attachment metadata unaffected', () => {
  it('preserves attachment metadata on user messages alongside session_language', () => {
    const messages = [
      {
        role: 'user',
        content: 'See attached.',
        metadata: { attachment: { type: 'pdf', url: 'https://example.com/file.pdf', name: 'file.pdf' } }
      }
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    expect(result[0].metadata.attachment).toBeDefined();
    expect(result[0].metadata.attachment.url).toBe('https://example.com/file.pdf');
    expect(result[0].metadata.session_language).toBe('he');
  });

  it('does not set generated_file on assistant messages that have attachment content only', () => {
    const messages = [
      {
        role: 'assistant',
        content: 'Here is my response.',
        metadata: { attachment: { type: 'pdf', url: 'https://example.com/file.pdf' } }
      }
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg.metadata.generated_file).toBeUndefined();
  });
});
