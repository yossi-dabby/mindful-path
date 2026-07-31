import { normalizeSessionLanguage } from './validateAgentOutput.jsx';

export const LANG_FULL_NAMES = {
  en: 'English',
  he: 'Hebrew',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
};

export function extractSessionLanguageDirective(content) {
  if (typeof content !== 'string') return null;
  const match = content.match(/\[SESSION_LANGUAGE:\s*([a-zA-Z-]{2,5})\b/);
  return match ? normalizeSessionLanguage(match[1]) : null;
}

export function resolveLockedSessionLanguageFromMessages(messages, fallbackLanguage = 'en') {
  const firstUserMsg = (Array.isArray(messages) ? messages : []).find((message) => message?.role === 'user' && typeof message?.content === 'string');
  return extractSessionLanguageDirective(firstUserMsg?.content) || normalizeSessionLanguage(fallbackLanguage);
}

export function addLangDirective(sessionContent, lang) {
  if (typeof sessionContent !== 'string' || !sessionContent.trim()) return sessionContent;
  if (sessionContent.includes('[SESSION_LANGUAGE:')) return sessionContent;
  const normalizedLang = normalizeSessionLanguage(lang);
  const name = LANG_FULL_NAMES[normalizedLang];
  if (!name) return sessionContent;
  return `${sessionContent}\n[SESSION_LANGUAGE: ${normalizedLang}. Open and respond entirely in ${name} for this session. Do not use another language unless the user explicitly asks to change the session language.]`;
}

export function buildFinalOutputGovernorOptions(sessionLanguage, userMessage) {
  return {
    lang: normalizeSessionLanguage(sessionLanguage),
    ...(userMessage ? { userMessage } : {}),
  };
}
