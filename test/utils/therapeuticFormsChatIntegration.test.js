import { describe, it, expect } from 'vitest';
import { validateAgentOutput } from '../../src/components/utils/validateAgentOutput.jsx';

describe('therapeuticFormsChatIntegration.test.js — zero installed forms', () => {
  it('does not inject generated_file from stale markers when catalog is empty', () => {
    const raw = JSON.stringify({ assistant_message: 'Here you go [FORM:tf-adults-cbt-thought-record:en]' });
    const result = validateAgentOutput(raw);
    expect(result.assistant_message).toContain('Here you go');
    expect(result?.metadata?.generated_file ?? null).toBeNull();
  });
});
