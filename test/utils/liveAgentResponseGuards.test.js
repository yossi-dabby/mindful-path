import { describe, expect, it } from 'vitest';
import { hasRawToolCallLeakage } from '../../scripts/live-agent-response-guards.mjs';

describe('live agent response deterministic guards', () => {
  it('detects the Base44 function-call envelope observed in the live Hebrew failure', () => {
    expect(hasRawToolCallLeakage(
      '<function_calls><invoke name="retrieveTherapistMemory"><parameter name="payload">{}</parameter></invoke></function_calls>',
    )).toBe(true);
  });

  it('detects a leaked internal function name without XML markup', () => {
    expect(hasRawToolCallLeakage('Calling retrieveCurriculumUnit with these arguments.')).toBe(true);
  });

  it('detects provider tool results and internal response planning', () => {
    expect(hasRawToolCallLeakage(
      '<function_results><result>No memory found</result></function_results>',
    )).toBe(true);
    expect(hasRawToolCallLeakage('LOCKED_DOMAIN = [WORRY]\nRESPONSE PLAN: formulate first')).toBe(true);
  });

  it('allows an ordinary user-facing therapeutic response', () => {
    expect(hasRawToolCallLeakage('נשמע שהמחשבה חוזרת שוב ושוב ומחזיקה אותך בתוך אותו מעגל.')).toBe(false);
  });
});
