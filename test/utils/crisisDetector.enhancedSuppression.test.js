import { describe, expect, it } from 'vitest';
import {
  detectCrisisLanguage,
  isExplicitCurrentSafetyDenial,
} from '../../src/components/utils/crisisDetector.js';

describe('Layer-2 hard-stop suppression for explicit current-safety denials', () => {
  const observedBoundaryMessage =
    'הערב אני מרגיש מוצף ומתקשה להירגע, אבל אני בטוח ואין לי מחשבות לפגוע בעצמי. אני רוצה עזרה להבין מה מפעיל את החרדה שלי עכשיו.';

  it('suppresses the exact observed false positive while Layer 1 remains safe', () => {
    expect(detectCrisisLanguage(observedBoundaryMessage)).toBe(false);
    expect(isExplicitCurrentSafetyDenial(observedBoundaryMessage)).toBe(true);
  });

  it('does not suppress a direct denial without a current-safety assertion', () => {
    expect(isExplicitCurrentSafetyDenial('אין לי מחשבות לפגוע בעצמי.')).toBe(false);
  });

  it('does not suppress uncertainty about staying safe tonight', () => {
    expect(
      isExplicitCurrentSafetyDenial(
        'אני בטוח ואין לי מחשבות לפגוע בעצמי, אבל אני לא בטוח שאצליח לשמור על עצמי בטוח הלילה.'
      )
    ).toBe(false);
  });

  it('does not suppress a stated plan or available means', () => {
    expect(
      isExplicitCurrentSafetyDenial(
        'אני בטוח ואין לי מחשבות לפגוע בעצמי, אבל יש לי תוכנית ויש לי כדורים.'
      )
    ).toBe(false);
  });

  it('does not suppress a mixed denial followed by affirmative crisis intent', () => {
    expect(
      isExplicitCurrentSafetyDenial(
        'אני בטוח ובדרך כלל אין לי מחשבות לפגוע בעצמי, אבל עכשיו אני רוצה למות.'
      )
    ).toBe(false);
  });

  it('supports the equivalent explicit current-safety boundary in English', () => {
    expect(
      isExplicitCurrentSafetyDenial(
        'I feel overwhelmed tonight, but I am safe and I do not want to harm myself.'
      )
    ).toBe(true);
  });
});
