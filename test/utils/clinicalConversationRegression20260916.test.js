import { describe, expect, it } from 'vitest';
import {
  detectFormIntent,
  hasExplicitFormAccessRequest,
} from '../../src/data/therapeuticForms/aiFormsAccess.js';
import {
  applyCurrentTurnGroundingGuardToConversationMessages,
  buildClinicalOverreachFallback,
  evaluateCurrentTurnGroundingContractDetailed,
} from '../../src/components/utils/formulationContractGuard.js';
import {
  buildFormulationLedInstructions,
} from '../../src/lib/therapistWorkflowEngine.js';

describe('2026-09-16 clinical conversation regression', () => {
  it('does not let the forms policy hijack a clinical discussion that merely mentions prior CBT tools', () => {
    const clinicalTurn =
      'בטיפול CBT הקודם השתמשנו בדף עבודה ובתרגילים, אבל עכשיו אני רוצה להבין ' +
      'למה אני נמנע ממשימות ומה קורה לי רגשית.';

    expect(hasExplicitFormAccessRequest(clinicalTurn)).toBe(false);
    expect(detectFormIntent(clinicalTurn)).toBeNull();
  });

  it('still routes an explicit current-turn worksheet request', () => {
    const request = 'בבקשה שלח לי דף עבודה לחרדה.';
    expect(hasExplicitFormAccessRequest(request)).toBe(true);
    expect(detectFormIntent(request)).not.toBeNull();
  });

  it.each([
    'עכשיו התמונה מלאה: זה המנגנון עצמו.',
    'אתה מחליט במודע להימנע ולכן הדפוס נשמר.',
    'הטיפול עבד על הסימפטומים אבל לא על המנגנון שמתחת.',
  ])('blocks deterministic clinical overreach: %s', (assistantText) => {
    const evaluation = evaluateCurrentTurnGroundingContractDetailed(
      assistantText,
      'אני שם לב שאני דוחה משימות ומרגיש הקלה כשאני נמנע.'
    );

    expect(evaluation.pass).toBe(false);
    expect(evaluation.reasonCodes).toContain('clinical_overreach_certainty');
    expect(evaluation.rejectedSentenceSnippet).toBeNull();
  });

  it('allows a tentative, multi-factorial formulation', () => {
    const evaluation = evaluateCurrentTurnGroundingContractDetailed(
      'אחת האפשרויות היא שהימנעות נותנת הקלה מיידית, אבל עדיין צריך לבדוק גם מצב רוח, שינה, קשב והתאמת המשימה.',
      'אני שם לב שאני דוחה משימות ומרגיש הקלה כשאני נמנע.'
    );

    expect(evaluation.pass).toBe(true);
  });

  it('replaces overreach with a bounded Hebrew fallback in the visible conversation', () => {
    const rawMessages = [
      { role: 'user', id: 'u1', content: 'אני דוחה משימות ומרגיש הקלה כשאני נמנע.' },
      { role: 'assistant', id: 'a1', content: 'התמונה עכשיו מלאה: זה המנגנון עצמו.' },
    ];
    const finalMessages = [
      { ...rawMessages[0], __rawIndex: 0 },
      { ...rawMessages[1], __rawIndex: 1 },
    ];

    const guarded = applyCurrentTurnGroundingGuardToConversationMessages(
      rawMessages,
      finalMessages,
      { locale: 'he' }
    );

    expect(guarded.messages[1].content).toBe(buildClinicalOverreachFallback('he'));
    expect(guarded.messages[1].metadata.current_turn_grounding_guard_reason_codes)
      .toContain('clinical_overreach_certainty');
  });

  it('injects non-blaming clinical humility into the therapist contract', () => {
    const instructions = buildFormulationLedInstructions();
    expect(instructions).toContain('Clinical humility and non-blaming formulation');
    expect(instructions).toContain('Never claim that the picture is complete');
    expect(instructions).toContain('Do not convert avoidance');
    expect(instructions).toContain('ask what has already been tried');
  });
});
