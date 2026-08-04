const RESPONSE_POLICY_HOLDING_RESPONSES = Object.freeze({
  en: "Let’s stay with understanding what is happening for you right now before we decide on any next step. What feels most important about this moment?",
  he: 'בואי נישאר רגע עם ההבנה של מה שקורה לך עכשיו לפני שנחליט על צעד כלשהו. מה הכי חשוב ברגע הזה?',
});

const IMPERATIVE_PATTERNS = Object.freeze([
  { code: 'direct_imperative_en', pattern: /\b(?:try|you should|please|start|write|practice|call|contact|schedule|send)\b/i },
  { code: 'direct_imperative_he', pattern: /(?:כדאי|נסה|נסי|עשה|עשי|שלח|שלחי|תקבע|תקבעי|כתוב|כתבי|תרגל|תרגלי)/ },
  { code: 'homework_marker', pattern: /\b(?:homework|assignment|for this week|between now and next time)\b/i },
  { code: 'behavioral_experiment', pattern: /\bbehavioral experiment\b/i },
  { code: 'exposure_instruction', pattern: /\bexposure\b/i },
  { code: 'breathing_grounding', pattern: /\b(?:breathing exercise|grounding technique|take three breaths|5-4-3-2-1)\b/i },
  { code: 'step_by_step_plan', pattern: /\b(?:step 1|first[, ]+then|follow these steps)\b/i },
  { code: 'form_marker', pattern: /\[FORM:[^\]]+\]/i },
]);

const ALLOWLIST_PATTERNS = Object.freeze([
  /\?\s*$/,
  /\b(?:it sounds|I hear|maybe|perhaps|could it be|might be|we can explore)\b/i,
  /(?:נשמע|אולי|יכול להיות|אפשר לבדוק|מה את חושבת|מה אתה חושב)/,
  /\b(?:if you are in immediate danger|call emergency services|reach out to a crisis line)\b/i,
  /(?:אם את בסכנה מיידית|אם אתה בסכנה מיידית|פנה מיד לעזרה דחופה|התקשר לשירותי החירום)/,
]);

function normalizeLocale(locale) {
  return typeof locale === 'string' && locale.toLowerCase().startsWith('he') ? 'he' : 'en';
}

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?\n])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function isAllowedSentence(sentence) {
  return ALLOWLIST_PATTERNS.some((pattern) => pattern.test(sentence));
}

function detectViolation(content) {
  const sentences = splitSentences(content);
  const reasonCodes = [];
  for (const sentence of sentences) {
    if (isAllowedSentence(sentence)) continue;
    for (const rule of IMPERATIVE_PATTERNS) {
      if (rule.pattern.test(sentence)) {
        reasonCodes.push(rule.code);
      }
    }
  }
  return Array.from(new Set(reasonCodes)).slice(0, 8);
}

export function enforceResponsePolicy({ content, metadata, policy, locale = 'en' } = {}) {
  const normalizedLocale = normalizeLocale(locale);
  const canonicalContent = typeof content === 'string' ? content : '';
  const nextMetadata = { ...(metadata || {}) };
  const diagnostics = {
    response_policy_version: typeof policy?.policy_version === 'string' ? policy.policy_version : 'response_policy_v1',
    policy_available: policy?.policy_available === true,
    action_permitted: policy?.action_permitted === true,
    safety_override_required: policy?.safety_override_required === true,
    policy_scope_match: policy?.scope_match !== false,
    policy_enforced: false,
    violation_detected: false,
    violation_reason_codes: [],
    replacement_applied: false,
    duplicate_enforcement_blocked: policy?.status === 'completed',
  };

  if (!policy || policy.policy_available === false) {
    return { content: canonicalContent, metadata: nextMetadata, diagnostics, enforced: false, replaced: false };
  }

  if (policy.scope_match === false || policy.status === 'completed' || policy.status === 'abandoned') {
    return { content: canonicalContent, metadata: nextMetadata, diagnostics, enforced: false, replaced: false };
  }

  if (policy.action_permitted === true || policy.safety_override_required === true) {
    diagnostics.policy_enforced = true;
    return { content: canonicalContent, metadata: nextMetadata, diagnostics, enforced: true, replaced: false };
  }

  const reasonCodes = detectViolation(canonicalContent);
  diagnostics.policy_enforced = true;
  diagnostics.violation_detected = reasonCodes.length > 0;
  diagnostics.violation_reason_codes = reasonCodes;

  if (reasonCodes.length === 0) {
    return { content: canonicalContent, metadata: nextMetadata, diagnostics, enforced: true, replaced: false };
  }

  delete nextMetadata.generated_file;
  delete nextMetadata.generated_files;
  if (nextMetadata.structured_data && typeof nextMetadata.structured_data === 'object') {
    nextMetadata.structured_data = {
      ...nextMetadata.structured_data,
      homework: [],
      assistant_message: RESPONSE_POLICY_HOLDING_RESPONSES[normalizedLocale],
    };
  }

  diagnostics.replacement_applied = true;
  return {
    content: RESPONSE_POLICY_HOLDING_RESPONSES[normalizedLocale],
    metadata: nextMetadata,
    diagnostics,
    enforced: true,
    replaced: true,
  };
}
