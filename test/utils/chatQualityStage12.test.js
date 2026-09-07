import { describe, expect, it } from 'vitest';
import {
  STAGE12_CHAT_SCENARIOS,
  STAGE12_SUPPORTED_LANGUAGES,
  buildStage12SessionContract,
  buildStage12TurnSupplement,
  classifyStage12Turn,
  normalizeStage12Language,
} from '../../src/lib/chatQualityStage12.js';
import { buildOutboundUserMessageContent } from '../../src/lib/chatRuntimeLifecycle.js';
import {
  MAX_CHAT_ATTACHMENT_BYTES,
  validateChatAttachment,
} from '../../src/components/chat/utils/fileValidation.js';
import { chatUiByLanguage } from '../../src/components/i18n/chatUiTranslations.js';
import { translations } from '../../src/components/i18n/translations.jsx';

describe('Stage 12 multilingual chat-quality release gate', () => {
  it('defines exactly seven repeatable scenarios in all seven supported languages', () => {
    expect(STAGE12_SUPPORTED_LANGUAGES).toEqual(['en', 'he', 'es', 'fr', 'de', 'it', 'pt']);
    expect(STAGE12_CHAT_SCENARIOS).toHaveLength(7);
    expect(STAGE12_CHAT_SCENARIOS.map(({ id }) => id)).toEqual([
      'vent_only',
      'practical_step',
      'automatic_thought',
      'refusal',
      'negative_feedback',
      'short_message_sequence',
      'late_return',
    ]);

    for (const scenario of STAGE12_CHAT_SCENARIOS) {
      expect(Object.keys(scenario.prompts).sort()).toEqual([...STAGE12_SUPPORTED_LANGUAGES].sort());
      for (const language of STAGE12_SUPPORTED_LANGUAGES) {
        const prompt = scenario.prompts[language];
        if (scenario.id === 'short_message_sequence') {
          expect(prompt).toHaveLength(3);
          expect(prompt.every((part) => typeof part === 'string' && part.trim().length > 0)).toBe(true);
        } else {
          expect(typeof prompt).toBe('string');
          expect(prompt.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it.each(['vent_only', 'practical_step', 'automatic_thought', 'refusal', 'negative_feedback'])(
    'classifies the %s canonical prompt consistently in every language',
    (scenarioId) => {
      const scenario = STAGE12_CHAT_SCENARIOS.find(({ id }) => id === scenarioId);
      for (const language of STAGE12_SUPPORTED_LANGUAGES) {
        expect(classifyStage12Turn(scenario.prompts[language])).toBe(scenarioId);
      }
    },
  );

  it('keeps vent-only support free of forced exercises and problem-solving', () => {
    const supplement = buildStage12TurnSupplement(
      STAGE12_CHAT_SCENARIOS[0].prompts.he,
      'he',
    );
    expect(supplement).toContain('VENT-ONLY');
    expect(supplement).toContain('Do not propose, start, or assign any exercise');
    expect(supplement).toContain('at most one gentle invitation');
    expect(supplement).toContain('Safety rules remain authoritative');
  });

  it('respects refusal without persuasion and repairs negative feedback without defensiveness', () => {
    const refusal = buildStage12TurnSupplement(
      STAGE12_CHAT_SCENARIOS.find(({ id }) => id === 'refusal').prompts.en,
      'en',
    );
    expect(refusal).toContain('respect the no immediately');
    expect(refusal).toContain('Do not persuade');

    const feedback = buildStage12TurnSupplement(
      STAGE12_CHAT_SCENARIOS.find(({ id }) => id === 'negative_feedback').prompts.es,
      'es',
    );
    expect(feedback).toContain('repair the alliance');
    expect(feedback).toContain('do not defend');
  });

  it('requires one practical step and formulation before CBT teaching', () => {
    const practical = buildStage12TurnSupplement(
      STAGE12_CHAT_SCENARIOS.find(({ id }) => id === 'practical_step').prompts.de,
      'de',
    );
    expect(practical).toContain('exactly one small, concrete, proportionate next step');
    expect(practical).toContain('Avoid lists');

    const thought = buildStage12TurnSupplement(
      STAGE12_CHAT_SCENARIOS.find(({ id }) => id === 'automatic_thought').prompts.it,
      'it',
    );
    expect(thought).toContain('distinguish the event from the global self-judgment');
    expect(thought).toContain('before CBT guidance');
  });

  it('adds a safe attachment contract for images and files', () => {
    const supplement = buildStage12TurnSupplement('', 'pt', { hasAttachment: true });
    expect(supplement).toContain('use only content actually available');
    expect(supplement).toContain('do not infer a diagnosis from an image');
    expect(supplement).toContain('state any access limitation plainly');

    expect(validateChatAttachment({ name: 'stage12.png', type: 'image/png', size: 1024 })).toEqual({
      valid: true,
      reason: null,
    });
    expect(validateChatAttachment({ name: 'stage12.txt', type: 'text/plain', size: 1024 })).toEqual({
      valid: true,
      reason: null,
    });
    expect(validateChatAttachment({
      name: 'too-large.pdf',
      type: 'application/pdf',
      size: MAX_CHAT_ATTACHMENT_BYTES + 1,
    })).toEqual({ valid: false, reason: 'too_large' });
  });

  it('preserves safety/workflow precedence before the quality contract and the user text', () => {
    const content = buildOutboundUserMessageContent({
      runtimeSupplement: '[SAFETY]',
      formulationSupplement: '[FORMULATION]',
      qualitySupplement: '[STAGE12]',
      messageText: 'user text',
    });
    expect(content).toBe('[SAFETY]\n\n[STAGE12]\n\nuser text');

    const formulationContent = buildOutboundUserMessageContent({
      runtimeSupplement: null,
      formulationSupplement: '[FORMULATION]',
      qualitySupplement: '[STAGE12]',
      messageText: 'user text',
    });
    expect(formulationContent).toBe('[FORMULATION]\n\n[STAGE12]\n\nuser text');
  });

  it('requires ordered short messages and verified-only continuity in every session contract', () => {
    for (const language of STAGE12_SUPPORTED_LANGUAGES) {
      const contract = buildStage12SessionContract(language);
      expect(contract).toContain(`Language: ${language}`);
      expect(contract).toContain('preserve arrival order');
      expect(contract).toContain('never drop or duplicate a message');
      expect(contract).toContain('verified conversation or memory data');
      expect(contract).toContain('never fabricate recall');
      expect(contract).toContain('Safety policy has precedence');
    }
  });

  it('falls back only for unsupported locale codes and preserves supported locale variants', () => {
    expect(normalizeStage12Language('he-IL')).toBe('he');
    expect(normalizeStage12Language('pt-BR')).toBe('pt');
    expect(normalizeStage12Language('ar')).toBe('en');
  });

  it('has localized queue, upload and retry/failure UI copy in all seven languages', () => {
    for (const language of STAGE12_SUPPORTED_LANGUAGES) {
      const chat = chatUiByLanguage[language].chat;
      expect(chat.errors.queue_title).toBeTruthy();
      expect(chat.errors.queue_desc).toBeTruthy();
      expect(chat.errors.file_upload_title).toBeTruthy();
      expect(chat.errors.file_upload_desc).toBeTruthy();
      const delivery = translations[language].translation.chat.delivery;
      expect(delivery.failed).toBeTruthy();
      expect(delivery.failed_title).toBeTruthy();
      expect(delivery.failed_description).toBeTruthy();
    }
  });
});
