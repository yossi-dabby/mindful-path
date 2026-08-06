import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  applyCurrentTurnGroundingGuardToConversationMessages,
  applyFormulationGuardToConversationMessages,
} from '../../src/components/utils/formulationContractGuard.js';
import { createChatOrchestratorV2, TURN_STATUS } from '../../src/lib/chatOrchestratorV2.js';

const FORMULATION_BLOCK =
  '=== FORMULATION DEEPENING — THIS TURN ONLY ===\nmarker\n=== END FORMULATION DEEPENING ===';

function makeSessionStorage() {
  const store = new Map();
  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => { store.set(key, value); }),
    removeItem: vi.fn((key) => { store.delete(key); }),
    clear: vi.fn(() => store.clear()),
  };
}

function buildRaw(userContent, assistantContent) {
  return [
    { id: 'u1', role: 'user', content: userContent, created_at: '2026-08-06T00:00:00.000Z' },
    { id: 'a1', role: 'assistant', content: assistantContent, created_at: '2026-08-06T00:01:00.000Z' },
  ];
}

function runGuardPipeline({
  locale,
  formulationMode,
  groundingMode,
  userContent,
  assistantContent,
}) {
  const raw = buildRaw(userContent, assistantContent);
  const aligned = raw.map((msg, index) => (msg.role === 'assistant' ? { ...msg, __rawIndex: index } : msg));
  const formulation = applyFormulationGuardToConversationMessages(raw, aligned, {
    locale,
    auditMode: formulationMode,
  });
  const grounding = applyCurrentTurnGroundingGuardToConversationMessages(raw, formulation.messages, {
    locale,
    auditMode: groundingMode,
  });
  return {
    messages: grounding.messages,
    auditEvents: [...formulation.auditEvents, ...grounding.auditEvents],
  };
}

function inferVisibleUpdateRejectedLayer(previousMessages, nextMessages, auditEvents) {
  const prevAssistant = previousMessages.find((m) => m.role === 'assistant');
  const nextAssistant = nextMessages.find((m) => m.role === 'assistant');
  if (!prevAssistant || !nextAssistant) return null;
  const sameIdentity = prevAssistant.id === nextAssistant.id;
  const contentMutated = prevAssistant.content !== nextAssistant.content;
  if (!(sameIdentity && contentMutated)) return null;
  const terminal = auditEvents.find((entry) => entry.guard_decision === 'REPLACE_TERMINAL');
  if (!terminal) return null;
  if (terminal.guard_name === 'formulation_contract_guard') {
    return 'applyFormulationGuardToConversationMessages';
  }
  if (terminal.guard_name === 'current_turn_grounding_guard') {
    return 'applyCurrentTurnGroundingGuardToConversationMessages';
  }
  return null;
}

const SCENARIOS = Object.freeze({
  A: {
    userContent: 'I feel stress before tomorrow meeting.',
    assistantContent: 'I hear you. What feels hardest about tomorrow?',
    formulationMode: 'ENFORCE',
    groundingMode: 'ENFORCE',
  },
  B: {
    userContent: `${FORMULATION_BLOCK}\nI feel stress before tomorrow meeting.`,
    assistantContent: 'This is exactly what is missing and this explains why.',
    formulationMode: 'ENFORCE',
    groundingMode: 'ENFORCE',
  },
  C: {
    userContent: `${FORMULATION_BLOCK}\nI feel stress before tomorrow meeting.`,
    assistantContent: 'This is exactly what is missing and this explains why.',
    formulationMode: 'SHADOW',
    groundingMode: 'ENFORCE',
  },
  D: {
    userContent: 'My chest gets tight before calls.',
    assistantContent: 'This means your identity is threatened because of perfection.',
    formulationMode: 'ENFORCE',
    groundingMode: 'ENFORCE',
  },
  E: {
    userContent: 'My chest gets tight before calls.',
    assistantContent: 'This means your identity is threatened because of perfection.',
    formulationMode: 'ENFORCE',
    groundingMode: 'SHADOW',
  },
  F: {
    userContent: `${FORMULATION_BLOCK}\nMy chest gets tight before calls.`,
    assistantContent: 'This is exactly what is missing and this explains why.',
    formulationMode: 'OFF',
    groundingMode: 'ENFORCE',
  },
  G: {
    userContent: `${FORMULATION_BLOCK}\nMy chest gets tight before calls.`,
    assistantContent: 'This is exactly what is missing and this explains why.',
    formulationMode: 'OFF',
    groundingMode: 'OFF',
  },
});

describe('Guard isolation audit matrix', () => {
  it('runs EN/HE matrix A-G and FR/ES matrix A,D,F,G with deterministic offending layer attribution', () => {
    const locales = ['en', 'he', 'fr', 'es'];
    const subsetByLocale = {
      en: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      he: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      fr: ['A', 'D', 'F', 'G'],
      es: ['A', 'D', 'F', 'G'],
    };
    const matrixRows = [];

    locales.forEach((locale) => {
      subsetByLocale[locale].forEach((scenarioKey) => {
        const scenario = SCENARIOS[scenarioKey];
        const raw = buildRaw(scenario.userContent, scenario.assistantContent);
        const { messages, auditEvents } = runGuardPipeline({
          locale,
          formulationMode: scenario.formulationMode,
          groundingMode: scenario.groundingMode,
          userContent: scenario.userContent,
          assistantContent: scenario.assistantContent,
        });
        const offendingLayer = inferVisibleUpdateRejectedLayer(raw, messages, auditEvents);
        matrixRows.push({ locale, scenarioKey, offendingLayer, auditEvents });
      });
    });

    const expectedRowCount = Object.values(subsetByLocale).reduce((sum, scenarioKeys) => sum + scenarioKeys.length, 0);
    expect(matrixRows).toHaveLength(expectedRowCount);
    const enheRows = matrixRows.filter((row) => row.locale === 'en' || row.locale === 'he');
    expect(enheRows).toHaveLength(14);
    const controlRows = matrixRows.filter((row) => row.locale === 'fr' || row.locale === 'es');
    expect(controlRows).toHaveLength(8);

    const deterministicRows = matrixRows.filter((row) => row.offendingLayer !== null);
    expect(deterministicRows.length).toBeGreaterThan(0);
    deterministicRows.forEach((row) => {
      expect([
        'applyFormulationGuardToConversationMessages',
        'applyCurrentTurnGroundingGuardToConversationMessages',
      ]).toContain(row.offendingLayer);
    });
  });

  it('tracks decision reuse deterministically on repeated guard replacement', () => {
    const scenario = SCENARIOS.B;
    const first = runGuardPipeline({
      locale: 'he',
      formulationMode: 'ENFORCE',
      groundingMode: 'ENFORCE',
      userContent: scenario.userContent,
      assistantContent: scenario.assistantContent,
    });
    const secondRaw = buildRaw(scenario.userContent, first.messages[1].content);
    const secondAligned = secondRaw.map((msg, index) => (msg.role === 'assistant' ? { ...msg, __rawIndex: index, metadata: first.messages[1].metadata } : msg));
    const second = applyFormulationGuardToConversationMessages(secondRaw, secondAligned, {
      locale: 'he',
      auditMode: 'ENFORCE',
    });
    const reused = second.auditEvents.find((entry) => entry.decision_reused === true);
    expect(reused).toBeTruthy();
  });
});

describe('Guard decision lifecycle integration', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('window', { sessionStorage: makeSessionStorage() });
  });

  it('correlates candidate -> guard decision -> visible commit once with no reprocessing loop', () => {
    const coord = createChatOrchestratorV2();
    const { turn } = coord.registerSend({ conversationId: 'conv-guard-audit', executeSend: async () => {} });
    coord.markGenerating(turn.client_request_id);

    const scenario = SCENARIOS.B;
    const { messages, auditEvents } = runGuardPipeline({
      locale: 'en',
      formulationMode: 'ENFORCE',
      groundingMode: 'ENFORCE',
      userContent: scenario.userContent,
      assistantContent: scenario.assistantContent,
    });
    const terminalDecision = auditEvents.find((entry) => entry.guard_decision === 'REPLACE_TERMINAL');
    expect(terminalDecision?.guard_name).toBe('formulation_contract_guard');

    const rawCorrelation = coord.reconcileSnapshot({
      snapshot: messages,
      clientRequestId: turn.client_request_id,
      deliverySource: 'polling',
      phase: 'raw_correlation',
      visibleAccepted: true,
    });
    expect(rawCorrelation.response_correlated).toBe(true);

    const visibleCommit = coord.reconcileSnapshot({
      snapshot: messages,
      clientRequestId: turn.client_request_id,
      deliverySource: 'polling',
      phase: 'visible_commit',
      visibleAccepted: true,
      terminalReason: 'visible_terminal_result_committed',
    });
    expect(visibleCommit.accepted).toBe(true);
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.COMPLETED);

    const replay = coord.reconcileSnapshot({
      snapshot: messages,
      clientRequestId: turn.client_request_id,
      deliverySource: 'polling',
      phase: 'raw_correlation',
      visibleAccepted: true,
    });
    expect(replay.response_deduplicated).toBe(true);
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.COMPLETED);
  });
});
