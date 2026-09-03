import { LEGAL_CONSENT_VERSION } from '../components/legal/legalContent.js';

export const CHAT_CONSENT_ACCEPTED_KEY = 'chat_consent_accepted';
export const CHAT_CONSENT_VERSION_KEY = 'chat_consent_version';

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function hasCurrentChatConsent(storage) {
  const target = resolveStorage(storage);
  if (!target) return false;

  return target.getItem(CHAT_CONSENT_ACCEPTED_KEY) === 'true'
    && target.getItem(CHAT_CONSENT_VERSION_KEY) === LEGAL_CONSENT_VERSION;
}

export function persistCurrentChatConsent(storage) {
  const target = resolveStorage(storage);
  if (!target) return;

  target.setItem(CHAT_CONSENT_ACCEPTED_KEY, 'true');
  target.setItem(CHAT_CONSENT_VERSION_KEY, LEGAL_CONSENT_VERSION);
}
