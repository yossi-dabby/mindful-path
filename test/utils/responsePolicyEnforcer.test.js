import { describe, it, expect } from 'vitest';
import { enforceResponsePolicy } from '../../src/lib/responsePolicyEnforcer.js';

const basePolicy = {
  policy_version: 'response_policy_v1',
  policy_available: true,
  action_permitted: false,
  intervention_mode: 'structured_exploration',
  safety_override_required: false,
  status: 'pending',
  scope_match: true,
};

describe('responsePolicyEnforcer', () => {
  it('leaves response unchanged when action is permitted', () => {
    const result = enforceResponsePolicy({
      content: 'You could tell me more about what stood out.',
      policy: { ...basePolicy, action_permitted: true },
    });
    expect(result.content).toBe('You could tell me more about what stood out.');
    expect(result.replaced).toBe(false);
  });

  it('allows validation and exploration when action is not permitted', () => {
    const result = enforceResponsePolicy({
      content: 'It sounds painful, and I want to understand what felt heaviest about it for you.',
      policy: basePolicy,
    });
    expect(result.replaced).toBe(false);
    expect(result.diagnostics.violation_detected).toBe(false);
  });

  it('replaces Hebrew concrete directives', () => {
    const result = enforceResponsePolicy({
      content: 'כדאי שתכתבי לו עכשיו הודעה ותשלחי אותה.',
      policy: basePolicy,
      locale: 'he',
    });
    expect(result.replaced).toBe(true);
    expect(result.content).toContain('מה הכי חשוב');
  });

  it('replaces English concrete directives and suppresses forms', () => {
    const result = enforceResponsePolicy({
      content: 'Try writing the message now. [FORM:test]',
      metadata: { generated_file: { id: 'f1' }, generated_files: [{ id: 'f1' }] },
      policy: basePolicy,
    });
    expect(result.replaced).toBe(true);
    expect(result.metadata.generated_file).toBeUndefined();
    expect(result.diagnostics.violation_reason_codes).toContain('form_marker');
  });

  it('preserves mandatory safety guidance', () => {
    const result = enforceResponsePolicy({
      content: 'If you are in immediate danger, call emergency services now.',
      policy: { ...basePolicy, safety_override_required: true },
    });
    expect(result.replaced).toBe(false);
  });

  it('fails open when policy is unavailable', () => {
    const result = enforceResponsePolicy({
      content: 'Try taking three breaths.',
      policy: { ...basePolicy, policy_available: false },
    });
    expect(result.replaced).toBe(false);
    expect(result.diagnostics.policy_available).toBe(false);
  });
});
