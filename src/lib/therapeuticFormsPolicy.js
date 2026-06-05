import {
  getAllTherapeuticForms,
  getTherapeuticFormsForAI,
  getTherapeuticFormsPolicyVersion,
} from '../data/therapeuticForms/index.js';

export const THERAPEUTIC_FORMS_POLICY_MARKER = '[THERAPEUTIC_FORMS_POLICY]';
export const THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER = '[THERAPEUTIC_FORMS_POLICY_REFRESH]';
export const THERAPEUTIC_FORMS_POLICY_VERSION_PATTERN = /\[THERAPEUTIC_FORMS_POLICY_VERSION:\s*([^\]]+)\]/;

const THERAPEUTIC_FORMS_DEBUG_QUERY_PARAM = '_s2debug';
const FORM_CATALOG_AUDIENCE_ORDER = ['adults', 'older_adults', 'adolescents', 'children'];
const FORM_CATALOG_AUDIENCE_LABELS = Object.freeze({
  adults: 'Adults',
  older_adults: 'Older Adults',
  adolescents: 'Adolescents (ages 13-17)',
  children: 'Children (ages 6-12)',
});
const FORM_CATALOG_AUDIENCE_SAFETY_NOTES = Object.freeze({
  adolescents: ' — use only for adolescent users',
  children: ' — use only for child/family-safe requests',
});

function getDebugEnvironmentLabel(environmentOverride) {
  if (typeof environmentOverride === 'string' && environmentOverride.trim()) {
    return environmentOverride.trim();
  }
  return import.meta.env?.MODE || (import.meta.env?.PROD ? 'production' : 'unknown');
}

export function isTherapeuticFormsPolicyDebugEnabled() {
  if (import.meta.env?.DEV) return true;
  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(THERAPEUTIC_FORMS_DEBUG_QUERY_PARAM) === 'true';
  } catch {
    return false;
  }
}

export function logTherapeuticFormsPolicyDiagnostic(eventName, payload = {}) {
  if (!isTherapeuticFormsPolicyDebugEnabled()) return;

  console.groupCollapsed(`[TherapeuticFormsPolicy] ${eventName}`);
  Object.entries(payload).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.groupEnd();
}

export function buildTherapistFormCatalog(forms) {
  const approvedForms = Array.isArray(forms) ? forms.filter((form) => form?.approved === true) : [];
  if (approvedForms.length === 0) {
    return [
      'THERAPEUTIC FORMS AVAILABILITY: no therapeutic forms are currently installed/available.',
      'Do NOT emit [FORM:...] markers.',
      'If a user requests a worksheet/form, state clearly that no therapeutic forms are currently installed/available.',
    ].join('\n');
  }

  const byAudience = {};
  for (const form of approvedForms) {
    const audience = form.audience || 'unknown';
    if (!byAudience[audience]) byAudience[audience] = [];
    byAudience[audience].push(form);
  }

  const total = approvedForms.length;
  const audienceCount = Object.keys(byAudience).length;
  const lines = [`CURRENTLY APPROVED FORMS — ${total} forms across ${audienceCount} audiences (use only these exact IDs):`];

  for (const audience of FORM_CATALOG_AUDIENCE_ORDER) {
    const audienceForms = byAudience[audience];
    if (!audienceForms || audienceForms.length === 0) continue;

    const label = FORM_CATALOG_AUDIENCE_LABELS[audience] || audience;
    const safetyNote = FORM_CATALOG_AUDIENCE_SAFETY_NOTES[audience] || '';
    lines.push('');
    lines.push(`[${label}${safetyNote}]`);

    for (const form of audienceForms) {
      const bestTitle = form.languages?.en?.title || form.languages?.he?.title || form.title || form.id;
      const therapeuticGoalRaw = form.therapeuticGoal || form.therapeutic_goal;
      const whenToUseRaw = form.whenToUse || form.when_to_use;
      const keywordsRaw = Array.isArray(form.clinicalKeywords) ? form.clinicalKeywords : (Array.isArray(form.keywords) ? form.keywords : []);
      const therapeuticGoal = typeof therapeuticGoalRaw === 'string' ? therapeuticGoalRaw.trim() : '';
      const whenToUse = typeof whenToUseRaw === 'string' ? whenToUseRaw.trim() : '';
      const clinicalKeywords = keywordsRaw.filter(Boolean).join(', ');
      const intentPhrases = Array.isArray(form.intentPhrases) ? form.intentPhrases.filter(Boolean).join(' | ') : '';
      const notFor = Array.isArray(form.notFor) ? form.notFor.filter(Boolean).join('; ') : '';
      const desc = form.shortContentDescriptionHe ? ` | ${form.shortContentDescriptionHe}` : '';

      lines.push(`  [FORM:${form.id}]  — ${bestTitle} (${form.category})${desc}`);
      if (therapeuticGoal) lines.push(`    Goal: ${therapeuticGoal}`);
      if (whenToUse) lines.push(`    When to use: ${whenToUse}`);
      if (clinicalKeywords) lines.push(`    Clinical keywords: ${clinicalKeywords}`);
      if (intentPhrases) lines.push(`    Intent phrases: ${intentPhrases}`);
      if (notFor) lines.push(`    Not for: ${notFor}`);
    }
  }

  return lines.join('\n');
}

function buildTherapeuticFormsPolicyInstructions(forms, policyVersion) {
  if (!Array.isArray(forms) || forms.filter((form) => form?.approved === true).length === 0) {
    return [
      THERAPEUTIC_FORMS_POLICY_MARKER,
      `[THERAPEUTIC_FORMS_POLICY_VERSION: ${policyVersion}]`,
      'No therapeutic forms are currently installed/available.',
      'When a user requests a worksheet, CBT form, thought record, mood tracker, homework sheet, or similar structured exercise, do NOT attach a form.',
      '',
      'Do NOT embed [FORM:...] markers while the catalog is empty.',
      'Reply with a short, clear explanation that no therapeutic forms are currently installed/available.',
      '',
      buildTherapistFormCatalog(forms || []),
      '',
      'Language: Keep the user response in the session language when explaining that forms are unavailable.',
      '',
      'RULES:',
      '  - State clearly: no therapeutic forms are currently installed/available.',
      '  - Do not invent form IDs, file names, URLs, catalogs, or attachments.',
      '  - Do not claim forms exist in any audience/category while catalog is empty.',
      '  - Do not use forms as a substitute for crisis or safety handling.',
      '  - Existing safety-handling, crisis flow, and clinical boundaries are not affected by this policy.',
    ].join('\n');
  }

  return [
    THERAPEUTIC_FORMS_POLICY_MARKER,
    `[THERAPEUTIC_FORMS_POLICY_VERSION: ${policyVersion}]`,
    'Therapeutic forms are available only from the approved catalog below.',
    'When a user requests a workbook/form, use exact [FORM:form-id] marker(s) from the approved list.',
    'Default to one marker for specific requests; for explicit multi-form/module/stage-all requests, use up to 5 markers.',
    '',
    buildTherapistFormCatalog(forms),
    '',
    'LANGUAGE & AUDIENCE RULES:',
    '  - Match active session language first. Do not attach forms from another language unless the user explicitly asks for that language.',
    '  - Match user audience. Do not attach child/adult/older-adult forms for adolescent requests, and vice versa.',
    '  - If the requested language/audience/category is not currently installed, say it is not currently installed.',
    '  - If forms exist but no exact match is found, say no exact match and suggest nearby matches; do not claim no access to forms.',
    '',
    'SAFETY RULES:',
    '  - Do not invent form IDs, file names, URLs, catalogs, or attachments.',
    '  - Do not return forms that are not listed in the approved catalog.',
    '  - Do not use forms as a substitute for crisis or safety handling.',
    '  - Existing safety-handling, crisis flow, and clinical boundaries are not affected by this policy.',
  ].join('\n');
}

export function getTherapeuticFormsPolicyPayload(options = {}) {
  const environment = getDebugEnvironmentLabel(options.environment);
  const policyVersion = getTherapeuticFormsPolicyVersion();
  const allForms = getAllTherapeuticForms({ environment });
  const aiForms = getTherapeuticFormsForAI({
    language: options.sessionLanguage,
    audience: options.sessionAudience,
    environment,
  });
  const approvedForms = allForms.filter((form) => form?.approved === true);

  const formsForPolicy = aiForms.length > 0 ? aiForms : approvedForms;
  const policy = aiForms.length === 0 && approvedForms.length > 0
    ? [
        THERAPEUTIC_FORMS_POLICY_MARKER,
        `[THERAPEUTIC_FORMS_POLICY_VERSION: ${policyVersion}]`,
        'Therapeutic forms are installed, but no exact form matches the current language/audience filters.',
        'Do NOT say you have no access to forms.',
        'If no exact match exists, say you could not find an exact form and suggest nearby available forms from the approved catalog.',
        '',
        buildTherapistFormCatalog(approvedForms),
        '',
        'LANGUAGE & AUDIENCE RULES:',
        '  - Respect active session language and audience filters when attaching forms.',
        '  - If the user asks for a language/audience outside the active filters, explain constraints and suggest nearby installed matches.',
        '',
        'SAFETY RULES:',
        '  - Do not invent form IDs, file names, URLs, catalogs, or attachments.',
        '  - Do not return forms that are not listed in the approved catalog.',
      ].join('\n')
    : buildTherapeuticFormsPolicyInstructions(formsForPolicy, policyVersion);

  return {
    policy,
    policyVersion,
    diagnostics: {
      environment,
      policyVersion,
      totalFormsCount: allForms.length,
      approvedFormsCount: approvedForms.length,
      formsCountAvailableToAI: aiForms.length,
      activeLanguage: options.sessionLanguage || null,
      activeAudience: options.sessionAudience || null,
    },
  };
}

export function extractTherapeuticFormsPolicyVersion(content) {
  if (typeof content !== 'string' || !content) return null;
  return content.match(THERAPEUTIC_FORMS_POLICY_VERSION_PATTERN)?.[1] || null;
}

export function hasTherapeuticFormsPolicyVersion(messages, expectedVersion) {
  if (!Array.isArray(messages) || !expectedVersion) return false;

  return messages.some((message) => extractTherapeuticFormsPolicyVersion(message?.content) === expectedVersion);
}

export function buildTherapeuticFormsPolicyRefreshMessage(options = {}) {
  const { policy, policyVersion, diagnostics } = getTherapeuticFormsPolicyPayload(options);

  return {
    content: `${THERAPEUTIC_FORMS_POLICY_REFRESH_MARKER}\n${policy}`,
    policyVersion,
    diagnostics,
  };
}

export async function ensureTherapeuticFormsPolicyInjected({
  base44,
  conversation,
  sessionLanguage,
  sessionAudience,
  environment,
  isNewConversation = false,
  injectedVersionCache,
} = {}) {
  const conversationId = conversation?.id || null;
  const { content, policyVersion, diagnostics } = buildTherapeuticFormsPolicyRefreshMessage({
    sessionLanguage,
    sessionAudience,
    environment,
  });

  const cachedVersion = conversationId ? injectedVersionCache?.get(conversationId) : null;
  const alreadyInjected = cachedVersion === policyVersion || hasTherapeuticFormsPolicyVersion(conversation?.messages, policyVersion);
  const baseDiagnosticPayload = {
    ...diagnostics,
    conversationId,
    wasExistingConversation: !isNewConversation,
  };

  if (!conversationId || !conversation || !base44?.agents?.addMessage) {
    logTherapeuticFormsPolicyDiagnostic('refresh-skip', {
      ...baseDiagnosticPayload,
      injected: false,
      reason: 'missing-conversation-context',
    });
    return { injected: false, policyVersion, diagnostics: baseDiagnosticPayload };
  }

  if (alreadyInjected) {
    injectedVersionCache?.set(conversationId, policyVersion);
    logTherapeuticFormsPolicyDiagnostic('refresh-skip', {
      ...baseDiagnosticPayload,
      injected: false,
      reason: 'current-policy-already-present',
    });
    return { injected: false, policyVersion, diagnostics: baseDiagnosticPayload };
  }

  try {
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content,
    });
    injectedVersionCache?.set(conversationId, policyVersion);

    logTherapeuticFormsPolicyDiagnostic('refresh-injected', {
      ...baseDiagnosticPayload,
      injected: true,
      reason: 'current-policy-missing',
    });

    return { injected: true, policyVersion, diagnostics: baseDiagnosticPayload };
  } catch (error) {
    logTherapeuticFormsPolicyDiagnostic('refresh-error', {
      ...baseDiagnosticPayload,
      injected: false,
      reason: error?.message || 'unknown-error',
    });
    return { injected: false, policyVersion, diagnostics: baseDiagnosticPayload, error };
  }
}
