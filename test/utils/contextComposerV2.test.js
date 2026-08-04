import { describe, it, expect } from 'vitest';
import {
  CONTEXT_COMPOSER_V2_BUDGET_CHARS,
  CONTEXT_COMPOSER_V2_OMISSION_REASONS,
  createContextComposerV2,
} from '../../src/lib/contextComposerV2.js';

describe('contextComposerV2', () => {
  it('returns immutable structured sections in explicit order', () => {
    const composer = createContextComposerV2({ budget_chars: 500 });
    composer.registerSection({ id: 'b', order: 20, retention_priority: 20, required: false, source_layer: 'x', content: 'B' });
    composer.registerSection({ id: 'a', order: 10, retention_priority: 10, required: true, source_layer: 'x', content: 'A' });
    const result = composer.finalize();
    expect(result.rendered).toBe('A

B');
    expect(result.sections.map((section) => section.id)).toEqual(['a', 'b']);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.sections[0])).toBe(true);
  });

  it('rejects duplicate ids without duplicate output', () => {
    const composer = createContextComposerV2();
    composer.registerSection({ id: 'a', order: 10, retention_priority: 10, required: true, source_layer: 'x', content: 'A' });
    expect(() => composer.registerSection({ id: 'a', order: 20, retention_priority: 20, required: false, source_layer: 'x', content: 'B' })).toThrow(/Duplicate/);
  });

  it('drops lowest-priority optional sections first and never partially truncates sections', () => {
    const composer = createContextComposerV2({ budget_chars: 8 });
    composer.registerSection({ id: 'req', order: 10, retention_priority: 100, required: true, source_layer: 'x', content: 'REQ' });
    composer.registerSection({ id: 'low', order: 20, retention_priority: 1, required: false, source_layer: 'x', content: 'LOW' });
    composer.registerSection({ id: 'high', order: 30, retention_priority: 9, required: false, source_layer: 'x', content: 'HIGH' });
    const result = composer.finalize();
    expect(result.rendered).toBe('REQ');
    expect(result.sections.find((section) => section.id === 'low').omission_reason).toBe(CONTEXT_COMPOSER_V2_OMISSION_REASONS.budget);
    expect(result.sections.find((section) => section.id === 'high').omission_reason).toBe(CONTEXT_COMPOSER_V2_OMISSION_REASONS.budget);
  });

  it('keeps required sections even when required content alone exceeds budget', () => {
    const composer = createContextComposerV2({ budget_chars: 2 });
    composer.registerSection({ id: 'req', order: 10, retention_priority: 100, required: true, source_layer: 'x', content: 'REQUIRED' });
    const result = composer.finalize();
    expect(result.rendered).toBe('REQUIRED');
    expect(result.diagnostic.budget_exceeded).toBe(true);
  });

  it('can fail open to the already computed legacy output', () => {
    const composer = createContextComposerV2({ budget_chars: CONTEXT_COMPOSER_V2_BUDGET_CHARS });
    composer.registerSection({ id: 'a', order: 10, retention_priority: 10, required: true, source_layer: 'x', content: 'A' });
    const result = composer.finalize({ fallbackRendered: 'LEGACY' });
    expect(result.rendered).toBe('LEGACY');
    expect(result.diagnostic.fallback_used).toBe(true);
    expect(JSON.stringify(result.diagnostic)).not.toContain('A');
  });
});
