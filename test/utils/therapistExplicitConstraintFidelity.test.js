/**
 * Regression coverage for explicit intervention output constraints.
 */

import { describe, expect, it } from 'vitest';
import { THERAPIST_PLANNER_FIRST_INSTRUCTIONS } from '../../src/lib/therapistWorkflowEngine.js';
import { buildActionFirstDemotedSessionContentAsync } from '../../src/lib/workflowContextInjector.js';

function constraintSection(instructions) {
  const start = instructions.indexOf('--- EXPLICIT INTERVENTION OUTPUT CONSTRAINTS ---');
  const end = instructions.indexOf('--- COMPETING-HYPOTHESES DIFFERENTIATION', start);
  if (start < 0 || end <= start) {
    throw new Error('Explicit intervention output constraint section is missing');
  }
  return instructions.slice(start, end);
}

describe('explicit intervention constraint fidelity', () => {
  const policy = constraintSection(THERAPIST_PLANNER_FIRST_INSTRUCTIONS);

  it.each([
    'Give me exactly ONE concrete action, one sentence explaining why it fits, and no follow-up question.',
    'תן לי בדיוק פעולה מעשית אחת, משפט אחד שמסביר למה היא מתאימה, ובלי שאלת המשך.',
  ])('applies the same exact-output contract for multilingual requests: %s', (_request) => {
    expect(policy).toContain('Apply this policy in every language');
    expect(policy).toContain('exactly one concrete action');
    expect(policy).toContain('exactly one rationale sentence');
    expect(policy).toContain('no follow-up question, ask none');
  });

  it('forbids turning one action into a menu or concealed extra steps', () => {
    expect(policy).toContain('Do NOT add alternatives, examples, optional variants, or hidden additional steps');
    expect(policy).toContain('do NOT reinterpret one requested action as permission to provide a menu');
  });

  it('preserves bounded duration, energy, concentration, and response counts', () => {
    expect(policy).toContain('duration, energy, concentration, number of actions');
    expect(policy).toContain('number of rationale sentences, and follow-up questions');
  });

  it('makes the latest explicit correction authoritative', () => {
    expect(policy).toContain('latest explicit user output constraint overrides');
    expect(policy).toContain('follow the latest explicit constraint');
    expect(policy).toContain('do not preserve a conflicting earlier format');
  });

  it('keeps readiness, formulation, grounding, quality, and safety precedence intact', () => {
    expect(policy).toContain('only after existing readiness, grounding');
    expect(policy).toContain('formulation, pacing, and therapeutic-quality requirements permit it');
    expect(policy).toContain('They never create permission to intervene');
    expect(policy).toContain('Crisis and safety behavior retains strict precedence');
  });

  it('is present in the active universal therapist instruction path', async () => {
    const content = await buildActionFirstDemotedSessionContentAsync(
      { name: 'cbt_therapist' },
      {},
      null,
    );
    expect(content).toContain(policy);
  });
});
