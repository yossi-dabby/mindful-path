import { describe, it, expect } from 'vitest';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';

describe('chatSessionLanguage.test.js — zero installed forms', () => {
  it('does not inject generated_file from [FORM:] markers when catalog is empty', () => {
    const messages = [
      { role: 'user', content: 'please send worksheet', metadata: { session_language: 'en' } },
      { role: 'assistant', content: JSON.stringify({ assistant_message: 'Sure [FORM:tf-adults-cbt-thought-record:en]' }) },
    ];

    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file ?? null).toBeNull();
  });
});
