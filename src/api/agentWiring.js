/**
 * @file src/api/agentWiring.js
 *
 * Additive-only entity wiring for the two current agents (Steps 1 and 2).
 *
 * This file declares which entities are wired to each agent.  It is a pure
 * configuration module — no runtime behavior is changed and no existing API
 * contracts are altered.
 *
 * Source of truth: docs/ai-agent-enforcement-spec.md §B (allowed entity set)
 * and §C (source order).
 *
 * ─── Step 1 wiring summary ──────────────────────────────────────────────────
 *
 * CBT Therapist (Preferred only):
 *   source_order 2 — SessionSummary   (prior-session continuity)
 *   source_order 3 — ThoughtJournal   (primary clinical working material)
 *   source_order 4 — Goal             (align all plans to active goals)
 *   source_order 5 — CoachingSession  (stage / arc tracking)
 *
 * AI Companion (Preferred only):
 *   source_order 1 — CompanionMemory  (personalization + tone; not clinical)
 *   source_order 2 — MoodEntry        (real-time emotional picture)
 *
 * ─── Step 2 wiring summary ──────────────────────────────────────────────────
 *
 * Both agents receive the four Allowed shared content-pool entities.
 * All Step 1 preferred entities are unchanged.  Shared entities are placed
 * at lower source_order positions to ensure they remain lower priority.
 *
 * CBT Therapist (adds Allowed shared layer):
 *   source_order 6 — Exercise         (behavioral experiments / clinical use)
 *   source_order 7 — Resource         (psychoeducation aligned to session)
 *   source_order 8 — AudioContent     (guided CBT practice audio)
 *   source_order 9 — Journey          (structured CBT program delivery)
 *
 * AI Companion (adds Allowed shared layer):
 *   source_order 3 — Exercise         (coping tools for distress / low mood)
 *   source_order 4 — Resource         (gentle self-help prompts)
 *   source_order 5 — AudioContent     (guided meditation / relaxation)
 *   source_order 6 — Journey          (gentle step-by-step pacing)
 *
 * Still deferred (not wired in Steps 1–2):
 *   - Restricted entities (MoodEntry for CBT; Goal/SessionSummary for Companion)
 *   - Caution layer (CaseFormulation, Conversation)
 *   - All prohibited entities
 * ────────────────────────────────────────────────────────────────────────────
 */

/**
 * Step 1 wiring for the CBT Therapist agent.
 *
 * Includes only the four Preferred entities defined in
 * docs/ai-agent-enforcement-spec.md §B.  Source order follows §C.
 */
export const CBT_THERAPIST_WIRING_STEP_1 = {
  name: 'cbt_therapist',
  tool_configs: [
    { entity_name: 'SessionSummary',  access_level: 'preferred', source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred', source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred', source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred', source_order: 5 },
  ],
};

/**
 * Step 1 wiring for the AI Companion agent.
 *
 * Includes only the two Preferred entities defined in
 * docs/ai-agent-enforcement-spec.md §B.  Source order follows §C.
 * CompanionMemory is explicitly flagged as not for clinical reasoning (§F).
 */
export const AI_COMPANION_WIRING_STEP_1 = {
  name: 'ai_companion',
  tool_configs: [
    {
      entity_name: 'CompanionMemory',
      access_level: 'preferred',
      source_order: 1,
      use_for_clinical_reasoning: false,
    },
    { entity_name: 'MoodEntry', access_level: 'preferred', source_order: 2 },
  ],
};

/**
 * Step 2 additive wiring for the CBT Therapist agent.
 *
 * Extends Step 1 with the four Allowed shared content-pool entities
 * (Exercise, Resource, AudioContent, Journey) as defined in
 * docs/ai-agent-enforcement-spec.md §B (Allowed) and §C (source order).
 *
 * Step 1 preferred entities are carried forward unchanged.
 * Shared entities use access_level 'allowed' and are placed at
 * source_order positions 6–9, keeping them lower priority than all
 * Step 1 preferred entities (which end at source_order 5).
 */
export const CBT_THERAPIST_WIRING_STEP_2 = {
  name: 'cbt_therapist',
  tool_configs: [
    // ── Step 1: Preferred entities (unchanged) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred', source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred', source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred', source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred', source_order: 5 },
    // ── Step 2: Allowed shared content pool ──
    { entity_name: 'Exercise',        access_level: 'allowed',   source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',   source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',   source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',   source_order: 9 },
  ],
};

/**
 * Step 2 additive wiring for the AI Companion agent.
 *
 * Extends Step 1 with the four Allowed shared content-pool entities
 * (Exercise, Resource, AudioContent, Journey) as defined in
 * docs/ai-agent-enforcement-spec.md §B (Allowed) and §C (source order).
 *
 * Step 1 preferred entities are carried forward unchanged.
 * Shared entities use access_level 'allowed' and are placed at
 * source_order positions 3–6, keeping them lower priority than all
 * Step 1 preferred entities (which end at source_order 2).
 */
export const AI_COMPANION_WIRING_STEP_2 = {
  name: 'ai_companion',
  tool_configs: [
    // ── Step 1: Preferred entities (unchanged) ──
    {
      entity_name: 'CompanionMemory',
      access_level: 'preferred',
      source_order: 1,
      use_for_clinical_reasoning: false,
    },
    { entity_name: 'MoodEntry',    access_level: 'preferred', source_order: 2 },
    // ── Step 2: Allowed shared content pool ──
    { entity_name: 'Exercise',     access_level: 'allowed',   source_order: 3 },
    { entity_name: 'Resource',     access_level: 'allowed',   source_order: 4 },
    { entity_name: 'AudioContent', access_level: 'allowed',   source_order: 5 },
    { entity_name: 'Journey',      access_level: 'allowed',   source_order: 6 },
  ],
};
