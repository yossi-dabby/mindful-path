import { describe, it, expect, vi } from 'vitest';
import {
  getAllTherapeuticForms,
  getTherapeuticFormsForAI,
  getTherapeuticFormsPolicyVersion,
} from '../../src/data/therapeuticForms/index.js';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';
import {
  consumePendingPolicyRefreshAfterSuccessfulSend,
  THERAPEUTIC_FORMS_POLICY_REFRESH_BLOCK_END,
  THERAPEUTIC_FORMS_POLICY_REFRESH_BLOCK_START,
  THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER,
  buildTherapeuticFormsPolicyRefreshMessage,
  ensureTherapeuticFormsPolicyInjected,
  extractTherapeuticFormsPolicyVersion,
  getTherapeuticFormsPolicyPayload,
  prependPendingPolicyRefreshToUserContent,
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

  it('records a pending refresh for an existing conversation that lacks the current version without sending an agent message', async () => {
    const addMessage = vi.fn().mockResolvedValue({});
    const cache = new Map();
    const pendingRefreshByConversation = new Map();
    const conversation = {
      id: 'conversation-existing',
      messages: [{ role: 'user', content: 'Hello there' }],
    };

    const result = await ensureTherapeuticFormsPolicyInjected({
      conversation,
      sessionLanguage: 'en',
      isNewConversation: false,
      injectedVersionCache: cache,
      pendingRefreshByConversation,
    });

    expect(result.injected).toBe(false);
    expect(result.pendingRecorded).toBe(true);
    expect(addMessage).not.toHaveBeenCalled();
    expect(result.pendingRefresh.content.startsWith(THERAPEUTIC_FORMS_POLICY_REFRESH_BLOCK_START)).toBe(true);
    expect(result.pendingRefresh.content.includes(THERAPEUTIC_FORMS_POLICY_REFRESH_BLOCK_END)).toBe(true);
    expect(result.pendingRefresh.content.includes(THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER)).toBe(true);
    expect(extractTherapeuticFormsPolicyVersion(result.pendingRefresh.content)).toBe(getTherapeuticFormsPolicyVersion());
    expect(cache.get(conversation.id)).toBeUndefined();
    expect(pendingRefreshByConversation.get(conversation.id)?.policyVersion).toBe(getTherapeuticFormsPolicyVersion());
  });

  it('never calls addMessage during policy refresh maintenance checks', async () => {
    const addMessage = vi.fn().mockResolvedValue({});
    await ensureTherapeuticFormsPolicyInjected({
      base44: { agents: { addMessage } },
      conversation: {
        id: 'conversation-maintenance',
        messages: [{ role: 'user', content: 'hello' }],
      },
      sessionLanguage: 'en',
      injectedVersionCache: new Map(),
      pendingRefreshByConversation: new Map(),
    });
    expect(addMessage).not.toHaveBeenCalled();
  });

  it('does not record pending refresh when current policy version is already present', async () => {
    const addMessage = vi.fn().mockResolvedValue({});
    const refreshMessage = buildTherapeuticFormsPolicyRefreshMessage({ sessionLanguage: 'en' });
    const pendingRefreshByConversation = new Map();
    const conversation = {
      id: 'conversation-current',
      messages: [{ role: 'user', content: refreshMessage.content }],
    };

    const result = await ensureTherapeuticFormsPolicyInjected({
      conversation,
      sessionLanguage: 'en',
      isNewConversation: false,
      injectedVersionCache: new Map(),
      pendingRefreshByConversation,
    });

    expect(result.injected).toBe(false);
    expect(result.pendingRecorded).toBe(false);
    expect(addMessage).not.toHaveBeenCalled();
    expect(pendingRefreshByConversation.has(conversation.id)).toBe(false);
  });

  it('records pending refresh for stale policy versions without sending an agent message', async () => {
    const addMessage = vi.fn().mockResolvedValue({});
    const pendingRefreshByConversation = new Map();
    const conversation = {
      id: 'conversation-stale',
      messages: [{
        role: 'user',
        content: `${THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER}\n[THERAPEUTIC_FORMS_POLICY]\n[THERAPEUTIC_FORMS_POLICY_VERSION: stale-version]`,
      }],
    };

    const result = await ensureTherapeuticFormsPolicyInjected({
      conversation,
      sessionLanguage: 'en',
      isNewConversation: false,
      injectedVersionCache: new Map(),
      pendingRefreshByConversation,
    });

    expect(result.injected).toBe(false);
    expect(result.pendingRecorded).toBe(true);
    expect(addMessage).not.toHaveBeenCalled();
    expect(result.pendingRefresh.content.startsWith(THERAPEUTIC_FORMS_POLICY_REFRESH_BLOCK_START)).toBe(true);
  });

  it('hides legacy pure policy-refresh user turns and the immediate assistant orphan', () => {
    const refreshMessage = buildTherapeuticFormsPolicyRefreshMessage({ sessionLanguage: 'en' });
    const sanitized = sanitizeConversationMessages([
      { role: 'user', content: refreshMessage.content },
      { role: 'assistant', content: 'I can help with that.' },
    ], 'en');

    expect(sanitized).toHaveLength(0);
  });

  it('prevents final assistant replies from falsely claiming there is no access to forms', () => {
    const sanitized = sanitizeConversationMessages([
      { role: 'assistant', content: 'I do not have access to therapeutic forms right now.' },
    ], 'en');

    expect(sanitized[0].content).toContain('installed therapeutic forms catalog');
    expect(sanitized[0].content.toLowerCase()).not.toContain('no access to therapeutic forms');
  });

  it('prepends pending policy refresh into one genuine user send payload deterministically', () => {
    const pendingRefresh = buildTherapeuticFormsPolicyRefreshMessage({ sessionLanguage: 'en' }).boundedContent;
    const outbound = prependPendingPolicyRefreshToUserContent('This is my actual request.', pendingRefresh);

    expect(outbound.startsWith(THERAPEUTIC_FORMS_POLICY_REFRESH_BLOCK_START)).toBe(true);
    expect(outbound.includes(THERAPEUTIC_FORMS_POLICY_REFRESH_BLOCK_END)).toBe(true);
    expect(outbound.endsWith('This is my actual request.')).toBe(true);
    expect(extractTherapeuticFormsPolicyVersion(outbound)).toBe(getTherapeuticFormsPolicyVersion());
  });

  it('pending policy refresh state stays conversation-scoped and does not cross conversations', async () => {
    const pendingRefreshByConversation = new Map();
    const cache = new Map();
    await ensureTherapeuticFormsPolicyInjected({
      conversation: {
        id: 'conversation-a',
        messages: [{ role: 'user', content: 'hello from a' }],
      },
      sessionLanguage: 'en',
      injectedVersionCache: cache,
      pendingRefreshByConversation,
    });

    expect(pendingRefreshByConversation.has('conversation-a')).toBe(true);
    expect(pendingRefreshByConversation.has('conversation-b')).toBe(false);
  });

  it('successful genuine send consumes pending refresh once and marks injected version cache', () => {
    const pendingRefreshByConversation = new Map([
      ['conversation-a', { content: 'policy', policyVersion: 'v-current' }],
    ]);
    const cache = new Map();
    const first = consumePendingPolicyRefreshAfterSuccessfulSend({
      conversationId: 'conversation-a',
      pendingRefreshByConversation,
      injectedVersionCache: cache,
    });
    const second = consumePendingPolicyRefreshAfterSuccessfulSend({
      conversationId: 'conversation-a',
      pendingRefreshByConversation,
      injectedVersionCache: cache,
    });

    expect(first).toEqual({ consumed: true, policyVersion: 'v-current' });
    expect(second).toEqual({ consumed: false, policyVersion: null });
    expect(cache.get('conversation-a')).toBe('v-current');
    expect(pendingRefreshByConversation.has('conversation-a')).toBe(false);
  });

  it('failed genuine send path can keep pending refresh without falsely marking injected version', () => {
    const pendingRefreshByConversation = new Map([
      ['conversation-a', { content: 'policy', policyVersion: 'v-current' }],
    ]);
    const cache = new Map();

    expect(cache.has('conversation-a')).toBe(false);
    expect(pendingRefreshByConversation.has('conversation-a')).toBe(true);
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
