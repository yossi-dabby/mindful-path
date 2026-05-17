import { describe, it, expect } from 'vitest';
import { validateAgentOutput } from '../../src/components/utils/validateAgentOutput.jsx';

describe('therapeuticFormsChatIntegration.test.js', () => {
  it('injects generated_file from approved marker and rejects stale marker ids', () => {
    const approved = JSON.stringify({ assistant_message: 'Here you go [FORM:adolescents-cbt-core-en:en]' });
    const approvedResult = validateAgentOutput(approved);
    expect(approvedResult?.metadata?.generated_file?.form_id).toBe('adolescents-cbt-core-en');
    expect(approvedResult?.metadata?.generated_file?.url).toBe('/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');

    const stale = JSON.stringify({ assistant_message: 'Here you go [FORM:tf-adults-cbt-thought-record:en]' });
    const staleResult = validateAgentOutput(stale);
    expect(staleResult?.metadata?.generated_file ?? null).toBeNull();
  });
});
