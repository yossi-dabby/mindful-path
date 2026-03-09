/**
 * @file src/api/agentWiring.js
 *
 * First-pass additive-only entity wiring for the two current agents.
 *
 * This file declares which entities are wired to each agent in Step 1 of the
 * content wiring rollout.  It is a pure configuration module — no runtime
 * behavior is changed and no existing API contracts are altered.
 *
 * Source of truth: docs/ai-agent-enforcement-spec.md §B (allowed entity set)
 * and §C (source order).  Only Preferred entities are wired in this step.
 * Restricted, caution-layer, and prohibited entities are intentionally absent.
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
 * Not wired in this step (deferred):
 *   - Allowed layer (Exercise, Resource, AudioContent, Journey) — both agents
 *   - Restricted entities (MoodEntry for CBT; Goal/SessionSummary for Companion)
 *   - Caution layer (CaseFormulation, Conversation)
 *   - All prohibited entities
 * ────────────────────────────────────────────────────────────────────────────
 */

/**
 * First-pass wiring for the CBT Therapist agent.
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
 * First-pass wiring for the AI Companion agent.
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
