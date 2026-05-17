import { describe, it, expect } from 'vitest';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';

describe('chatSessionLanguage.test.js', () => {
  it('injects generated_file for approved marker in English session', () => {
    const messages = [
      { role: 'user', content: 'please send workbook', metadata: { session_language: 'en' } },
      { role: 'assistant', content: JSON.stringify({ assistant_message: 'Sure [FORM:adolescents-cbt-core-en:en]' }) },
    ];

    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file?.form_id).toBe('adolescents-cbt-core-en');
    expect(assistant?.metadata?.generated_file?.language).toBe('en');
  });
});
