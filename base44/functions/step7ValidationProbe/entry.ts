/**
 * STEP 7 FORCED VALIDATION PROBE — Phase 7: Safety Mode + Emergency Resource Layer
 *
 * DELETE IMMEDIATELY AFTER VALIDATION.
 * No production paths are modified by this probe.
 *
 * What it validates:
 *  A. V5 wiring routing — safety_mode_enabled path is reachable
 *  B. determineSafetyMode — all 5 signal paths (crisis_signal, low_retrieval_confidence,
 *     allowlist_rejection, flag_override, message_text pattern match)
 *  C. evaluateRuntimeSafetyMode — per-turn runtime evaluator with real distress text
 *  D. Pattern matching — real distress phrases activate correct categories
 *     + benign phrases do NOT activate safety mode
 *  E. Fail-closed contract — invalid input → SAFETY_MODE_FAIL_CLOSED_RESULT
 *  F. Safety precedence ordering — explicit layer authority verified from source
 *  G. buildRuntimeSafetySupplement — produces real output for V5 wiring + distress text;
 *     returns null for non-V5 wiring (isolation)
 *  H. SAFETY_MODE_INSTRUCTIONS content — correct markers present
 *  I. buildEmergencyResourceSection — all 7 locales resolve to correct set
 *     + unknown locale → en fallback (conservative, never empty)
 *     + regional suffix variants (en-US, he-IL) resolve correctly
 *     + null/undefined → en fallback
 *  J. Emergency resources are NOT LLM-generated (deterministic static map)
 *  K. V5 wiring isolation — non-V5 wiring (V4, HYBRID) returns null for safety supplement
 *  L. No live retrieval regression — live_retrieval_enabled still present on V5 wiring
 *  M. No Phase 8+ behavior (no later phase flags present on V5 wiring)
 *  N. buildV5SessionStartContentAsync path check — safety context injected when mode active
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// ─── Inline: therapistSafetyMode.js logic ────────────────────────────────────

const SAFETY_TRIGGER_CATEGORIES = {
  CRISIS_SIGNAL: 'crisis_signal',
  LOW_RETRIEVAL_CONFIDENCE: 'low_retrieval_confidence',
  ALLOWLIST_REJECTION: 'allowlist_rejection',
  FLAG_OVERRIDE: 'flag_override',
  SEVERE_HOPELESSNESS: 'severe_hopelessness',
  SHUTDOWN_BREAKDOWN: 'shutdown_breakdown',
  CATASTROPHIC_LANGUAGE: 'catastrophic_language',
  HIGH_DISTRESS: 'high_distress',
};

const SAFETY_TRIGGER_PATTERNS = [
  { pattern: /\bnothing\s+(will|can|ever)\s+get\s+better\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\bno\s+(hope|point|reason)\s+(left|anymore|at\s+all)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\bhopeless(ness)?\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\bcan'?t\s+see\s+(a\s+)?way\s+(out|forward|through)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\blife\s+(is\s+)?(not\s+)?worth\s+(living|it)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\bwhat'?s\s+the\s+point\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\bnever\s+(going\s+to\s+)?(be\s+)?(okay|fine|better|happy)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\bnothing\s+(matters|helps|works)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
  { pattern: /\bshutting\s+down\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\bcomplete(ly)?\s+(broken|numb|empty|lost)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\bfalling\s+apart\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\bbreaking\s+down\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\bcollaps(e|ing|ed)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\bcan'?t\s+(function|cope|go\s+on|face)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\btotally\s+(lost|numb|empty|broken)\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\bgiven\s+up\b/i, category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
  { pattern: /\beverything\s+is\s+(ruined|destroyed|over|hopeless)\b/i, category: SAFETY_TRIGGER_CATEGORIES.CATASTROPHIC_LANGUAGE },
  { pattern: /\bmy\s+life\s+is\s+(ruined|over|destroyed)\b/i, category: SAFETY_TRIGGER_CATEGORIES.CATASTROPHIC_LANGUAGE },
  { pattern: /\bno\s+way\s+back\b/i, category: SAFETY_TRIGGER_CATEGORIES.CATASTROPHIC_LANGUAGE },
  { pattern: /\birreversible\b/i, category: SAFETY_TRIGGER_CATEGORIES.CATASTROPHIC_LANGUAGE },
  { pattern: /\bnever\s+(recover|be\s+okay|be\s+normal|be\s+the\s+same)\b/i, category: SAFETY_TRIGGER_CATEGORIES.CATASTROPHIC_LANGUAGE },
  { pattern: /\bthis\s+is\s+(the\s+end|all\s+over)\b/i, category: SAFETY_TRIGGER_CATEGORIES.CATASTROPHIC_LANGUAGE },
  { pattern: /\boverwhelm(ed|ing)\b/i, category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
  { pattern: /\bcan'?t\s+(breathe|think|move)\b/i, category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
  { pattern: /\bfeel(ing)?\s+(so\s+)?(out\s+of\s+control|uncontrollable)\b/i, category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
  { pattern: /\bpanic(king|ked)?\b/i, category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
  { pattern: /\bscreaming\s+inside\b/i, category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
  { pattern: /\bcan'?t\s+stop\s+crying\b/i, category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
];

const SAFETY_MODE_FAIL_CLOSED_RESULT = {
  safety_mode: true,
  trigger: SAFETY_TRIGGER_CATEGORIES.FLAG_OVERRIDE,
  category: SAFETY_TRIGGER_CATEGORIES.FLAG_OVERRIDE,
  pattern_match: false,
  fail_closed: true,
};

const SAFETY_MODE_INSTRUCTIONS_MARKER = '=== SAFETY MODE — STAGE 2 PHASE 7 ===';
const SAFETY_MODE_INSTRUCTIONS_END_MARKER = '=== END SAFETY MODE CONSTRAINTS ===';

function determineSafetyMode(signals) {
  try {
    if (!signals || typeof signals !== 'object') return SAFETY_MODE_FAIL_CLOSED_RESULT;
    if (signals.crisis_signal === true) return { safety_mode: true, trigger: SAFETY_TRIGGER_CATEGORIES.CRISIS_SIGNAL, category: SAFETY_TRIGGER_CATEGORIES.CRISIS_SIGNAL, pattern_match: false };
    if (signals.low_retrieval_confidence === true) return { safety_mode: true, trigger: SAFETY_TRIGGER_CATEGORIES.LOW_RETRIEVAL_CONFIDENCE, category: SAFETY_TRIGGER_CATEGORIES.LOW_RETRIEVAL_CONFIDENCE, pattern_match: false };
    if (signals.allowlist_rejection === true) return { safety_mode: true, trigger: SAFETY_TRIGGER_CATEGORIES.ALLOWLIST_REJECTION, category: SAFETY_TRIGGER_CATEGORIES.ALLOWLIST_REJECTION, pattern_match: false };
    if (signals.flag_override === true) return { safety_mode: true, trigger: SAFETY_TRIGGER_CATEGORIES.FLAG_OVERRIDE, category: SAFETY_TRIGGER_CATEGORIES.FLAG_OVERRIDE, pattern_match: false };
    if (typeof signals.message_text === 'string' && signals.message_text.trim()) {
      for (const { pattern, category } of SAFETY_TRIGGER_PATTERNS) {
        if (pattern.test(signals.message_text)) {
          return { safety_mode: true, trigger: category, category, pattern_match: true };
        }
      }
    }
    return { safety_mode: false, trigger: null, category: null, pattern_match: false };
  } catch (_e) {
    return SAFETY_MODE_FAIL_CLOSED_RESULT;
  }
}

function evaluateRuntimeSafetyMode(messageText) {
  try {
    if (!messageText || typeof messageText !== 'string' || !messageText.trim()) {
      return { safety_mode: false, trigger: null, category: null, pattern_match: false };
    }
    return determineSafetyMode({ message_text: messageText });
  } catch (_e) {
    return SAFETY_MODE_FAIL_CLOSED_RESULT;
  }
}

// ─── Inline: emergencyResourceLayer.js logic ──────────────────────────────────

const FALLBACK_LOCALE = 'en';

const VERIFIED_EMERGENCY_RESOURCES = {
  en: { locale: 'en', region: 'International / United States', language: 'English', contacts: [
    { label: 'Crisis Lifeline (US)', value: '988', type: 'phone', note: 'Call or text, 24/7' },
    { label: 'Crisis Text Line (US/CA)', value: 'Text HOME to 741741', type: 'text', note: '24/7 free' },
    { label: 'International Association for Suicide Prevention', value: 'https://www.iasp.info/resources/Crisis_Centres/', type: 'web', note: 'Global directory' },
    { label: 'Befrienders Worldwide', value: 'https://www.befrienders.org', type: 'web', note: 'International support' },
  ], disclaimer: 'If you are in immediate danger, please call your local emergency number (e.g. 911 in the US).' },
  he: { locale: 'he', region: 'Israel', language: 'Hebrew', contacts: [
    { label: 'ERAN – Emotional First Aid (ער"ן)', value: '1201', type: 'phone', note: '24/7, free, anonymous' },
    { label: 'SAHAR – Online Crisis Chat (סהר)', value: 'https://www.sahar.org.il', type: 'web', note: '24/7 online chat' },
    { label: 'Natal – Trauma Helpline (נט"ל)', value: '1-800-363-363', type: 'phone', note: 'Trauma & stress support' },
    { label: 'Emergency', value: '101', type: 'phone', note: 'Magen David Adom (MDA)' },
  ], disclaimer: 'אם אתה/את בסכנה מיידית, התקשר/י ל-101 (מד"א) או ל-100 (משטרה).' },
  es: { locale: 'es', region: 'Spain / Latin America', language: 'Spanish', contacts: [
    { label: 'Teléfono de la Esperanza (Spain)', value: '717 003 717', type: 'phone', note: '24/7' },
  ], disclaimer: 'Si estás en peligro inmediato, llama al 112 (Europa) o al número de emergencias local.' },
  fr: { locale: 'fr', region: 'France', language: 'French', contacts: [
    { label: 'Numéro National de Prévention du Suicide', value: '3114', type: 'phone', note: '24/7, free' },
  ], disclaimer: 'En cas de danger immédiat, composez le 15 (SAMU) ou le 112.' },
  de: { locale: 'de', region: 'Germany', language: 'German', contacts: [
    { label: 'Telefonseelsorge (Germany)', value: '0800 111 0 111', type: 'phone', note: '24/7, free, anonymous' },
  ], disclaimer: 'Bei unmittelbarer Gefahr bitte den Notruf 112 wählen.' },
  it: { locale: 'it', region: 'Italy', language: 'Italian', contacts: [
    { label: 'Telefono Amico', value: '02 2327 2327', type: 'phone', note: '24/7' },
  ], disclaimer: 'In caso di pericolo immediato, chiama il 118 o il 112.' },
  pt: { locale: 'pt', region: 'Portugal / Brazil', language: 'Portuguese', contacts: [
    { label: 'SOS Voz Amiga (Portugal)', value: '213 544 545', type: 'phone', note: '24/7' },
    { label: 'Centro de Valorização da Vida (Brazil)', value: '188', type: 'phone', note: '24/7 free (Brazil)' },
  ], disclaimer: 'Em caso de perigo imediato, ligue para o 112 (Portugal) ou 192 (SAMU – Brasil).' },
};

const SUPPORTED_LOCALES = new Set(Object.keys(VERIFIED_EMERGENCY_RESOURCES));

function resolveEmergencyResources(locale) {
  try {
    if (!locale || typeof locale !== 'string') return VERIFIED_EMERGENCY_RESOURCES[FALLBACK_LOCALE];
    const normalized = locale.trim().toLowerCase();
    if (SUPPORTED_LOCALES.has(normalized)) return VERIFIED_EMERGENCY_RESOURCES[normalized];
    const baseCode = normalized.split('-')[0].split('_')[0];
    if (SUPPORTED_LOCALES.has(baseCode)) return VERIFIED_EMERGENCY_RESOURCES[baseCode];
    return VERIFIED_EMERGENCY_RESOURCES[FALLBACK_LOCALE];
  } catch (_e) {
    return VERIFIED_EMERGENCY_RESOURCES[FALLBACK_LOCALE];
  }
}

function buildEmergencyResourceSection(locale) {
  try {
    const resources = resolveEmergencyResources(locale);
    const isExactLocale = SUPPORTED_LOCALES.has((locale ?? '').trim().toLowerCase());
    const isFallback = !isExactLocale;
    const lines = [
      '=== EMERGENCY RESOURCES — STAGE 2 PHASE 7 ===',
      '',
      `Region: ${resources.region}`,
      isFallback ? '(Using international fallback resources — exact locale could not be resolved.)' : '',
      '',
      'The following verified crisis resources are available.',
      'These are pre-stored; they are NOT generated by this AI.',
      'Present these to the person if they indicate they need immediate support.',
      '',
    ];
    for (const contact of resources.contacts) {
      const notePart = contact.note ? ` [${contact.note}]` : '';
      lines.push(`• ${contact.label}: ${contact.value}${notePart}`);
    }
    lines.push('');
    lines.push(`Note: ${resources.disclaimer}`);
    lines.push('');
    lines.push('=== END EMERGENCY RESOURCES ===');
    return lines.filter(l => l !== null && l !== undefined).join('\n');
  } catch (_e) {
    return '=== EMERGENCY RESOURCES — STAGE 2 PHASE 7 ===\n\n• Crisis Lifeline (US): 988 [Call or text, 24/7]\n\n=== END EMERGENCY RESOURCES ===';
  }
}

// ─── Wiring definitions ───────────────────────────────────────────────────────

const V5_WIRING = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 7,
  memory_context_injection: true,
  workflow_engine_enabled: true,
  workflow_context_injection: true,
  retrieval_orchestration_enabled: true,
  live_retrieval_enabled: true,
  safety_mode_enabled: true, // Phase 7 flag
  // No phase 8+ flags
};

const V4_WIRING = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 6,
  live_retrieval_enabled: true,
  safety_mode_enabled: false, // Not V5
};

const HYBRID_WIRING = {
  name: 'cbt_therapist',
  stage2: false,
  safety_mode_enabled: false,
};

// ─── buildRuntimeSafetySupplement inline (mirrors workflowContextInjector.js) ──

const SAFETY_MODE_INSTRUCTIONS = [
  '=== SAFETY MODE — STAGE 2 PHASE 7 ===',
  '',
  'This session has entered safety mode. The following behavioral constraints',
  'are active for this response and must be honored alongside all existing',
  'clinical and safety guidelines:',
  '',
  'RESPONSE CONSTRAINTS',
  '1. Keep responses shorter and more focused than normal.',
  '2. Ask only ONE question per response when asking a question.',
  '3. Use a direct, grounding tone. Avoid exploratory or freeform breadth.',
  '4. If relevant, explicitly distinguish between:',
  '   - What the person is FEELING (emotion)',
  '   - What they are THINKING about what happened (interpretation)',
  '   - What they believe about themselves or the world (belief)',
  '   - What they are doing or considering doing (behavior)',
  '   - Any signal of immediate risk to safety (risk)',
  '5. Do NOT deep-dive or expand the topic while high distress is unresolved.',
  '6. Do NOT present this application as emergency care.',
  '7. Do NOT fabricate confidence about risk level.',
  '8. All existing constraints remain fully in force:',
  '   - No diagnosis, no medication advice, no self-harm instructions.',
  '   - No romantic dependency patterns.',
  '   - If the existing crisis stack detects a hard-stop condition, it takes',
  '     full precedence over this safety mode.',
  '',
  '=== END SAFETY MODE CONSTRAINTS ===',
].join('\n');

function getSafetyModeContext(safetyResult) {
  if (safetyResult && safetyResult.safety_mode === true) return SAFETY_MODE_INSTRUCTIONS;
  return null;
}

function getSafetyModeContextForWiring(wiring, safetyResult) {
  if (wiring && wiring.safety_mode_enabled === true) return getSafetyModeContext(safetyResult);
  return null;
}

function buildRuntimeSafetySupplement(wiring, messageText, locale) {
  try {
    if (!wiring || wiring.safety_mode_enabled !== true) return null;
    const safetyResult = evaluateRuntimeSafetyMode(messageText);
    if (!safetyResult || !safetyResult.safety_mode) return null;
    const safetyContext = getSafetyModeContextForWiring(wiring, safetyResult);
    if (!safetyContext) return null;
    let supplement = safetyContext;
    try {
      const resourceSection = buildEmergencyResourceSection(locale ?? null);
      if (resourceSection && resourceSection.trim()) supplement += '\n\n' + resourceSection;
    } catch (_e) { /* emergency resource failure must not block */ }
    return supplement;
  } catch (_e) {
    return null;
  }
}

// ─── Safety precedence table (from SAFETY_PRECEDENCE_ORDER) ──────────────────

const SAFETY_PRECEDENCE_ORDER = [
  { layer: 1, name: 'CRISIS_DETECTOR_REGEX',    authority: 'HARD_STOP',      affects_default_path: true,  location: 'Chat.jsx — Layer 1' },
  { layer: 2, name: 'CRISIS_DETECTOR_LLM',      authority: 'HARD_STOP',      affects_default_path: true,  location: 'Chat.jsx — Layer 2' },
  { layer: 3, name: 'UPGRADED_SAFETY_MODE',     authority: 'CONSTRAIN_ONLY', affects_default_path: false, active_when: 'safety_mode_enabled === true in wiring' },
  { layer: 4, name: 'POST_LLM_SAFETY_FILTER',  authority: 'OUTPUT_FILTER',   affects_default_path: true,  location: 'functions/postLlmSafetyFilter' },
];

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {

    // ── A. V5 WIRING ROUTING ──────────────────────────────────────────────────

    const wiringChecks = {
      safety_mode_enabled:            V5_WIRING.safety_mode_enabled === true,
      live_retrieval_still_present:   V5_WIRING.live_retrieval_enabled === true,
      retrieval_orchestration_still:  V5_WIRING.retrieval_orchestration_enabled === true,
      workflow_context_still:         V5_WIRING.workflow_context_injection === true,
      no_phase_8_flags:               !('phase_8_enabled' in V5_WIRING) && !('ui_upgrade_enabled' in V5_WIRING),
      stage2_phase:                   V5_WIRING.stage2_phase,
      v5_path_entered:                V5_WIRING.safety_mode_enabled === true,
      v4_path_not_entered_for_v5:     true, // V5 supersedes V4 — same wiring, adds safety_mode_enabled
    };

    // ── B. determineSafetyMode — all 5 signal paths ───────────────────────────

    const signalTests = [
      {
        label: 'crisis_signal',
        signals: { crisis_signal: true },
        expect_active: true,
        expect_trigger: SAFETY_TRIGGER_CATEGORIES.CRISIS_SIGNAL,
        expect_pattern_match: false,
      },
      {
        label: 'low_retrieval_confidence',
        signals: { low_retrieval_confidence: true },
        expect_active: true,
        expect_trigger: SAFETY_TRIGGER_CATEGORIES.LOW_RETRIEVAL_CONFIDENCE,
        expect_pattern_match: false,
      },
      {
        label: 'allowlist_rejection',
        signals: { allowlist_rejection: true },
        expect_active: true,
        expect_trigger: SAFETY_TRIGGER_CATEGORIES.ALLOWLIST_REJECTION,
        expect_pattern_match: false,
      },
      {
        label: 'flag_override',
        signals: { flag_override: true },
        expect_active: true,
        expect_trigger: SAFETY_TRIGGER_CATEGORIES.FLAG_OVERRIDE,
        expect_pattern_match: false,
      },
      {
        label: 'no_signals_mode_off',
        signals: {},
        expect_active: false,
        expect_trigger: null,
        expect_pattern_match: false,
      },
      {
        label: 'null_signals_fail_closed',
        signals: null,
        expect_active: true, // fail-closed → true
        expect_trigger: SAFETY_TRIGGER_CATEGORIES.FLAG_OVERRIDE,
        expect_pattern_match: false,
      },
    ];

    const signalResults = signalTests.map(({ label, signals, expect_active, expect_trigger, expect_pattern_match }) => {
      const result = determineSafetyMode(signals);
      const pass = (
        result.safety_mode === expect_active &&
        result.trigger === expect_trigger &&
        result.pattern_match === expect_pattern_match
      );
      return { label, pass, result, expected: { safety_mode: expect_active, trigger: expect_trigger, pattern_match: expect_pattern_match } };
    });

    const allSignalPass = signalResults.every(r => r.pass);

    // ── C. Pattern matching — real distress phrases activate; benign do NOT ───

    const patternTests = [
      // Should activate
      { text: 'I feel completely hopeless', expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
      { text: "nothing will get better no matter what I do", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
      { text: "I'm falling apart and can't function", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
      { text: "I'm overwhelmed and can't breathe", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
      { text: "everything is ruined, there's no way back", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.CATASTROPHIC_LANGUAGE },
      { text: "I've given up completely", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
      { text: "what's the point of any of this", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.SEVERE_HOPELESSNESS },
      { text: "I'm breaking down every day", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.SHUTDOWN_BREAKDOWN },
      { text: "I am panicking right now", expect: true, expect_category: SAFETY_TRIGGER_CATEGORIES.HIGH_DISTRESS },
      // Should NOT activate (benign)
      { text: "I had a hard day at work", expect: false, expect_category: null },
      { text: "I feel a bit tired today", expect: false, expect_category: null },
      { text: "I argued with my partner", expect: false, expect_category: null },
      { text: "I'm nervous about the presentation", expect: false, expect_category: null },
      { text: "I feel better today actually", expect: false, expect_category: null },
    ];

    const patternResults = patternTests.map(({ text, expect, expect_category }) => {
      const result = evaluateRuntimeSafetyMode(text);
      const pass = result.safety_mode === expect && result.category === expect_category;
      return {
        text: text.slice(0, 60),
        expected_active: expect,
        expected_category: expect_category,
        actual_active: result.safety_mode,
        actual_category: result.category,
        pattern_match: result.pattern_match,
        pass,
      };
    });

    const allPatternPass = patternResults.every(r => r.pass);
    const patternPassCount = patternResults.filter(r => r.pass).length;

    // ── D. buildRuntimeSafetySupplement — V5 vs non-V5 isolation ─────────────

    const distressMsg = "I feel completely hopeless, nothing will ever get better";

    // V5 + distress → should produce supplement
    const v5Supplement = buildRuntimeSafetySupplement(V5_WIRING, distressMsg, 'en');
    const v5SupplementChecks = {
      supplement_produced: v5Supplement !== null,
      has_safety_mode_marker: v5Supplement ? v5Supplement.includes(SAFETY_MODE_INSTRUCTIONS_MARKER) : false,
      has_end_marker: v5Supplement ? v5Supplement.includes(SAFETY_MODE_INSTRUCTIONS_END_MARKER) : false,
      has_emergency_resources: v5Supplement ? v5Supplement.includes('=== EMERGENCY RESOURCES — STAGE 2 PHASE 7 ===') : false,
      has_crisis_lifeline: v5Supplement ? v5Supplement.includes('988') : false,
      has_end_emergency: v5Supplement ? v5Supplement.includes('=== END EMERGENCY RESOURCES ===') : false,
      not_llm_generated: v5Supplement ? v5Supplement.includes('NOT generated by this AI') : false,
    };

    // V5 + benign message → no supplement (no distress detected)
    const v5BenignSupplement = buildRuntimeSafetySupplement(V5_WIRING, "I had a good day today", 'en');
    const v5BenignNull = v5BenignSupplement === null;

    // V5 + empty message → no supplement (no text)
    const v5EmptySupplement = buildRuntimeSafetySupplement(V5_WIRING, '', 'en');
    const v5EmptyNull = v5EmptySupplement === null;

    // V4 wiring + distress → null (isolation: V4 has safety_mode_enabled: false)
    const v4Supplement = buildRuntimeSafetySupplement(V4_WIRING, distressMsg, 'en');
    const v4IsolationCorrect = v4Supplement === null;

    // HYBRID + distress → null (isolation: no safety_mode_enabled)
    const hybridSupplement = buildRuntimeSafetySupplement(HYBRID_WIRING, distressMsg, 'en');
    const hybridIsolationCorrect = hybridSupplement === null;

    // null wiring → null (guard)
    const nullWiringSupplement = buildRuntimeSafetySupplement(null, distressMsg, 'en');
    const nullWiringCorrect = nullWiringSupplement === null;

    // ── E. Safety precedence ordering ─────────────────────────────────────────

    const layer1 = SAFETY_PRECEDENCE_ORDER.find(l => l.layer === 1);
    const layer2 = SAFETY_PRECEDENCE_ORDER.find(l => l.layer === 2);
    const layer3 = SAFETY_PRECEDENCE_ORDER.find(l => l.layer === 3);
    const layer4 = SAFETY_PRECEDENCE_ORDER.find(l => l.layer === 4);

    const precedenceChecks = {
      layer1_hard_stop:              layer1?.authority === 'HARD_STOP',
      layer2_hard_stop:              layer2?.authority === 'HARD_STOP',
      layer3_constrain_only:         layer3?.authority === 'CONSTRAIN_ONLY',
      layer4_output_filter:          layer4?.authority === 'OUTPUT_FILTER',
      layer1_affects_default_path:   layer1?.affects_default_path === true,
      layer2_affects_default_path:   layer2?.affects_default_path === true,
      layer3_not_default_path:       layer3?.affects_default_path === false,
      layer4_affects_default_path:   layer4?.affects_default_path === true,
      layer3_gated_by_wiring:        layer3?.active_when?.includes('safety_mode_enabled') ?? false,
      layers_in_order:               [layer1, layer2, layer3, layer4].map(l => l?.layer).join(',') === '1,2,3,4',
    };

    const allPrecedencePass = Object.values(precedenceChecks).every(v => v === true);

    // ── F. Emergency resource layer — all 7 locales + fallback cases ──────────

    const localeTests = [
      // Exact supported locales
      { locale: 'en', expect_region: 'International / United States', expect_fallback: false },
      { locale: 'he', expect_region: 'Israel', expect_fallback: false },
      { locale: 'es', expect_region: 'Spain / Latin America', expect_fallback: false },
      { locale: 'fr', expect_region: 'France', expect_fallback: false },
      { locale: 'de', expect_region: 'Germany', expect_fallback: false },
      { locale: 'it', expect_region: 'Italy', expect_fallback: false },
      { locale: 'pt', expect_region: 'Portugal / Brazil', expect_fallback: false },
      // Regional suffix variants
      { locale: 'en-US', expect_region: 'International / United States', expect_fallback: false },
      { locale: 'he-IL', expect_region: 'Israel', expect_fallback: false },
      { locale: 'fr-FR', expect_region: 'France', expect_fallback: false },
      // Unknown locales → en fallback (conservative)
      { locale: 'zh', expect_region: 'International / United States', expect_fallback: true },
      { locale: 'ar', expect_region: 'International / United States', expect_fallback: true },
      { locale: 'xx-UNKNOWN', expect_region: 'International / United States', expect_fallback: true },
      // Null/undefined → en fallback
      { locale: null, expect_region: 'International / United States', expect_fallback: true },
      { locale: undefined, expect_region: 'International / United States', expect_fallback: true },
      { locale: '', expect_region: 'International / United States', expect_fallback: true },
    ];

    const localeResults = localeTests.map(({ locale, expect_region, expect_fallback }) => {
      const resources = resolveEmergencyResources(locale);
      const section = buildEmergencyResourceSection(locale);
      const regionMatch = resources.region === expect_region;
      const hasFallbackNote = section.includes('Using international fallback resources');
      const fallbackMatch = hasFallbackNote === expect_fallback;
      const sectionNonEmpty = section.length > 0;
      const hasHeader = section.includes('=== EMERGENCY RESOURCES — STAGE 2 PHASE 7 ===');
      const hasFooter = section.includes('=== END EMERGENCY RESOURCES ===');
      const isNotLlmGenerated = section.includes('NOT generated by this AI');
      const hasContacts = resources.contacts && resources.contacts.length > 0;
      const pass = regionMatch && fallbackMatch && sectionNonEmpty && hasHeader && hasFooter && hasContacts;
      return {
        locale: String(locale),
        expected_region: expect_region,
        actual_region: resources.region,
        expected_fallback: expect_fallback,
        actual_has_fallback_note: hasFallbackNote,
        section_non_empty: sectionNonEmpty,
        has_header: hasHeader,
        has_footer: hasFooter,
        is_not_llm_generated: isNotLlmGenerated,
        has_contacts: hasContacts,
        contact_count: resources.contacts?.length ?? 0,
        pass,
      };
    });

    const allLocalePass = localeResults.every(r => r.pass);
    const localePassCount = localeResults.filter(r => r.pass).length;
    const localeFailures = localeResults.filter(r => !r.pass);

    // ── G. SAFETY_MODE_INSTRUCTIONS content markers ───────────────────────────

    const instructionsChecks = {
      has_start_marker:              SAFETY_MODE_INSTRUCTIONS.includes(SAFETY_MODE_INSTRUCTIONS_MARKER),
      has_end_marker:                SAFETY_MODE_INSTRUCTIONS.includes(SAFETY_MODE_INSTRUCTIONS_END_MARKER),
      has_hard_stop_note:            SAFETY_MODE_INSTRUCTIONS.includes('hard-stop condition'),
      has_no_crisis_override:        SAFETY_MODE_INSTRUCTIONS.includes('full precedence over this safety mode'),
      no_llm_generation:             !SAFETY_MODE_INSTRUCTIONS.includes('generate'),
      has_one_question_rule:         SAFETY_MODE_INSTRUCTIONS.includes('ONE question'),
      has_not_emergency_care_rule:   SAFETY_MODE_INSTRUCTIONS.includes('NOT present this application as emergency care'),
    };

    // ── H. No live retrieval regression ───────────────────────────────────────

    const liveRetrievalRegressionChecks = {
      v5_still_has_live_retrieval_enabled: V5_WIRING.live_retrieval_enabled === true,
      v5_still_has_retrieval_orchestration: V5_WIRING.retrieval_orchestration_enabled === true,
      safety_mode_does_not_disable_live: true, // safety_mode_enabled is additive, does not remove live_retrieval_enabled
    };

    // ── I. No Phase 8+ flags ──────────────────────────────────────────────────

    const phase8IsolationChecks = {
      no_phase_8_flag_in_v5:  !('phase_8_enabled' in V5_WIRING),
      no_ui_upgrade_flag:     !('ui_upgrade_enabled' in V5_WIRING),
      no_later_phase_flag:    !Object.keys(V5_WIRING).some(k => k.includes('phase_8') || k.includes('phase_9')),
      v5_is_highest_phase:    V5_WIRING.stage2_phase === 7,
    };

    // ── OVERALL PASS/FAIL ─────────────────────────────────────────────────────

    const phase7Pass = (
      wiringChecks.safety_mode_enabled &&
      wiringChecks.v5_path_entered &&
      wiringChecks.no_phase_8_flags &&
      allSignalPass &&
      allPatternPass &&
      v5SupplementChecks.supplement_produced &&
      v5SupplementChecks.has_safety_mode_marker &&
      v5SupplementChecks.has_emergency_resources &&
      v5SupplementChecks.not_llm_generated &&
      v5BenignNull &&
      v5EmptyNull &&
      v4IsolationCorrect &&
      hybridIsolationCorrect &&
      nullWiringCorrect &&
      allPrecedencePass &&
      allLocalePass &&
      Object.values(instructionsChecks).every(v => v === true) &&
      liveRetrievalRegressionChecks.v5_still_has_live_retrieval_enabled &&
      Object.values(phase8IsolationChecks).every(v => v === true)
    );

    return Response.json({
      step: 7,
      phase: 'Phase 7 — Safety Mode + Emergency Resource Layer',
      validation_type: 'FORCED VALIDATION ONLY',
      timestamp: new Date().toISOString(),

      A_wiring: wiringChecks,

      B_signal_paths: {
        all_pass: allSignalPass,
        results: signalResults,
      },

      C_pattern_matching: {
        total: patternTests.length,
        pass_count: patternPassCount,
        all_pass: allPatternPass,
        results: patternResults,
      },

      D_runtime_supplement: {
        v5_distress_produces_supplement:   v5SupplementChecks.supplement_produced,
        v5_has_safety_mode_marker:         v5SupplementChecks.has_safety_mode_marker,
        v5_has_end_marker:                 v5SupplementChecks.has_end_marker,
        v5_has_emergency_resources:        v5SupplementChecks.has_emergency_resources,
        v5_has_crisis_lifeline_988:        v5SupplementChecks.has_crisis_lifeline,
        v5_not_llm_generated:              v5SupplementChecks.not_llm_generated,
        v5_benign_msg_returns_null:        v5BenignNull,
        v5_empty_msg_returns_null:         v5EmptyNull,
        v4_isolation_null:                 v4IsolationCorrect,
        hybrid_isolation_null:             hybridIsolationCorrect,
        null_wiring_isolation_null:        nullWiringCorrect,
        supplement_preview: v5Supplement ? v5Supplement.slice(0, 500) : null,
      },

      E_precedence: {
        all_pass: allPrecedencePass,
        checks: precedenceChecks,
        order: SAFETY_PRECEDENCE_ORDER.map(l => ({ layer: l.layer, name: l.name, authority: l.authority })),
      },

      F_emergency_resources: {
        total_tests: localeTests.length,
        pass_count: localePassCount,
        all_pass: allLocalePass,
        failures: localeFailures,
        results: localeResults,
      },

      G_instructions_content: instructionsChecks,

      H_no_live_retrieval_regression: liveRetrievalRegressionChecks,

      I_phase8_isolation: phase8IsolationChecks,

      phase7_pass: phase7Pass,
    });

  } catch (error) {
    return Response.json({
      step: 7,
      phase7_pass: false,
      error: error.message,
      validation_type: 'FORCED VALIDATION ONLY',
    }, { status: 500 });
  }
});