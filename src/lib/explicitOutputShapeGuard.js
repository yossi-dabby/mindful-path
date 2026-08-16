import { detectCrisisLanguage } from '../components/utils/crisisDetector.js';

const EXACTLY_ONE_ACTION_PATTERNS = Object.freeze([
  /\bexactly\s+(?:one|1)\s+(?:(?:concrete|physical|practical|small|single)\s+)?(?:action|step)\b/i,
  /\b(?:one|1)\s+(?:(?:concrete|physical|practical|small|single)\s+)?(?:action|step)\s+only\b/i,
  /(?:פעולה|צעד)\s+(?:[א-ת]+\s+){0,3}?(?:אחת|אחד)\s+בלבד/u,
  /בדיוק\s+(?:פעולה|צעד)\s+(?:[א-ת]+\s+){0,3}?(?:אחת|אחד)/u,
]);

const EN_ACTION_VERBS = Object.freeze([
  'choose', 'select', 'decide', 'stand', 'walk', 'go', 'open', 'close', 'put',
  'place', 'write', 'send', 'read', 'take', 'set', 'start', 'do', 'pick',
  'prepare', 'make', 'call', 'contact', 'schedule', 'breathe', 'look', 'move',
  'turn', 'hold', 'notice', 'sit', 'get', 'return',
]);

const HE_ACTION_VERBS = Object.freeze([
  'בחר', 'בחרי', 'קום', 'קומי', 'לך', 'לכי', 'הולך', 'הולכת', 'פתח', 'פתחי',
  'סגור', 'סגרי', 'הנח', 'הניחי', 'שים', 'שימי', 'כתוב', 'כתבי', 'שלח',
  'שלחי', 'קרא', 'קראי', 'עשה', 'עשי', 'סדר', 'סדרי', 'הכן', 'הכיני',
  'נשום', 'נשמי', 'עמוד', 'עמדי', 'שב', 'שבי', 'קח', 'קחי', 'החזר',
  'החזירי', 'התקשר', 'התקשרי',
]);

const EN_ACTION_START = new RegExp(
  `^(?:please\\s+)?(?:${EN_ACTION_VERBS.join('|')})\\b`,
  'i',
);
const HE_ACTION_START = new RegExp(
  `^(?:נא\\s+|עכשיו\\s+)?(?:${HE_ACTION_VERBS.join('|')})(?=\\s|$)`,
  'u',
);
const HE_VAV_ACTION_SPLIT = new RegExp(
  `\\s+ו(?=(?:${HE_ACTION_VERBS.join('|')})(?:\\s|$))`,
  'u',
);

function normalizeLocale(locale) {
  return typeof locale === 'string' && locale.toLowerCase().startsWith('he') ? 'he' : 'en';
}

function splitSentences(text) {
  return String(text || '')
    .match(/[^.!?\n]+[.!?]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [];
}

function stripLeadingConnector(clause) {
  return String(clause || '')
    .replace(/^(?:and\s+then|then|and)\s+/i, '')
    .replace(/^ו(?=[א-ת])/u, '')
    .trim();
}

function splitActionClauses(sentence) {
  return String(sentence || '')
    .split(/\s*(?:,|;)\s*|\s+(?:and\s+then|then|and)\s+/i)
    .flatMap((clause) => clause.split(HE_VAV_ACTION_SPLIT))
    .map(stripLeadingConnector)
    .filter(Boolean);
}

function isActionClause(clause, locale) {
  const normalized = stripLeadingConnector(clause);
  return locale === 'he'
    ? HE_ACTION_START.test(normalized)
    : EN_ACTION_START.test(normalized);
}

function ensureTerminalPunctuation(text, fallbackPunctuation = '.') {
  const trimmed = String(text || '').trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}${fallbackPunctuation}`;
}

export function hasCurrentTurnExactlyOneActionConstraint(userContent) {
  const visible = typeof userContent === 'string' ? userContent : '';
  return EXACTLY_ONE_ACTION_PATTERNS.some((pattern) => pattern.test(visible));
}

export function evaluateAtomicActionOutput({
  userContent,
  assistantContent,
  locale = 'en',
} = {}) {
  const normalizedLocale = normalizeLocale(locale);
  const currentTurnConstraint = hasCurrentTurnExactlyOneActionConstraint(userContent);
  const safetyPrecedence = detectCrisisLanguage(userContent || '');

  if (!currentTurnConstraint || safetyPrecedence) {
    return {
      active: false,
      safetyPrecedence,
      actionClauseCount: 0,
      violation: false,
      sentences: splitSentences(assistantContent),
    };
  }

  const sentences = splitSentences(assistantContent);
  const sentenceRecords = sentences.map((sentence) => {
    const clauses = splitActionClauses(sentence);
    const actionClauses = clauses.filter((clause) => isActionClause(clause, normalizedLocale));
    return { sentence, clauses, actionClauses };
  });
  const actionClauseCount = sentenceRecords.reduce(
    (count, record) => count + record.actionClauses.length,
    0,
  );

  return {
    active: true,
    safetyPrecedence: false,
    actionClauseCount,
    violation: actionClauseCount > 1,
    sentences,
    sentenceRecords,
  };
}

export function enforceAtomicActionOutput({
  userContent,
  assistantContent,
  metadata,
  locale = 'en',
} = {}) {
  const canonicalContent = typeof assistantContent === 'string' ? assistantContent : '';
  const evaluation = evaluateAtomicActionOutput({ userContent, assistantContent: canonicalContent, locale });
  const nextMetadata = { ...(metadata || {}) };
  const diagnostics = {
    active: evaluation.active,
    safety_precedence: evaluation.safetyPrecedence,
    action_clause_count: evaluation.actionClauseCount,
    violation_detected: evaluation.violation,
    replacement_applied: false,
  };

  if (!evaluation.violation) {
    return { content: canonicalContent, metadata: nextMetadata, diagnostics };
  }

  const actionRecords = evaluation.sentenceRecords
    .map((record, index) => ({ ...record, index }))
    .filter((record) => record.actionClauses.length > 0);
  const firstActionSentenceIndex = actionRecords[0].index;
  const lastActionClause = actionRecords.at(-1).actionClauses.at(-1);
  const originalFirstActionSentence = evaluation.sentences[firstActionSentenceIndex] || '';
  const punctuation = originalFirstActionSentence.match(/[.!?]$/)?.[0] || '.';
  const normalizedAtomicClause = normalizeLocale(locale) === 'en'
    ? `${lastActionClause.charAt(0).toUpperCase()}${lastActionClause.slice(1)}`
    : lastActionClause;
  const atomicSentence = ensureTerminalPunctuation(normalizedAtomicClause, punctuation);

  const content = evaluation.sentences
    .map((sentence, index) => {
      const record = evaluation.sentenceRecords[index];
      if (index === firstActionSentenceIndex) return atomicSentence;
      if (record.actionClauses.length > 0) return null;
      return sentence;
    })
    .filter(Boolean)
    .join(' ')
    .trim();

  diagnostics.replacement_applied = content.length > 0 && content !== canonicalContent;
  nextMetadata.explicit_output_shape_guard = diagnostics;

  return {
    content: content || canonicalContent,
    metadata: nextMetadata,
    diagnostics,
  };
}

export function applyAtomicActionGuardToConversationMessages(
  visibleUserMessages,
  finalMessages,
  options = {},
) {
  const visible = Array.isArray(visibleUserMessages) ? visibleUserMessages : [];
  const final = Array.isArray(finalMessages) ? finalMessages : [];
  const locale = options.locale || 'en';

  return final.map((message, finalIndex) => {
    if (!message || message.role !== 'assistant' || typeof message.content !== 'string') {
      return message;
    }

    const rawIndex = Number.isInteger(message.__rawIndex) ? message.__rawIndex : finalIndex;
    let precedingUser = null;
    for (let index = rawIndex - 1; index >= 0; index -= 1) {
      if (visible[index]?.role === 'user' && typeof visible[index]?.content === 'string') {
        precedingUser = visible[index];
        break;
      }
    }
    if (!precedingUser) return message;

    const enforced = enforceAtomicActionOutput({
      userContent: precedingUser.content,
      assistantContent: message.content,
      metadata: message.metadata,
      locale,
    });

    return {
      ...message,
      content: enforced.content,
      metadata: enforced.metadata,
    };
  });
}
