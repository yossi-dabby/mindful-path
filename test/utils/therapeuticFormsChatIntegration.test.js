import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';

describe('therapeuticFormsChatIntegration.test.js', () => {
  const ROOT = path.resolve(process.cwd());
  const chatSource = fs.readFileSync(`${ROOT}/src/pages/Chat.jsx`, 'utf8');

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

  it('supports first-turn Hebrew multi-form request with more than one generated file', () => {
    const messages = [
      { role: 'user', content: 'שלח לי כמה טפסים לילד עם חרדת פרידה', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'בשמחה.' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(Array.isArray(assistant?.metadata?.generated_files)).toBe(true);
    expect(assistant?.metadata?.generated_files?.length).toBeGreaterThan(1);
    expect(assistant?.metadata?.generated_files?.length).toBeLessThanOrEqual(5);
    expect(assistant?.metadata?.generated_files?.every((file) => file.language === 'he')).toBe(true);
  });

  it('answers multi-form capability question accurately in Hebrew', () => {
    const messages = [
      { role: 'user', content: 'האם אתה יכול לשלוח מספר טפסים במקביל או רק טופס אחד בכל פעם', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'אני יכול רק טופס אחד.' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.content).toBe('כן. אני יכול לשלוח כמה טפסים יחד, עד 5 טפסים בתגובה אחת. אם יש קובץ מאוחד מתאים, אעדיף לשלוח אותו במקום להציף בכמה קבצים.');
    expect(assistant?.metadata?.generated_files ?? []).toHaveLength(0);
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

  it('keeps model-facing deterministic candidate context compact and capped', () => {
    expect(chatSource).toContain('const COMPACT_CANDIDATE_LIMIT = MAX_MODEL_CANDIDATE_FORMS;');
    expect(chatSource).toContain('candidate_included: ${compactCandidates.length}');
    expect(chatSource).toContain('[FORM_CANDIDATES]');
  });
});
