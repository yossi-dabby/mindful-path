import { describe, it, expect } from 'vitest';
import {
  resolveWorkbookIntent,
  resolveWorkbookIntentWithContext,
  resolveEnglishWorkbookIntentWithContext,
  resolveSpanishWorkbookIntentWithContext,
} from '../../src/utils/resolveWorkbookIntent.js';

describe('workbookContextAwareRouting.test.js', () => {
  it('routes English workbook requests to the installed adolescents package and keeps unsupported languages null', () => {
    expect(resolveWorkbookIntent('show me a workbook for teen anxiety and avoidance', 'en')?.form_id).toBe('adolescents-cbt-core-en');
    expect(resolveWorkbookIntent('תן לי קונטרס על מחשבות', 'he')).toBeNull();
    expect(resolveWorkbookIntent('muéstrame un cuaderno para ansiedad', 'es')).toBeNull();
  });

  it('supports English context-aware workbook routing and keeps unsupported languages null', () => {
    expect(resolveEnglishWorkbookIntentWithContext('workbook for this', 'teen panic thoughts and avoidance')?.form_id).toBe('adolescents-cbt-core-en');
    expect(resolveWorkbookIntentWithContext('תן לי קונטרס לזה', 'מחשבות טורדניות', 'he')).toBeNull();
    expect(resolveSpanishWorkbookIntentWithContext('cuaderno para esto', 'pensamientos intrusivos y evitación')).toBeNull();
  });
});
