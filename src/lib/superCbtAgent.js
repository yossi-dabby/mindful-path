/**
 * @file src/lib/superCbtAgent.js
 *
 * SuperCbtAgent — Scaffold Module
 *
 * This module defines the wiring configuration and feature descriptor for the
 * SuperCbtAgent — an opt-in, non-breaking upgrade path intended to bring full
 * multilingual CBT coverage and advanced session orchestration to the CBT
 * Therapist agent in all 7 app languages (en, he, es, fr, de, it, pt).
 *
 * SCAFFOLD ONLY — NOT ACTIVE
 * --------------------------
 * This module exists for planning and future activation only.  It is NOT
 * referenced by src/api/activeAgentWiring.js and has zero effect on the
 * current production therapist path.  No user traffic routes here.
 *
 * This file may be imported freely in tests and utilities — it has no side
 * effects and never mutates any existing constant or wiring.
 *
 * HOW TO ACTIVATE (FUTURE — not in this PR)
 * -----------------------------------------
 * Activation requires ALL of the following steps in separate, reviewed PRs:
 *   1. Add SUPER_CBT_AGENT_ENABLED to THERAPIST_UPGRADE_FLAGS in featureFlags.js
 *      (double-gated: master gate + super agent flag, both default false).
 *   2. Add the super-agent routing branch to resolveTherapistWiring() in
 *      activeAgentWiring.js (placed last — highest priority only when enabled).
 *   3. Complete the i18n pass (all 7 languages; Task 3 of the super agent plan).
 *   4. Complete Phase 9 / regression testing for the super agent path.
 *   5. Human review and explicit approval before any flag is enabled.
 *
 * COMPOSITION APPROACH
 * --------------------
 * SUPER_CBT_AGENT_WIRING composes CBT_THERAPIST_WIRING_STAGE2_V5 (the highest
 * existing phase) by inheriting all its tool_configs and flags, then layering
 * the super_agent marker on top.  The entity access matrix is identical to V5 —
 * no new entity access is introduced at scaffold time.
 *
 * See docs/super-agent/README.md for the vision and roadmap.
 * See docs/super-agent/architecture.md for the composition approach.
 *
 * Source of truth:
 *   docs/super-agent/README.md
 *   docs/super-agent/architecture.md
 *   docs/therapist-upgrade-stage2-plan.md
 */

import { CBT_THERAPIST_WIRING_STAGE2_V5 } from '../api/agentWiring.js';

// ─── Version ──────────────────────────────────────────────────────────────────

/**
 * Semver version for the SuperCbtAgent scaffold.
 * Increment when scaffold-level structure changes.
 * @type {string}
 */
export const SUPER_CBT_AGENT_VERSION = '0.1.0';

// ─── Identity ─────────────────────────────────────────────────────────────────

/**
 * Canonical Base44 agent name.
 * Matches the existing CBT Therapist agent identity — the super agent is an
 * upgrade path for the same agent, not a separate agent.
 * @type {string}
 */
export const SUPER_CBT_AGENT_NAME = 'cbt_therapist';

/**
 * Super agent phase identifier.
 * Placed beyond all existing Stage 2 phases (1–10) to prevent collisions.
 * @type {string}
 */
export const SUPER_CBT_AGENT_PHASE = 'super.1';

// ─── Supported languages ──────────────────────────────────────────────────────

/**
 * All app languages targeted by the SuperCbtAgent multilingual capability.
 * Matches the 7 languages defined in src/components/i18n/translations.jsx.
 * @type {ReadonlyArray<string>}
 */
export const SUPER_CBT_AGENT_LANGUAGES = Object.freeze([
  'en', // English
  'he', // Hebrew
  'es', // Spanish
  'fr', // French
  'de', // German
  'it', // Italian
  'pt', // Portuguese
]);

// ─── Feature descriptor ───────────────────────────────────────────────────────

/**
 * Feature descriptor for the planned SuperCbtAgent capabilities.
 *
 * Each entry is a named capability with a status and description.
 * No capability listed here is currently active.
 *
 * Status values:
 *   'planned'   — not yet implemented; design stage only
 *   'scaffold'  — structure exists; no active code paths
 *   'inactive'  — implemented but not yet activated (behind a disabled flag)
 *
 * @type {Readonly<Record<string, Readonly<object>>>}
 */
export const SUPER_CBT_AGENT_FEATURES = Object.freeze({
  /**
   * Full multilingual CBT support in all 7 app languages.
   * All workflow instructions, emergency resources, and agent prompts will
   * be language-aware and route through the app i18n layer.
   */
  multilingual_cbt: Object.freeze({
    status: 'planned',
    description:
      'Full CBT session delivery in all 7 app languages (en, he, es, fr, de, it, pt). ' +
      'All workflow instructions, correction-pass rules, and emergency resource ' +
      'sections are language-aware. Language is resolved from user locale at ' +
      'session start and is stable for the lifetime of the session.',
    languages: SUPER_CBT_AGENT_LANGUAGES,
  }),

  /**
   * Dynamic CBT sub-protocol selection per session.
   * Protocol is derived from CaseFormulation and session context.
   */
  protocol_selection: Object.freeze({
    status: 'planned',
    description:
      'Dynamic CBT sub-protocol selection per session: standard CBT, ACT-informed, ' +
      'DBT-skills, MBSR-adjacent, or schema-focused. Protocol is selected from ' +
      'CaseFormulation and session context, never from user self-report alone. ' +
      'Defaults to standard CBT when formulation is absent or incomplete.',
  }),

  /**
   * Super-session context spanning multiple prior sessions.
   */
  cross_session_continuity: Object.freeze({
    status: 'planned',
    description:
      'Super-session context window synthesizing structured memory across ' +
      'multiple prior sessions (beyond the most recent summary) to enable ' +
      'longitudinal CBT case formulation tracking and arc-level goal alignment.',
  }),

  /**
   * Extended workflow orchestration building on Phase 3 engine.
   */
  advanced_workflow_orchestration: Object.freeze({
    status: 'planned',
    description:
      'Extends the existing Phase 3 workflow engine with protocol-specific ' +
      'response rules, session-arc tracking at the super-session level, and ' +
      'structured homework assignment integration.',
  }),
});

// ─── Wiring configuration ─────────────────────────────────────────────────────

/**
 * Wiring configuration for the SuperCbtAgent.
 *
 * Composes CBT_THERAPIST_WIRING_STAGE2_V5 (the highest existing phase) with
 * the super_agent marker.  The entity access matrix is inherited from V5 and
 * is IDENTICAL — no new entity access is introduced at scaffold time.
 *
 * INACTIVE — this config is not referenced in src/api/activeAgentWiring.js.
 * It becomes reachable only when:
 *   1. A SUPER_CBT_AGENT_ENABLED flag is added to featureFlags.js, AND
 *   2. resolveTherapistWiring() is updated to route to this config.
 * Neither step is performed in this scaffold PR.
 *
 * All super_agent_* fields are additive markers — they do not change any
 * entity access rule, retrieval bound, or safety constraint inherited from V5.
 *
 * @type {object}
 */
export const SUPER_CBT_AGENT_WIRING = {
  // ── Inherit all V5 fields (memory, workflow, retrieval, live, safety) ──────
  ...CBT_THERAPIST_WIRING_STAGE2_V5,

  // ── Super agent markers (additive) ─────────────────────────────────────────
  super_agent: true,
  super_agent_phase: SUPER_CBT_AGENT_PHASE,
  super_agent_version: SUPER_CBT_AGENT_VERSION,

  // ── Planned super agent capabilities (all false until activation PRs) ──────
  multilingual_context_enabled: false,
  protocol_selection_enabled: false,
  cross_session_continuity_enabled: false,
};
