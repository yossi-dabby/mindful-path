/**
 * @file src/lib/therapistWorkflowEngine.js
 *
 * Therapist Upgrade — Stage 2 Phase 3 — Workflow Engine
 *
 * This module defines the upgraded therapist workflow engine: the fixed
 * 6-step response sequence, the response-shaping rules, the emotion
 * differentiation map, and the instruction builder used for context injection.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * Nothing in this module imports from or affects the current default therapist
 * path (CBT_THERAPIST_WIRING_HYBRID).  This module is referenced only by
 * CBT_THERAPIST_WIRING_STAGE2_V2 and the Phase 3 routing branch in
 * src/api/activeAgentWiring.js.  When THERAPIST_UPGRADE_WORKFLOW_ENABLED is
 * false (the default), this module is never invoked.
 *
 * SAFETY COMPATIBILITY
 * --------------------
 * All workflow instructions are additive context that shape response structure.
 * They do NOT replace, weaken, or bypass the existing safety stack
 * (postLlmSafetyFilter, sanitizeAgentOutput, sanitizeConversation,
 * enhancedCrisisDetector, risk panel flow).  Any existing safety signal always
 * takes precedence over workflow state.
 *
 * WHAT THIS MODULE MUST NOT DO
 * ----------------------------
 * - Alter the default therapist path in any way
 * - Introduce retrieval, live sources, or external knowledge
 * - Add session-write or session-tracking side effects
 * - Override existing crisis handling or risk-panel behavior
 * - Weaken any existing safety filter
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Phase 3
 */

// ─── Workflow version ─────────────────────────────────────────────────────────

/** @type {string} */
export const THERAPIST_WORKFLOW_VERSION = '3.0.0';

// ─── Fixed 6-step response sequence ──────────────────────────────────────────

/**
 * The fixed 6-step response sequence for the upgraded therapist path.
 *
 * This sequence is advisory and shapes the structure of responses — it does
 * not enforce mechanical turn-by-turn execution.  The therapist must use
 * clinical judgment to determine which step is most relevant in each turn,
 * while the overall arc of the sequence orients every response.
 *
 * Steps may be collapsed (e.g., validation + organization in the same response)
 * when the clinical picture is clear.  No step should be artificially stretched
 * with open-ended exploration when the pattern is already known.
 *
 * @type {ReadonlyArray<{step: number, name: string, description: string}>}
 */
export const THERAPIST_WORKFLOW_SEQUENCE = Object.freeze([
  Object.freeze({
    step: 1,
    name: 'brief_validation',
    description:
      'Briefly acknowledge what the person has shared. Validation should be ' +
      'proportionate — a sentence or two, not an extended empathy exercise. ' +
      'Move to structure once the person feels heard. Do not linger here.',
  }),
  Object.freeze({
    step: 2,
    name: 'organize_the_problem',
    description:
      'Organize the clinical picture: what is the presenting problem, what ' +
      'triggered it, what is the emotional response, and what behavior ' +
      'followed. Summarize rather than explore. If the picture is clear from ' +
      'prior context, do not re-explore what is already known.',
  }),
  Object.freeze({
    step: 3,
    name: 'map_the_current_cycle',
    description:
      'Identify the active cognitive-behavioral cycle or pattern explicitly. ' +
      'Name it directly when appropriate. Use CBT language (automatic thought, ' +
      'belief, trigger, behavior, consequence). Do not imply the pattern exists ' +
      'without naming it.',
  }),
  Object.freeze({
    step: 4,
    name: 'identify_intervention_point',
    description:
      'Identify the most accessible and highest-leverage intervention point ' +
      'in the current cycle. This is the place where the person has the most ' +
      'agency right now. Focus on one point — do not list multiple options.',
  }),
  Object.freeze({
    step: 5,
    name: 'focused_intervention',
    description:
      'Deliver one focused, concrete CBT intervention targeted at the ' +
      'identified intervention point. The intervention must be specific ' +
      'enough to act on. Do not provide a menu of techniques. Do not ' +
      'introduce new topics or tangents at this step.',
  }),
  Object.freeze({
    step: 6,
    name: 'concrete_next_step',
    description:
      'Close with one concrete, achievable next step the person can take ' +
      'before the next session (or immediately, if appropriate). The next ' +
      'step must be specific and action-oriented. Do not close with an ' +
      'open-ended question when a concrete step is possible.',
  }),
]);

// ─── Response-shaping rules ───────────────────────────────────────────────────

/**
 * Response-shaping rules for the upgraded therapist path.
 *
 * These rules constrain response structure in the upgraded workflow path only.
 * They have no effect on the current default therapist path.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const THERAPIST_WORKFLOW_RESPONSE_RULES = Object.freeze({
  /**
   * Reduce open-ended questions.  Only ask an open-ended question when the
   * clinical picture is genuinely unclear and more information is strictly
   * needed.  Do not use open-ended questions as a default filler or as a way
   * to avoid making a clinical assessment.
   */
  reduce_open_ended_questions:
    'Ask an open-ended question only when the clinical picture is genuinely ' +
    'unclear and the information cannot be inferred from context. When you ' +
    'know enough to make an assessment, make it — do not ask.',

  /**
   * Summarize more.  Demonstrate understanding by summarizing what you have
   * heard rather than re-asking what has already been disclosed.
   */
  summarize_over_explore:
    'Summarize what you have heard before asking for more. If the person has ' +
    'described a pattern in prior turns, reflect it back and advance — do not ' +
    're-explore what is already known.',

  /**
   * Name the pattern explicitly.  When a cognitive-behavioral cycle or pattern
   * is visible, name it directly.  Do not imply it exists without labeling it.
   */
  name_the_pattern:
    'When an automatic thought, belief, or behavioral cycle is clear from the ' +
    'session, name it directly and explicitly. Ambiguous reflection is less ' +
    'useful than a clear pattern label.',

  /**
   * Move earlier from empathy to structure.  Empathy is necessary and must
   * be present — but it is a foundation, not the whole response.  Once the
   * person feels heard, move to organization and intervention.
   */
  move_to_structure_early:
    'After brief validation, shift to structure. Empathy without structure ' +
    'does not advance the therapeutic arc. The person came to work — ' +
    'provide the structure that makes the work possible.',

  /**
   * End with something usable.  Every response should leave the person with
   * something concrete: an observation, a reframe, or a specific next step.
   * Do not end with an open question when a concrete takeaway is available.
   */
  end_with_something_usable:
    'End each response with something the person can use: a reframe, an ' +
    'observation about their pattern, or a specific action. Do not end with ' +
    'an open question when a concrete takeaway is already available.',

  /**
   * Slow down for extreme, catastrophic, or hopeless language.  When the
   * person uses extreme, absolute, or collapse language, do not advance the
   * structured sequence — slow down, validate more fully, and assess before
   * proceeding.  This is a clinical judgment moment, not a mechanical pause.
   */
  slow_down_for_extreme_language:
    'When the person uses extreme, catastrophic, absolute, or hopeless ' +
    'language, slow down. Do not advance the structured sequence until the ' +
    'language has been acknowledged and the emotional state assessed. The ' +
    'sequence does not override clinical judgment about distress level.',

  /**
   * Remain compatible with the existing safety stack.  The workflow engine
   * does not modify, bypass, or replace any existing safety behavior.
   * When a safety signal is present, defer entirely to the existing safety
   * system — do not attempt to continue with the structured sequence.
   */
  safety_stack_compatibility:
    'The structured workflow sequence does not apply when a safety signal is ' +
    'present (crisis language, risk indicators, or any condition that would ' +
    'normally activate the existing safety or risk-panel flow). In those ' +
    'cases, defer entirely to the existing safety system.',
});

// ─── Emotion differentiation map ─────────────────────────────────────────────

/**
 * Emotion differentiation map for the upgraded therapist path.
 *
 * The upgraded path must distinguish explicitly between these emotional states
 * because each requires a different clinical response.  Conflating them
 * (treating guilt as shame, or self-attack as remorse) results in misaligned
 * interventions that can be counter-productive or harmful.
 *
 * This map is not an exhaustive clinical taxonomy — it is a working
 * differentiation guide scoped to the most commonly conflated states.
 *
 * @type {Readonly<Record<string, {label: string, description: string, clinical_note: string}>>}
 */
export const THERAPIST_WORKFLOW_EMOTION_MAP = Object.freeze({
  remorse: Object.freeze({
    label: 'remorse',
    description:
      'Regret about a past action that acknowledges harm done and carries ' +
      'a forward-looking quality — the person wants to repair or do better.',
    clinical_note:
      'Remorse is often adaptive. It can be worked with constructively. ' +
      'Distinguish from guilt by the forward-looking quality and the ' +
      'absence of self-condemnation as a theme.',
  }),
  guilt: Object.freeze({
    label: 'guilt',
    description:
      'The belief that one has violated a personal or moral value. Focused ' +
      'on the action ("I did something wrong") rather than the self.',
    clinical_note:
      'Guilt is about behavior. It is amenable to responsibility-taking, ' +
      'repair, and value clarification. Distinguish from shame, which is ' +
      'about identity, not behavior.',
  }),
  shame: Object.freeze({
    label: 'shame',
    description:
      'The belief that one is fundamentally flawed, defective, or unworthy ' +
      'as a person. Focused on identity ("I am bad") rather than action.',
    clinical_note:
      'Shame is often the most clinically significant. It is less amenable ' +
      'to behavioral interventions and requires careful, non-shaming ' +
      'engagement. Do not attempt to "correct" shame with reassurance — ' +
      'it typically escalates. Address the self-belief directly.',
  }),
  self_attack: Object.freeze({
    label: 'self-attack',
    description:
      'Active, ongoing internal criticism or punishment of the self. More ' +
      'behavioral and repetitive than guilt — the person is doing something ' +
      'to themselves in the present moment.',
    clinical_note:
      'Self-attack is a behavior, not just a feeling. It can be addressed ' +
      'directly as a pattern (e.g., using compassion-focused or cognitive ' +
      'defusion approaches). Identify it as a behavior and name it.',
  }),
  despair: Object.freeze({
    label: 'despair',
    description:
      'Hopelessness about the future or about the possibility of change. ' +
      'Characterized by a sense that nothing will get better regardless of ' +
      'what is done.',
    clinical_note:
      'Despair requires slowing down. Do not attempt the structured sequence ' +
      'when despair is the primary presenting state. Assess first. Validate ' +
      'the hopelessness before any reframe. Premature positive reframing ' +
      'when someone is in despair is typically experienced as dismissive.',
  }),
  collapse_language: Object.freeze({
    label: 'collapse language',
    description:
      'Language that signals a shutdown of agency, possibility, or capacity: ' +
      '"I can\'t", "it\'s over", "nothing works", "I give up", "there\'s no ' +
      'point", "I\'m done". Collapse language may or may not involve clinical ' +
      'crisis, but it always warrants a slower, more careful response.',
    clinical_note:
      'Collapse language is a signal to slow down. Do not advance the ' +
      'structured sequence when collapse language is present. Acknowledge ' +
      'the state, assess its depth, and do not respond with the intervention ' +
      'or next-step steps until the person\'s capacity to engage has been ' +
      'restored or assessed.',
  }),
});

// ─── Workflow context instructions builder ────────────────────────────────────

/**
 * Builds the workflow context instruction string for injection into the
 * upgraded therapist session context.
 *
 * This string is designed to be appended to the session context as a clearly
 * delimited, labeled section.  It must not be interleaved with or replace
 * any existing system prompt section.
 *
 * The instruction text describes the upgraded workflow contract: the fixed
 * 6-step sequence, the response-shaping rules, and the emotion differentiation
 * guidance.  It is a structural instruction, not a clinical protocol override.
 *
 * SAFETY NOTE: The instruction text explicitly states that the workflow
 * sequence does not apply when safety signals are present and that all
 * existing safety behavior takes precedence.
 *
 * @returns {string} The workflow context instruction string
 */
export function buildWorkflowContextInstructions() {
  const steps = THERAPIST_WORKFLOW_SEQUENCE.map(
    (s) => `  Step ${s.step} (${s.name}): ${s.description}`,
  ).join('\n');

  const emotionEntries = Object.values(THERAPIST_WORKFLOW_EMOTION_MAP)
    .map((e) => `  ${e.label}: ${e.description}`)
    .join('\n');

  return [
    '=== UPGRADED THERAPIST WORKFLOW — STAGE 2 PHASE 3 ===',
    '',
    'This session is operating under the Stage 2 upgraded therapist workflow.',
    'The following instructions shape your response structure for this session.',
    'These instructions are additive — they do not replace any existing',
    'clinical guardrails, safety filters, or crisis-response behavior.',
    'All existing safety behavior takes strict precedence over this workflow.',
    '',
    '--- FIXED RESPONSE SEQUENCE ---',
    'Structure your responses around this 6-step sequence.',
    'You may collapse adjacent steps when the clinical picture is clear.',
    'Do not mechanically execute each step as a separate paragraph.',
    'Use clinical judgment to determine the appropriate pace and scope.',
    '',
    steps,
    '',
    '--- RESPONSE-SHAPING RULES ---',
    '',
    `1. Reduce open-ended questions: ${THERAPIST_WORKFLOW_RESPONSE_RULES.reduce_open_ended_questions}`,
    '',
    `2. Summarize over explore: ${THERAPIST_WORKFLOW_RESPONSE_RULES.summarize_over_explore}`,
    '',
    `3. Name the pattern: ${THERAPIST_WORKFLOW_RESPONSE_RULES.name_the_pattern}`,
    '',
    `4. Move to structure early: ${THERAPIST_WORKFLOW_RESPONSE_RULES.move_to_structure_early}`,
    '',
    `5. End with something usable: ${THERAPIST_WORKFLOW_RESPONSE_RULES.end_with_something_usable}`,
    '',
    `6. Slow down for extreme language: ${THERAPIST_WORKFLOW_RESPONSE_RULES.slow_down_for_extreme_language}`,
    '',
    `7. Safety stack compatibility: ${THERAPIST_WORKFLOW_RESPONSE_RULES.safety_stack_compatibility}`,
    '',
    '--- EMOTION DIFFERENTIATION ---',
    'Distinguish explicitly between these states — each requires a different',
    'clinical response. Do not conflate them.',
    '',
    emotionEntries,
    '',
    '=== END UPGRADED THERAPIST WORKFLOW ===',
  ].join('\n');
}

/**
 * Pre-built workflow context instructions string.
 *
 * Frozen at module load to ensure consistent injection across all sessions
 * in the upgraded workflow path.  The content is identical to calling
 * buildWorkflowContextInstructions() directly.
 *
 * @type {string}
 */
export const THERAPIST_WORKFLOW_INSTRUCTIONS = buildWorkflowContextInstructions();

// ─── Phase 10 — Formulation-Led CBT ──────────────────────────────────────────

/**
 * Phase 10 formulation response rules.
 *
 * Each rule captures a clinically specific behavior that the therapist agent
 * must follow when formulation-led mode is active.  Rules are keyed by a
 * short identifier and valued with the full instruction text.
 *
 * This object is frozen to prevent accidental mutation during testing or
 * runtime evaluation.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const THERAPIST_FORMULATION_RESPONSE_RULES = Object.freeze({
  already_known_context:
    'Do not ask the person to repeat or re-explain information they have already provided. ' +
    'If the trigger, situation, or background is clear from prior turns, build on it — do not revisit it.',

  formulation_before_questioning:
    'Before asking any clarifying question, offer a brief clinical formulation: ' +
    'reflect the pattern you observe, name the emotion or belief, and connect it to the situation. ' +
    'A formulation is more useful than another question when the picture is already clear.',

  no_early_protocol_rituals:
    'In the first two turns, do not present intake menus, structured option lists, ' +
    'or protocol steps. Respond to what the person actually said. ' +
    'Empathic attunement in early turns is not a delay — it is the foundation.',

  natural_clinical_opening:
    'When the person opens with only a greeting (hi, hello, etc.), respond with a warm, ' +
    'natural clinical sentence and one open inviting question. ' +
    'Do not present a category menu. If the first message already contains a situation or feeling, ' +
    'respond directly to that — skip the generic opener.',

  confusion_handling:
    'When the person seems confused, asks for clarification, or questions the therapeutic framing, ' +
    'slow down. Restate in simple, warm language. Do not respond to confusion with another question. ' +
    'Offer a plain-language explanation of what you observe emotionally, then check whether it lands.',

  empathy_request_deepening:
    'When the person explicitly asks for empathy, for an explanation of what they are feeling, ' +
    'or says "I didn\'t understand" — pause the structured sequence entirely. ' +
    'Provide a clear, warm explanation of the emotional process you are observing. ' +
    'Do not deflect back into a CBT question.',

  source_honesty:
    'When drawing on retrieved knowledge or clinical frameworks, do not present them as ' +
    'personal opinions or fabricate certainty. If the basis for a claim is a known clinical ' +
    'framework or retrieved content, acknowledge that — briefly and naturally.',
});

/**
 * Builds the Phase 10 formulation-led CBT instruction string.
 *
 * The returned string is a self-contained instruction block that is injected
 * into the session-start content when the V6 wiring is active.  It extends
 * the V2 workflow instructions (THERAPIST_WORKFLOW_INSTRUCTIONS) and the V5
 * safety mode layer — neither is replaced.
 *
 * @returns {string} The formulation-led CBT instruction block
 */
export function buildFormulationLedInstructions() {
  const ruleEntries = Object.entries(THERAPIST_FORMULATION_RESPONSE_RULES)
    .map(([key, value]) => {
      const label = {
        already_known_context:        'Already-known context suppression',
        formulation_before_questioning: 'Formulation before questioning',
        no_early_protocol_rituals:    'No early protocol rituals',
        natural_clinical_opening:     'Natural clinical opening',
        confusion_handling:           'Confusion handling',
        empathy_request_deepening:    'Empathy-request deepening',
        source_honesty:               'Source and evidence honesty',
      }[key] ?? key;
      return `${label}: ${value}`;
    })
    .join('\n\n');

  return [
    '=== FORMULATION-LED CBT — PHASE 10 ===',
    '',
    'This session operates in formulation-led mode. In addition to the workflow',
    'sequence above, apply the following formulation-specific response rules.',
    'These rules refine how you engage — they do not replace the structured',
    'workflow, safety filters, or crisis-response behavior.',
    '',
    '--- FORMULATION RESPONSE RULES ---',
    '',
    ruleEntries,
    '',
    '=== END FORMULATION-LED CBT ===',
  ].join('\n');
}

/**
 * Pre-built formulation-led CBT instruction string.
 *
 * Frozen at module load.  Injected into the session-start content when V6
 * wiring is active via workflowContextInjector.js.
 *
 * @type {string}
 */
export const THERAPIST_FORMULATION_INSTRUCTIONS = buildFormulationLedInstructions();
