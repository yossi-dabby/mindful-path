import { describe, it, expect } from 'vitest';
import {
  resolveWorkbookIntent,
  resolveWorkbookIntentWithContext,
  resolveEnglishWorkbookIntentWithContext,
  resolveSpanishWorkbookIntentWithContext,
} from '../../src/utils/resolveWorkbookIntent.js';

describe('workbookRoutingChatIntegration.test.js — zero installed forms', () => {
  it('returns null for workbook routing when catalog is empty', () => {
    expect(resolveWorkbookIntent('תן לי קונטרס על מחשבות', 'he')).toBeNull();
    expect(resolveWorkbookIntent('show me a workbook for anxiety', 'en')).toBeNull();
    expect(resolveWorkbookIntent('muéstrame un cuaderno para ansiedad', 'es')).toBeNull();
  });

  it('returns null for context-aware workbook routing when catalog is empty', () => {
    expect(resolveWorkbookIntentWithContext('תן לי קונטרס לזה', 'מחשבות טורדניות', 'he')).toBeNull();
    expect(resolveEnglishWorkbookIntentWithContext('workbook for this', 'panic thoughts and avoidance')).toBeNull();
    expect(resolveSpanishWorkbookIntentWithContext('cuaderno para esto', 'pensamientos intrusivos y evitación')).toBeNull();
  });
});
