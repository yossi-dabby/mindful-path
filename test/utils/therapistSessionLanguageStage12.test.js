import { describe, it, expect } from 'vitest';
import {
  LANG_FULL_NAMES,
  addLangDirective,
  buildFinalOutputGovernorOptions,
  extractSessionLanguageDirective,
  resolveLockedSessionLanguageFromMessages,
} from '../../src/components/utils/sessionLanguage.js';
import { sanitizeConversationMessagesAligned } from '../../src/components/utils/validateAgentOutput.jsx';

const ENGLISH_DIRECTIVE =
  '[SESSION_LANGUAGE: en. Open and respond entirely in English for this session. Do not use another language unless the user explicitly asks to change the session language.]';

const HEBREW_DIRECTIVE =
  '[SESSION_LANGUAGE: he. Open and respond entirely in Hebrew for this session. Do not use another language unless the user explicitly asks to change the session language.]';

describe('Stage 12 — /Chat session language lock for therapist opener/runtime directives', () => {
  it('includes English in the canonical session-language map', () => {
    expect(LANG_FULL_NAMES.en).toBe('English');
  });

  it('emits an explicit English session directive', () => {
    const result = addLangDirective('[START_SESSION]', 'en');
    expect(result).toContain(ENGLISH_DIRECTIVE);
  });

  it('emits an explicit Hebrew session directive', () => {
    const result = addLangDirective('[START_SESSION]', 'he');
    expect(result).toContain(HEBREW_DIRECTIVE);
  });

  it('emits exactly one directive for every supported language', () => {
    Object.keys(LANG_FULL_NAMES).forEach((lang) => {
      const result = addLangDirective('[START_SESSION]', lang);
      expect((result.match(/\[SESSION_LANGUAGE:/g) || [])).toHaveLength(1);
      expect(extractSessionLanguageDirective(result)).toBe(lang);
    });
  });

  it('does not duplicate an existing directive', () => {
    const once = addLangDirective('[START_SESSION]', 'en');
    const twice = addLangDirective(once, 'en');
    expect((twice.match(/\[SESSION_LANGUAGE:/g) || [])).toHaveLength(1);
    expect(twice).toBe(once);
  });

  it('MessageBubble governor options preserve the locked session language', () => {
    expect(buildFinalOutputGovernorOptions('he', 'שלום')).toEqual({ lang: 'he', userMessage: 'שלום' });
    expect(buildFinalOutputGovernorOptions('en-US', 'hello')).toEqual({ lang: 'en', userMessage: 'hello' });
  });

  it('MessageBubble governor options fail closed to English for invalid language', () => {
    expect(buildFinalOutputGovernorOptions('zz')).toEqual({ lang: 'en' });
    expect(buildFinalOutputGovernorOptions(undefined)).toEqual({ lang: 'en' });
  });

  it('hard refresh restores the embedded session language instead of the current UI language', () => {
    const persistedMessages = [
      { role: 'user', content: addLangDirective('[START_SESSION]', 'en') },
      { role: 'assistant', content: "It's good that you're here. We can slow down for a moment." },
    ];
    expect(resolveLockedSessionLanguageFromMessages(persistedMessages, 'he')).toBe('en');
  });

  it('conversation switching preserves the embedded session language per conversation', () => {
    const englishConversation = [
      { role: 'user', content: addLangDirective('[START_SESSION]', 'en') },
      { role: 'assistant', content: 'Welcome.' },
    ];
    const hebrewConversation = [
      { role: 'user', content: addLangDirective('[START_SESSION]', 'he') },
      { role: 'assistant', content: 'ברוך הבא.' },
    ];

    expect(resolveLockedSessionLanguageFromMessages(englishConversation, 'he')).toBe('en');
    expect(resolveLockedSessionLanguageFromMessages(hebrewConversation, 'en')).toBe('he');
  });

  it('a UI language change during an existing session does not alter the locked session language', () => {
    const persistedMessages = [
      { role: 'user', content: addLangDirective('[START_SESSION]', 'en') + '\n\nI need help with stress.' },
      { role: 'assistant', content: "I'm here with you." },
    ];

    expect(resolveLockedSessionLanguageFromMessages(persistedMessages, 'he')).toBe('en');
    expect(resolveLockedSessionLanguageFromMessages(persistedMessages, 'pt')).toBe('en');
  });

  it('a new conversation after a UI language change uses the new language lock', () => {
    const englishStart = addLangDirective('[START_SESSION]', 'en');
    const portugueseStart = addLangDirective('[START_SESSION]', 'pt');

    expect(extractSessionLanguageDirective(englishStart)).toBe('en');
    expect(extractSessionLanguageDirective(portugueseStart)).toBe('pt');
  });

  it('regression: English startup/opening remains English with one visible assistant opening and one follow-up reply', () => {
    const rawMessages = [
      { role: 'user', content: addLangDirective('[START_SESSION]', 'en') },
      {
        role: 'assistant',
        content: "It's good that you're here. We can slow down for a moment and gently sort through what feels hardest right now, one step at a time. I'm here with you.",
      },
      { role: 'user', content: 'I feel overwhelmed and cannot focus.' },
      { role: 'assistant', content: "Let's slow this down together and choose one small next step." },
    ];

    const lockedLanguage = resolveLockedSessionLanguageFromMessages(rawMessages, 'en');
    const visible = sanitizeConversationMessagesAligned(rawMessages, lockedLanguage).filter(Boolean);
    const assistantMessages = visible.filter((message) => message.role === 'assistant');

    expect(lockedLanguage).toBe('en');
    expect(visible).toHaveLength(3);
    expect(assistantMessages).toHaveLength(2);
    expect(assistantMessages[0].content).toMatch(/It's good that you're here/);
    expect(assistantMessages[0].content).not.toMatch(/[\u0590-\u05FF]/);
    expect(assistantMessages[1].content).toMatch(/Let's slow this down together/);
    expect(new Set(assistantMessages.map((message) => message.content)).size).toBe(2);
  });

  it('regression: Hebrew startup/opening remains Hebrew', () => {
    const rawMessages = [
      { role: 'user', content: addLangDirective('[START_SESSION]', 'he') },
      { role: 'assistant', content: 'טוב שאתה כאן. אנחנו יכולים להאט רגע ולעשות סדר יחד.' },
    ];

    const lockedLanguage = resolveLockedSessionLanguageFromMessages(rawMessages, 'en');
    const visible = sanitizeConversationMessagesAligned(rawMessages, lockedLanguage).filter(Boolean);

    expect(lockedLanguage).toBe('he');
    expect(visible).toHaveLength(1);
    expect(visible[0].content).toMatch(/[\u0590-\u05FF]/);
  });
});
