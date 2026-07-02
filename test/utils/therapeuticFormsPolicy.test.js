import { describe, it, expect, vi } from 'vitest';
import {
  getAllTherapeuticForms,
  getTherapeuticFormsForAI,
  getTherapeuticFormsPolicyVersion,
} from '../../src/data/therapeuticForms/index.js';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';
import {
  THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER,
  buildTherapeuticFormsPolicyRefreshMessage,
  ensureTherapeuticFormsPolicyInjected,
  extractTherapeuticFormsPolicyVersion,
  getTherapeuticFormsPolicyPayload,
} from '../../src/lib/therapeuticFormsPolicy.js';
import { resolveFormIntent } from '../../src/utils/resolveFormIntent.js';

const CHILDREN_CBT_CORE_EN_WORKSHEET_COUNT = 30;

describe('therapeutic forms policy reliability', () => {
  it('keeps the canonical therapeutic forms registry non-empty for the AI runtime', () => {
    expect(getAllTherapeuticForms().length).toBeGreaterThan(0);
    expect(getTherapeuticFormsForAI({ language: 'en', environment: 'production' }).length).toBeGreaterThan(0);
  });

  it('includes the current policy version marker in the session payload used for new conversations', () => {
    const { policy, policyVersion, diagnostics } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'en' });

    expect(policy).toContain('[THERAPEUTIC_FORMS_POLICY]');
    expect(policy).toContain(`[THERAPEUTIC_FORMS_POLICY_VERSION: ${policyVersion}]`);
    expect(policyVersion).toBe(getTherapeuticFormsPolicyVersion());
    expect(diagnostics.formsCountAvailableToAI).toBeGreaterThan(0);
  });

  it('keeps first-message policy payload compact and avoids embedding the full forms registry', () => {
    const { policy } = getTherapeuticFormsPolicyPayload({ sessionLanguage: 'en' });
    const markerCount = (policy.match(/\[FORM:/g) || []).length;
    expect(policy.length).toBeLessThan(8000);
    expect(markerCount).toBeLessThanOrEqual(10);
    expect(policy).toContain('CURRENTLY APPROVED FORMS SUMMARY');
  });

  it('injects a hidden refresh policy message for an existing conversation that lacks the current version', async () => {
    const addMessage = vi.fn().mockResolvedValue({});
    const cache = new Map();
    const conversation = {
      id: 'conversation-existing',
      messages: [{ role: 'user', content: 'Hello there' }],
    };

    const result = await ensureTherapeuticFormsPolicyInjected({
      base44: { agents: { addMessage } },
      conversation,
      sessionLanguage: 'en',
      isNewConversation: false,
      injectedVersionCache: cache,
    });

    expect(result.injected).toBe(true);
    expect(addMessage).toHaveBeenCalledOnce();
    const injectedContent = addMessage.mock.calls[0][1].content;
    expect(injectedContent.startsWith(THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER)).toBe(true);
    expect(extractTherapeuticFormsPolicyVersion(injectedContent)).toBe(getTherapeuticFormsPolicyVersion());
    expect(cache.get(conversation.id)).toBe(getTherapeuticFormsPolicyVersion());
  });

  it('does not inject the hidden refresh policy again when the current version is already present', async () => {
    const addMessage = vi.fn().mockResolvedValue({});
    const refreshMessage = buildTherapeuticFormsPolicyRefreshMessage({ sessionLanguage: 'en' });
    const conversation = {
      id: 'conversation-current',
      messages: [{ role: 'user', content: refreshMessage.content }],
    };

    const result = await ensureTherapeuticFormsPolicyInjected({
      base44: { agents: { addMessage } },
      conversation,
      sessionLanguage: 'en',
      isNewConversation: false,
      injectedVersionCache: new Map(),
    });

    expect(result.injected).toBe(false);
    expect(addMessage).not.toHaveBeenCalled();
  });

  it('refreshes an older conversation when it only contains a stale policy version', async () => {
    const addMessage = vi.fn().mockResolvedValue({});
    const conversation = {
      id: 'conversation-stale',
      messages: [{
        role: 'user',
        content: `${THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER}\n[THERAPEUTIC_FORMS_POLICY]\n[THERAPEUTIC_FORMS_POLICY_VERSION: stale-version]`,
      }],
    };

    const result = await ensureTherapeuticFormsPolicyInjected({
      base44: { agents: { addMessage } },
      conversation,
      sessionLanguage: 'en',
      isNewConversation: false,
      injectedVersionCache: new Map(),
    });

    expect(result.injected).toBe(true);
    expect(addMessage).toHaveBeenCalledOnce();
  });

  it('keeps the refresh policy hidden from the visible chat transcript', () => {
    const refreshMessage = buildTherapeuticFormsPolicyRefreshMessage({ sessionLanguage: 'en' });
    const sanitized = sanitizeConversationMessages([
      { role: 'user', content: refreshMessage.content },
      { role: 'assistant', content: 'I can help with that.' },
    ], 'en');

    expect(sanitized).toHaveLength(1);
    expect(sanitized[0].role).toBe('assistant');
  });

  it('prevents final assistant replies from falsely claiming there is no access to forms', () => {
    const sanitized = sanitizeConversationMessages([
      { role: 'assistant', content: 'I do not have access to therapeutic forms right now.' },
    ], 'en');

    expect(sanitized[0].content).toContain('installed therapeutic forms catalog');
    expect(sanitized[0].content.toLowerCase()).not.toContain('no access to therapeutic forms');
  });
});

describe('therapeutic forms resolver coverage', () => {
  it('confirms Hebrew children CBT core exposes modules 01-05 for Hebrew sessions only', () => {
    const hebrewChildrenCore = getTherapeuticFormsForAI({ language: 'he', audience: 'children' })
      .filter((form) => form.category === 'children_cbt_core');
    const englishChildrenCore = getTherapeuticFormsForAI({ language: 'en', audience: 'children' })
      .filter((form) => form.id.startsWith('children-cbt-core-he'));
    const spanishChildrenCore = getTherapeuticFormsForAI({ language: 'es', audience: 'children' })
      .filter((form) => form.id.startsWith('children-cbt-core-he'));

    expect(hebrewChildrenCore).toHaveLength(35);
    expect(hebrewChildrenCore.every((form) => form.language === 'he')).toBe(true);
    expect(hebrewChildrenCore.every((form) => /[\u0590-\u05FF]/.test(String(form.title || '')))).toBe(true);
    expect(hebrewChildrenCore.every((form) => !/^children_cbt_core_he_/i.test(String(form.title || '')))).toBe(true);
    expect(new Set(hebrewChildrenCore.map((form) => Number(form.module_number || form.moduleNumber))).size).toBe(5);
    expect(englishChildrenCore).toHaveLength(0);
    expect(spanishChildrenCore).toHaveLength(0);
  });

  it('confirms Children CBT Core English still exposes 30 individual worksheets', () => {
    const childrenCoreWorksheets = getAllTherapeuticForms().filter((form) =>
      form.audience === 'children' &&
      form.language === 'en' &&
      form.id.startsWith('children-cbt-core-en-') &&
      form.type === 'individual_worksheet'
    );

    expect(childrenCoreWorksheets).toHaveLength(CHILDREN_CBT_CORE_EN_WORKSHEET_COUNT);
  });

  it('resolves known children CBT core worksheet aliases', () => {
    expect(resolveFormIntent('children_cbt_core_en_05_01', 'en')?.form_id).toBe('children-cbt-core-en-5-1');
    expect(resolveFormIntent('children_cbt_core_en_04_02', 'en')?.form_id).toBe('children-cbt-core-en-4-2');
  });

  it('resolves therapeutic scenarios to approved children CBT core worksheets', () => {
    const overwhelmed = resolveFormIntent('child feels overwhelmed and needs a calm plan', 'en');
    const calmingTools = resolveFormIntent('child needs calming tools', 'en');

    expect(overwhelmed?.url || '').toContain('/forms/en/children/cbt-core/');
    expect(calmingTools?.url || '').toContain('/forms/en/children/cbt-core/');
  });

  it('keeps Hebrew adolescents CBT core isolated to Hebrew language mode', () => {
    const hebrewForms = getTherapeuticFormsForAI({ language: 'he', audience: 'adolescents' })
      .filter((form) => form.category === 'adolescents_cbt_core');
    const englishForms = getTherapeuticFormsForAI({ language: 'en', audience: 'adolescents' })
      .filter((form) => form.id.startsWith('adolescents-cbt-core-he'));
    const spanishForms = getTherapeuticFormsForAI({ language: 'es', audience: 'adolescents' })
      .filter((form) => form.id.startsWith('adolescents-cbt-core-he'));

    expect(hebrewForms).toHaveLength(36);
    expect(englishForms).toHaveLength(0);
    expect(spanishForms).toHaveLength(0);
  });
});
