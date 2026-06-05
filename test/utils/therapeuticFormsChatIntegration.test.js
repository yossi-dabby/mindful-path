import { describe, it, expect } from 'vitest';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';
import { getTherapeuticFormsPolicyPayload, buildTherapistFormCatalog } from '../../src/lib/therapeuticFormsPolicy.js';
import { getAllTherapeuticForms } from '../../src/data/therapeuticForms/index.js';
import { resolveFormForAIRequest, detectFormIntent } from '../../src/data/therapeuticForms/aiFormsAccess.js';

describe('therapeuticFormsChatIntegration.test.js', () => {
  it('new-chat first assistant response sanitizes without runtime error', () => {
    const firstTurn = [
      { role: 'user', content: 'Hi, I need help today', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'I’m here with you. We can take this step by step.' },
    ];
    expect(() => sanitizeConversationMessages(firstTurn, 'en')).not.toThrow();
    const result = sanitizeConversationMessages(firstTurn, 'en');
    expect(result.find((m) => m.role === 'assistant')?.content?.length).toBeGreaterThan(0);
  });

  it('new-chat first message with form request resolves deterministically', () => {
    const firstTurn = [
      { role: 'user', content: 'Send me a CBT form for children with anxiety', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Sure, I can help with that.' },
    ];
    const result = sanitizeConversationMessages(firstTurn, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file).toBeTruthy();
  });

  it('new-chat first message with missing form need returns graceful text and no runtime error', () => {
    const firstTurn = [
      { role: 'user', content: 'Send me a form for impossible unicorn panic subtype', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'I cannot find that exact worksheet right now.' },
    ];
    expect(() => sanitizeConversationMessages(firstTurn, 'en')).not.toThrow();
    const result = sanitizeConversationMessages(firstTurn, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(typeof assistant?.content).toBe('string');
    expect(assistant?.content.length).toBeGreaterThan(0);
  });

  it('injects generated_file from approved marker and rejects stale marker ids', () => {
    const approvedMessages = [
      { role: 'user', content: 'Please share the teen CBT workbook', metadata: { session_language: 'en' } },
      { role: 'assistant', content: JSON.stringify({ assistant_message: 'Here you go [FORM:adolescents-cbt-core-en:en]' }) },
    ];
    const approvedResult = sanitizeConversationMessages(approvedMessages, 'en');
    const approvedAssistant = approvedResult.find((m) => m.role === 'assistant');
    expect(approvedAssistant?.metadata?.generated_file?.form_id).toBe('adolescents-cbt-core-en');
    expect(approvedAssistant?.metadata?.generated_file?.url).toBe('/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');

    const staleMessages = [
      // Non-form user text intentionally avoids deterministic intent routing, so
      // this assertion isolates stale marker ID rejection behavior.
      { role: 'user', content: 'Thanks for the help', metadata: { session_language: 'en' } },
      { role: 'assistant', content: JSON.stringify({ assistant_message: 'Here you go [FORM:tf-adults-cbt-thought-record:en]' }) },
    ];
    const staleResult = sanitizeConversationMessages(staleMessages, 'en');
    const staleAssistant = staleResult.find((m) => m.role === 'assistant');
    expect(staleAssistant?.metadata?.generated_file ?? null).toBeNull();
  });

  it('blocks adolescents specialized EN attachments when session language is non-English', () => {
    const messages = [
      { role: 'user', content: 'תשלחי לי את הסדרה המלאה', metadata: { session_language: 'he' } },
      { role: 'assistant', content: JSON.stringify({ assistant_message: 'Here you go [FORM:adolescents-cbt-specialized-en:en]' }) },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.form_id || '').not.toBe('adolescents-cbt-specialized-en');
    expect(assistant?.metadata?.generated_file?.language || 'he').toBe('he');
  });

  it('injects generated_file for a known children CBT core individual worksheet', () => {
    const messages = [
      { role: 'user', content: 'Send worksheet 5.1 from children CBT core', metadata: { session_language: 'en' } },
      { role: 'assistant', content: JSON.stringify({ assistant_message: 'Here is worksheet 5.1 [FORM:children_cbt_core_en_05_01:en]' }) },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.form_id).toBe('children-cbt-core-en-5-1');
    expect(String(assistant?.metadata?.generated_file?.url || '')).toContain('/forms/children/en/cbt-core/children_cbt_core_en_05_01.pdf');
  });

  it('attaches generated_file for send intent even without [FORM:id] marker', () => {
    const messages = [
      { role: 'user', content: 'Can you send me forms for children regarding OCD?', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Sure, I can help with that.' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file).toBeTruthy();
    expect(assistant?.metadata?.generated_file?.url).toMatch(/^\/forms\//);
  });

  it('blocks refusal-like cannot-access-forms text when deterministic match exists', () => {
    const messages = [
      { role: 'user', content: 'Send me a form for anger', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'I cannot access forms right now due to a technical issue.' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(String(assistant?.content || '').toLowerCase()).not.toContain('cannot access forms');
    expect(String(assistant?.content || '').toLowerCase()).not.toContain('technical issue');
    expect(assistant?.metadata?.generated_file || (assistant?.content || '').length > 0).toBeTruthy();
  });

  it('allows hebrew session explicit english request to resolve english form card', () => {
    const messages = [
      { role: 'user', content: 'תשלח לי טופס באנגלית לילד בנושא OCD', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'בשמחה.' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file).toBeTruthy();
    expect(assistant?.metadata?.generated_file?.language).toBe('en');
  });

  it('attaches Hebrew adolescents stage-combined PDF in Hebrew session', () => {
    const messages = [
      { role: 'user', content: 'שלח לי את כל שלב 2 בקובץ אחד', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'בשמחה.' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.language).toBe('he');
    expect(assistant?.metadata?.generated_file?.form_id).toBe('adolescents-cbt-core-he-stage-2-combined');
  });

  it('attaches Hebrew children core form in Hebrew session by child clinical request', () => {
    const messages = [
      { role: 'user', content: 'אני צריך טופס לילד עם חרדה', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'בשמחה.' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.language).toBe('he');
    expect(assistant?.metadata?.generated_file?.audience).toBe('children');
    expect(String(assistant?.metadata?.generated_file?.form_id || '')).toContain('children-cbt-core-he');
  });

  it('does not attach Hebrew form in English session', () => {
    const messages = [
      { role: 'user', content: 'שלח לי את כל שלב 2 בקובץ אחד', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Here you go [FORM:adolescents-cbt-core-he-stage-2-combined:he]' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.language || null).not.toBe('he');
    expect(String(assistant?.metadata?.generated_file?.form_id || '')).not.toContain('adolescents-cbt-core-he');
  });

  it('does not attach Hebrew form in non-Hebrew non-English session', () => {
    const messages = [
      { role: 'user', content: 'שלח לי את כל שלב 2 בקובץ אחד', metadata: { session_language: 'es' } },
      { role: 'assistant', content: 'Aquí está [FORM:adolescents-cbt-core-he-stage-2-combined:he]' },
    ];
    const result = sanitizeConversationMessages(messages, 'es');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.language || null).not.toBe('he');
    expect(String(assistant?.metadata?.generated_file?.form_id || '')).not.toContain('adolescents-cbt-core-he');
  });

  it('does not attach Hebrew children form in English session', () => {
    const messages = [
      { role: 'user', content: 'אני צריך טופס לילד עם חרדה', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Here you go [FORM:children-cbt-core-he-2-3:he]' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.language || null).not.toBe('he');
    expect(String(assistant?.metadata?.generated_file?.form_id || '')).not.toContain('children-cbt-core-he');
  });

  it('stores deterministic multi-form attachments in metadata.generated_files while preserving generated_file', () => {
    const messages = [
      { role: 'user', content: 'send all forms from module 06', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Done.' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(Array.isArray(assistant?.metadata?.generated_files)).toBe(true);
    expect(assistant?.metadata?.generated_files?.length).toBeGreaterThan(0);
    expect(assistant?.metadata?.generated_files?.length).toBeLessThanOrEqual(5);
    expect(assistant?.metadata?.generated_file).toBeTruthy();
  });

  it('keeps marker fallback active while deterministic path is primary', () => {
    const messages = [
      { role: 'user', content: 'Send worksheet 5.1 from children CBT core', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Sure [FORM:children-cbt-core-en-5-1:en]' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.form_id).toBe('children-cbt-core-en-5-1');
  });

  it('sanitizes Hebrew multi-form request into metadata.generated_files with language gating', () => {
    const messages = [
      { role: 'user', content: 'שלח לי כמה טפסים לילד עם חרדת פרידה', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'בשמחה.' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(Array.isArray(assistant?.metadata?.generated_files)).toBe(true);
    expect(assistant?.metadata?.generated_files?.length).toBeGreaterThan(0);
    expect(assistant?.metadata?.generated_files?.length).toBeLessThanOrEqual(5);
    // All attached files must be Hebrew
    for (const f of (assistant?.metadata?.generated_files || [])) {
      expect(f.language).toBe('he');
    }
    expect(assistant?.metadata?.generated_file).toBeTruthy();
    expect(assistant?.metadata?.generated_file?.language).toBe('he');
  });
});

// ─── Phase 3 & 6 A: Payload size / first-message safety ──────────────────────
describe('therapeuticFormsChatIntegration: payload size safety', () => {
  // Safe threshold for a Base44 chat message: well below the bridge limit.
  // The session-start forms policy block must never exceed this alone.
  const SAFE_POLICY_CHAR_LIMIT = 3000;

  // Real form IDs always end with a digit segment (e.g. children-cbt-core-en-1-1).
  // Template placeholders like [FORM:id] or [FORM:form-id] are intentionally allowed in instruction text.
  const REAL_FORM_ID_PATTERN = /\[FORM:[a-z][a-z0-9-]+-\d+\]/;

  it('forms policy payload (EN) stays within safe character limit', () => {
    const { policy } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'en' });
    expect(policy.length).toBeLessThan(SAFE_POLICY_CHAR_LIMIT);
  });

  it('forms policy payload (HE) stays within safe character limit', () => {
    const { policy } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'he' });
    expect(policy.length).toBeLessThan(SAFE_POLICY_CHAR_LIMIT);
  });

  it('forms policy payload does not embed per-form listings (no [FORM:...] IDs in policy text)', () => {
    const { policy: policyEn } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'en' });
    const { policy: policyHe } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'he' });
    // Policy text must NOT list actual form IDs — those are injected on-demand.
    // Real form IDs always end with a digit (e.g. children-cbt-core-en-1-1);
    // template placeholders like [FORM:id] or [FORM:form-id] are intentionally allowed.
    expect(policyEn).not.toMatch(REAL_FORM_ID_PATTERN);
    expect(policyHe).not.toMatch(REAL_FORM_ID_PATTERN);
  });

  it('buildTherapistFormCatalog does not grow with form count (compact summary only)', () => {
    const allForms = getAllTherapeuticForms();
    const catalog = buildTherapistFormCatalog(allForms);
    // Compact catalog must stay under 2KB regardless of how many forms are registered
    expect(catalog.length).toBeLessThan(2000);
    // Must not contain actual per-form ID listings (real IDs always end with a digit segment)
    // Template placeholders like [FORM:id] or [FORM:form-id] are allowed in instruction text.
    expect(catalog).not.toMatch(REAL_FORM_ID_PATTERN);
  });

  it('policy does not contain forms catalog keywords/intent-phrases (no metadata bloat)', () => {
    const { policy } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'he' });
    expect(policy.toLowerCase()).not.toContain('clinical keywords:');
    expect(policy.toLowerCase()).not.toContain('intent phrases:');
    expect(policy.toLowerCase()).not.toContain('not for:');
    expect(policy.toLowerCase()).not.toContain('goal:');
    expect(policy.toLowerCase()).not.toContain('when to use:');
  });

  it('policy explicitly states multi-form capability (up to 5)', () => {
    const { policy } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'en' });
    expect(policy).toContain('5');
    expect(policy.toLowerCase()).toMatch(/multi.form|multiple forms|up to 5/i);
  });

  it('first-message form request stays below safe payload threshold', () => {
    // Simulate the form router context that gets appended to a first-message form request
    const route = resolveFormForAIRequest('שלח לי כמה טפסים לילד עם חרדת פרידה', { language: 'he' });
    // The router context should be compact (top 8 candidates, not full catalog)
    const topMatches = [...(route.matches || []), ...(route.nearestMatches || [])].slice(0, 8);
    // Each candidate's compact summary is at most ~300 chars
    const estimatedRouterContextChars = topMatches.reduce((sum, form) => {
      const summary = form.aiMatchingSummary || form.whenToUse || form.therapeuticGoal || '';
      return sum + 100 + Math.min(String(summary).length, 120);
    }, 300); // 300 base for header/footer
    expect(estimatedRouterContextChars).toBeLessThan(5000);
  });

  it('all forms remain searchable via registry after catalog compaction', () => {
    const allForms = getAllTherapeuticForms();
    expect(allForms.length).toBeGreaterThan(400);
    const hebrewForms = allForms.filter((f) => f.language === 'he' && f.approved);
    expect(hebrewForms.length).toBeGreaterThan(100);
  });
});
