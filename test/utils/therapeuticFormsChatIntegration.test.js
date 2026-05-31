import { describe, it, expect } from 'vitest';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';

describe('therapeuticFormsChatIntegration.test.js', () => {
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

  it('keeps marker fallback active while deterministic path is primary', () => {
    const messages = [
      { role: 'user', content: 'Send worksheet 5.1 from children CBT core', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Sure [FORM:children-cbt-core-en-5-1:en]' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.form_id).toBe('children-cbt-core-en-5-1');
  });
});
