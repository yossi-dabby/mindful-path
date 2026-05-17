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
});
