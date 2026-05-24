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
      { role: 'user', content: 'Please share worksheet', metadata: { session_language: 'en' } },
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
    expect(assistant?.metadata?.generated_file ?? null).toBeNull();
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

  it('deterministically attaches a registry form for send-requests even when assistant omits [FORM] marker', () => {
    const messages = [
      { role: 'user', content: 'Send me a child worksheet for anger outbursts', metadata: { session_language: 'en' } },
      { role: 'assistant', content: JSON.stringify({ assistant_message: 'Absolutely — I found a strong match and attached it below.' }) },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    const generated = assistant?.metadata?.generated_file;

    expect(generated).toBeTruthy();
    expect(generated.form_id).toBeTruthy();
    expect(generated.audience).toBe('children');
    expect(generated.language).toBe('en');
    expect(String(generated.url || '')).toContain('/forms/');
  });
});
