/**
 * @file src/api/agentWiring.js
 *
 * Additive-only entity wiring for the two current agents (Steps 1–3).
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
 * ─── Step 3 wiring summary ──────────────────────────────────────────────────
 *
 * Non-caution restricted entities are wired with hard guardrail flags.
 * All Step 1 preferred and Step 2 allowed entities are unchanged.
 * Restricted entities are placed at higher source_order numbers, keeping
 * them lower priority than all preferred and allowed entities.
 *
 * CBT Therapist (adds Restricted layer):
 *   source_order 10 — CompanionMemory  (read-only personalization baseline;
 *                                       read_only: true per §D)
 *   source_order 11 — MoodEntry        (session-tone calibration only;
 *                                       calibration_only: true per §D)
 *
 * AI Companion (adds Restricted layer):
 *   source_order  7 — Goal             (encouragement reference only;
 *                                       reference_only: true per §D)
 *   source_order  8 — SessionSummary   (continuity guardrail only;
 *                                       continuity_check_only: true per §D)
 *
 * Still deferred (not wired in Steps 1–3):
 *   - Caution layer (CaseFormulation, Conversation) — require additional
 *     clinical or privacy gating before wiring
 *   - All prohibited entities (permanently excluded)
 *
 * ─── Hybrid wiring summary ──────────────────────────────────────────────────
 *
 * Caution-layer entities are added as guarded secondary augmentation only.
 * V1 (Steps 1–3) remains the default operating layer, unchanged.  Caution
 * entities carry caution_layer: true and are placed at the lowest source_order
 * positions so they are always below every V1 source.
 *
 * CBT Therapist (adds caution-layer restricted entities):
 *   source_order 12 — CaseFormulation  (read-only, non-dominant secondary
 *                                       context; read_only: true,
 *                                       unrestricted: false per §D)
 *   source_order 13 — Conversation     (last-resort recall only;
 *                                       secondary_only: true;
 *                                       must not precede SessionSummary)
 *
 * AI Companion (adds caution-layer restricted entity):
 *   source_order  9 — Conversation     (secondary context only when
 *                                       CompanionMemory/MoodEntry/
 *                                       SessionSummary are insufficient;
 *                                       secondary_only: true)
 *
 *   CaseFormulation remains PROHIBITED for AI Companion (enforcement spec §E).
 *
 * All caution-layer entities:
 *   - caution_layer: true  (explicitly flagged)
 *   - access_level: 'restricted'  (never preferred or allowed)
 *   - source_order always above max V1 source_order for the same agent
 *   - Conversation: secondary_only: true, never preferred
 *   - CaseFormulation (CBT only): read_only: true, unrestricted: false
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

/**
 * Step 3 additive wiring for the CBT Therapist agent.
 *
 * Extends Step 2 with the two non-caution Restricted entities
 * (CompanionMemory, MoodEntry) as defined in
 * docs/ai-agent-enforcement-spec.md §B (Restricted) and §C (source order).
 *
 * Steps 1 and 2 entities are carried forward unchanged.
 * Restricted entities use access_level 'restricted' and are placed at
 * source_order positions 10–11, keeping them lower priority than all
 * Step 1 preferred (ends at 5) and Step 2 allowed (ends at 9) entities.
 *
 * Hard guardrails per §D:
 *   CompanionMemory — read_only: true (must not write/overwrite entries)
 *   MoodEntry       — calibration_only: true (session-tone calibration only;
 *                     must not substitute for structured clinical assessment)
 *
 * Still deferred (caution layer — not wired in Step 3):
 *   CaseFormulation — requires clinical-review gate before wiring
 *   Conversation    — requires privacy gate and minimum-window enforcement
 */
export const CBT_THERAPIST_WIRING_STEP_3 = {
  name: 'cbt_therapist',
  tool_configs: [
    // ── Step 1: Preferred entities (unchanged) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred', source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred', source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred', source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred', source_order: 5 },
    // ── Step 2: Allowed shared content pool (unchanged) ──
    { entity_name: 'Exercise',        access_level: 'allowed',   source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',   source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',   source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',   source_order: 9 },
    // ── Step 3: Restricted entities (hard guardrails per §D) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
  ],
};

/**
 * Step 3 additive wiring for the AI Companion agent.
 *
 * Extends Step 2 with the two non-caution Restricted entities
 * (Goal, SessionSummary) as defined in
 * docs/ai-agent-enforcement-spec.md §B (Restricted) and §C (source order).
 *
 * Steps 1 and 2 entities are carried forward unchanged.
 * Restricted entities use access_level 'restricted' and are placed at
 * source_order positions 7–8, keeping them lower priority than all
 * Step 1 preferred (ends at 2) and Step 2 allowed (ends at 6) entities.
 *
 * Hard guardrails per §D:
 *   Goal          — reference_only: true (encouragement reference only;
 *                   must not set, modify, or formally evaluate goals)
 *   SessionSummary — continuity_check_only: true (avoid repeating resolved
 *                    topics only; must not drive conversation direction)
 *
 * Still deferred (caution layer — not wired in Step 3):
 *   Conversation — requires privacy gate and minimum-window enforcement
 */
export const AI_COMPANION_WIRING_STEP_3 = {
  name: 'ai_companion',
  tool_configs: [
    // ── Step 1: Preferred entities (unchanged) ──
    {
      entity_name: 'CompanionMemory',
      access_level: 'preferred',
      source_order: 1,
      use_for_clinical_reasoning: false,
    },
    { entity_name: 'MoodEntry',       access_level: 'preferred',   source_order: 2 },
    // ── Step 2: Allowed shared content pool (unchanged) ──
    { entity_name: 'Exercise',        access_level: 'allowed',     source_order: 3 },
    { entity_name: 'Resource',        access_level: 'allowed',     source_order: 4 },
    { entity_name: 'AudioContent',    access_level: 'allowed',     source_order: 5 },
    { entity_name: 'Journey',         access_level: 'allowed',     source_order: 6 },
    // ── Step 3: Restricted entities (hard guardrails per §D) ──
    { entity_name: 'Goal',            access_level: 'restricted',  source_order: 7, reference_only: true },
    { entity_name: 'SessionSummary',  access_level: 'restricted',  source_order: 8, continuity_check_only: true },
  ],
};

/**
 * Hybrid wiring for the CBT Therapist agent.
 *
 * Extends Step 3 with the two caution-layer entities (CaseFormulation and
 * Conversation) as guarded secondary augmentation.  V1 (Steps 1–3) is
 * unchanged and remains the default operating layer.
 *
 * Caution entities are placed at source_order 12–13, strictly below every
 * V1 source (max V1 source_order: 11).
 *
 * Hard guardrails (caution layer):
 *   CaseFormulation — read_only: true    (must not write or overwrite)
 *                     unrestricted: false (clinical-review gated)
 *                     secondary_only: true (non-dominant context)
 *                     caution_layer: true
 *   Conversation    — secondary_only: true (must not be primary reasoning)
 *                     caution_layer: true
 *                     must not precede SessionSummary (enforced by validator)
 *
 * Source of truth: docs/ai-agent-hybrid-model.md §B, §D
 */
export const CBT_THERAPIST_WIRING_HYBRID = {
  name: 'cbt_therapist',
  tool_configs: [
    // ── Step 1: Preferred entities (unchanged) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (unchanged) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (unchanged) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (secondary augmentation only) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
  ],
};

/**
 * Hybrid wiring for the AI Companion agent.
 *
 * Extends Step 3 with Conversation as guarded secondary augmentation.
 * V1 (Steps 1–3) is unchanged and remains the default operating layer.
 *
 * CaseFormulation remains PROHIBITED for AI Companion (enforcement spec §E).
 * CompanionMemory, MoodEntry, and SessionSummary-safe continuity must be
 * preferred over raw Conversation at all times.
 *
 * Conversation is placed at source_order 9, strictly below every V1 source
 * (max V1 source_order for AI Companion: 8).
 *
 * Hard guardrails (caution layer):
 *   Conversation — secondary_only: true (may only augment, not replace,
 *                  CompanionMemory / MoodEntry / SessionSummary continuity)
 *                  caution_layer: true
 *                  must not precede SessionSummary (enforced by validator)
 *
 * Source of truth: docs/ai-agent-hybrid-model.md §B, §D
 */
export const AI_COMPANION_WIRING_HYBRID = {
  name: 'ai_companion',
  tool_configs: [
    // ── Step 1: Preferred entities (unchanged) ──
    {
      entity_name: 'CompanionMemory',
      access_level: 'preferred',
      source_order: 1,
      use_for_clinical_reasoning: false,
    },
    { entity_name: 'MoodEntry',       access_level: 'preferred',   source_order: 2 },
    // ── Step 2: Allowed shared content pool (unchanged) ──
    { entity_name: 'Exercise',        access_level: 'allowed',     source_order: 3 },
    { entity_name: 'Resource',        access_level: 'allowed',     source_order: 4 },
    { entity_name: 'AudioContent',    access_level: 'allowed',     source_order: 5 },
    { entity_name: 'Journey',         access_level: 'allowed',     source_order: 6 },
    // ── Step 3: Non-caution restricted entities (unchanged) ──
    { entity_name: 'Goal',            access_level: 'restricted',  source_order: 7, reference_only: true },
    { entity_name: 'SessionSummary',  access_level: 'restricted',  source_order: 8, continuity_check_only: true },
    // ── Hybrid: Caution-layer entity (secondary augmentation only) ──
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 9,
      secondary_only: true,
      caution_layer: true,
    },
  ],
};

// ─── Stage 2 wiring configs (Phase 1 and Phase 3 — not yet active) ───────────

/**
 * Stage 2 V1 wiring for the CBT Therapist agent.
 *
 * Phase 1 — Structured Memory Layer.
 *
 * This config is additive: it extends CBT_THERAPIST_WIRING_HYBRID with the
 * memory_context_injection flag.  The entity list is identical to the Hybrid
 * config — no new entities are added to the agent's retrieval scope in Phase 1.
 *
 * The memory_context_injection flag signals to the session-start orchestrator
 * that structured therapist memory should be retrieved
 * (via retrieveTherapistMemory) and prepended to the session context.
 * In Phase 1 this is inert — no automatic retrieval is wired to sessions yet.
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveTherapistWiring() returns it, which requires BOTH flags to be true:
 *   - THERAPIST_UPGRADE_ENABLED (master gate)
 *   - THERAPIST_UPGRADE_MEMORY_ENABLED (Phase 1 gate)
 * Both default to false.  ACTIVE_CBT_THERAPIST_WIRING remains
 * CBT_THERAPIST_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set THERAPIST_UPGRADE_ENABLED or THERAPIST_UPGRADE_MEMORY_ENABLED to false
 * to revert to CBT_THERAPIST_WIRING_HYBRID with no other code changes.
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Task 1.3
 */
export const CBT_THERAPIST_WIRING_STAGE2_V1 = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 1,
  memory_context_injection: true,
  tool_configs: [
    // ── Step 1: Preferred entities (unchanged from Hybrid) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (unchanged from Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (unchanged from Hybrid) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (unchanged from Hybrid) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
  ],
};

// ─── Stage 2 V2 wiring config (Phase 3 — not yet active) ─────────────────────

/**
 * Stage 2 V2 wiring for the CBT Therapist agent.
 *
 * Phase 3 — Therapist Workflow Engine.
 *
 * This config extends CBT_THERAPIST_WIRING_STAGE2_V1 with workflow engine
 * flags.  The entity list is identical to V1 (and HYBRID) — no new entities
 * are added to the agent's retrieval scope in Phase 3.
 *
 * New flags:
 *   workflow_engine_enabled      — signals Phase 3 workflow engine is active
 *   workflow_context_injection   — signals that buildWorkflowContextInstructions()
 *                                  should be appended to the session context by
 *                                  the session-start orchestrator
 *
 * Both flags are inert in the current app layer — no orchestrator reads them
 * automatically in Phase 3.  They exist as the wiring contract that a future
 * session-start orchestrator will read to enable context injection.
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveTherapistWiring() returns it, which requires BOTH flags to be true:
 *   - THERAPIST_UPGRADE_ENABLED (master gate)
 *   - THERAPIST_UPGRADE_WORKFLOW_ENABLED (Phase 3 gate)
 * Both default to false.  ACTIVE_CBT_THERAPIST_WIRING remains
 * CBT_THERAPIST_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set THERAPIST_UPGRADE_ENABLED or THERAPIST_UPGRADE_WORKFLOW_ENABLED to
 * false to revert to CBT_THERAPIST_WIRING_HYBRID with no other code changes.
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Task 3.2
 */
export const CBT_THERAPIST_WIRING_STAGE2_V2 = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 3,
  memory_context_injection: true,   // from V1 — structured memory layer
  workflow_engine_enabled: true,    // Phase 3 — workflow engine active
  workflow_context_injection: true, // Phase 3 — inject workflow instructions
  tool_configs: [
    // ── Step 1: Preferred entities (identical to V1 / Hybrid) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (identical to V1 / Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (identical to V1 / Hybrid) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (identical to V1 / Hybrid) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
  ],
};

// ─── Stage 2 V3 wiring config (Phase 5 — not yet active) ─────────────────────

/**
 * Stage 2 V3 wiring for the CBT Therapist agent.
 *
 * Phase 5 — Retrieval Orchestration.
 *
 * This config extends CBT_THERAPIST_WIRING_STAGE2_V2 with retrieval
 * orchestration flags and adds persisted external trusted knowledge as the
 * lowest-priority retrieval source.
 *
 * New flags:
 *   retrieval_orchestration_enabled  — signals Phase 5 retrieval orchestration
 *                                      is active; workflowContextInjector will
 *                                      append the retrieval context section to
 *                                      the session-start content.
 *
 * New entity:
 *   ExternalKnowledgeChunk (source_order 14) — persisted external trusted
 *   knowledge from Phase 4.  Read-only, lowest-priority, always labeled as
 *   external_trusted.  If this entity is empty (no ingested chunks), retrieval
 *   returns an empty result and the session continues normally (fail-open).
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveTherapistWiring() returns it, which requires BOTH flags to be true:
 *   - THERAPIST_UPGRADE_ENABLED (master gate)
 *   - THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED (Phase 5 gate)
 * Both default to false.  ACTIVE_CBT_THERAPIST_WIRING remains
 * CBT_THERAPIST_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set THERAPIST_UPGRADE_ENABLED or THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED
 * to false to revert to CBT_THERAPIST_WIRING_HYBRID with no other code changes.
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Phase 5
 */
export const CBT_THERAPIST_WIRING_STAGE2_V3 = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 5,
  memory_context_injection: true,            // from V1 — structured memory layer
  workflow_engine_enabled: true,             // from V2 — workflow engine active
  workflow_context_injection: true,          // from V2 — inject workflow instructions
  retrieval_orchestration_enabled: true,     // Phase 5 — retrieval orchestration active
  tool_configs: [
    // ── Step 1: Preferred entities (identical to V2 / V1 / Hybrid) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (identical to V2 / V1 / Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (identical to V2 / V1 / Hybrid) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (identical to V2 / V1 / Hybrid) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
    // ── Phase 5: External trusted knowledge (lowest priority; additive) ──
    //
    // ExternalKnowledgeChunk records were persisted in Phase 4.
    // source_order 14 places this entity below all existing sources.
    // read_only: true ensures no write access.
    // external_trusted: true labels it for source-separation at retrieval time.
    // If no chunks have been ingested, this entity returns empty results (fail-open).
    {
      entity_name: 'ExternalKnowledgeChunk',
      access_level: 'restricted',
      source_order: 14,
      read_only: true,
      external_trusted: true,
      caution_layer: false,
    },
  ],
};

// ─── Stage 2 V4 wiring config (Phase 6 — not yet active) ─────────────────────

/**
 * Stage 2 V4 wiring for the CBT Therapist agent.
 *
 * Phase 6 — Live Retrieval Wrapper + Allowlist Enforcement.
 *
 * This config extends CBT_THERAPIST_WIRING_STAGE2_V3 with live retrieval
 * capability via the technical allowlist wrapper.  V4 is a strict superset
 * of V3: all Phase 5 flags and entity tool_configs are preserved unchanged,
 * and one new flag is added.
 *
 * New flags:
 *   live_retrieval_enabled — signals Phase 6 live retrieval is available;
 *                            workflowContextInjector will inject the Phase 6
 *                            LIVE_RETRIEVAL_POLICY_INSTRUCTIONS section into
 *                            the session-start content, and
 *                            buildV4SessionStartContentAsync will execute
 *                            live retrieval as step 5 when internal sources
 *                            are insufficient and policy allows.
 *
 * Entity tool_configs: IDENTICAL to V3.  No new entity access is added.
 * Live retrieval accesses only technically allowlisted external URLs via the
 * backend fetchLiveResource function — it is not an entity access.
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveTherapistWiring() returns it, which requires BOTH flags to be true:
 *   - THERAPIST_UPGRADE_ENABLED (master gate)
 *   - THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED (Phase 6 gate)
 * Both default to false.  ACTIVE_CBT_THERAPIST_WIRING remains
 * CBT_THERAPIST_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED to false to revert to V3
 * with no other code changes.  Set THERAPIST_UPGRADE_ENABLED to false to
 * revert to HYBRID entirely.
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Phase 6
 */
export const CBT_THERAPIST_WIRING_STAGE2_V4 = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 6,
  memory_context_injection: true,           // from V1 — structured memory layer
  workflow_engine_enabled: true,            // from V2 — workflow engine active
  workflow_context_injection: true,         // from V2 — inject workflow instructions
  retrieval_orchestration_enabled: true,    // from V3 — Phase 5 retrieval orchestration
  live_retrieval_enabled: true,             // Phase 6 — live retrieval wrapper active
  tool_configs: [
    // ── Step 1: Preferred entities (identical to V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (identical to V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (identical to V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (identical to V3 / V2 / V1 / Hybrid) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
    // ── Phase 5: External trusted knowledge (identical to V3; lowest entity priority) ──
    {
      entity_name: 'ExternalKnowledgeChunk',
      access_level: 'restricted',
      source_order: 14,
      read_only: true,
      external_trusted: true,
      caution_layer: false,
    },
    // NOTE: Live retrieval (Phase 6) is NOT an entity access — it goes through
    // the technical allowlist wrapper (liveRetrievalWrapper.js) and the
    // fetchLiveResource backend function.  No new entity is added here.
  ],
};

// ─── Stage 2 V5 wiring config (Phase 7 — not yet active) ─────────────────────

/**
 * Stage 2 V5 wiring for the CBT Therapist agent.
 *
 * Phase 7 — Safety Mode + Emergency Resource Layer.
 *
 * This config extends CBT_THERAPIST_WIRING_STAGE2_V4 with safety mode
 * capability.  V5 is a strict superset of V4: all Phase 6 flags and entity
 * tool_configs are preserved unchanged, and one new flag is added.
 *
 * New flags:
 *   safety_mode_enabled — signals Phase 7 safety mode is available;
 *                         workflowContextInjector will evaluate safety mode
 *                         entry conditions and inject SAFETY_MODE_INSTRUCTIONS
 *                         into the session context when conditions are met.
 *                         Emergency resource injection is also gated on this
 *                         flag when safety mode is active.
 *
 * Entity tool_configs: IDENTICAL to V4.  No new entity access is added.
 * Safety mode constrains behavior at the context/instruction layer — it does
 * not add new entity access.
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveTherapistWiring() returns it, which requires BOTH flags to be true:
 *   - THERAPIST_UPGRADE_ENABLED (master gate)
 *   - THERAPIST_UPGRADE_SAFETY_MODE_ENABLED (Phase 7 gate)
 * Both default to false.  ACTIVE_CBT_THERAPIST_WIRING remains
 * CBT_THERAPIST_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set THERAPIST_UPGRADE_SAFETY_MODE_ENABLED to false to revert to V4 with
 * no other code changes.  Set THERAPIST_UPGRADE_ENABLED to false to revert
 * to HYBRID entirely.
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Phase 7
 */
export const CBT_THERAPIST_WIRING_STAGE2_V5 = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 7,
  memory_context_injection: true,           // from V1 — structured memory layer
  workflow_engine_enabled: true,            // from V2 — workflow engine active
  workflow_context_injection: true,         // from V2 — inject workflow instructions
  retrieval_orchestration_enabled: true,    // from V3 — Phase 5 retrieval orchestration
  live_retrieval_enabled: true,             // from V4 — Phase 6 live retrieval wrapper
  safety_mode_enabled: true,               // Phase 7 — safety mode active
  tool_configs: [
    // ── Step 1: Preferred entities (identical to V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (identical to V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (identical to V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (identical to V4 / V3 / V2 / V1 / Hybrid) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
    // ── Phase 5: External trusted knowledge (identical to V4 / V3; lowest entity priority) ──
    {
      entity_name: 'ExternalKnowledgeChunk',
      access_level: 'restricted',
      source_order: 14,
      read_only: true,
      external_trusted: true,
      caution_layer: false,
    },
    // NOTE: Live retrieval (Phase 6) is NOT an entity access — it goes through
    // the technical allowlist wrapper (liveRetrievalWrapper.js) and the
    // fetchLiveResource backend function.  No new entity is added here.
    // NOTE: Safety mode (Phase 7) is NOT an entity access — it constrains
    // behavior at the context/instruction layer.  No new entity is added here.
  ],
};

// ─── AI Companion Upgrade V1 wiring config (Phase 2 — not yet active) ────────

/**
 * Upgrade V1 wiring for the AI Companion agent.
 *
 * Phase 2 — Warmth and Attuned Response Layer.
 *
 * This config extends AI_COMPANION_WIRING_HYBRID with the companion upgrade
 * flags.  The entity list is IDENTICAL to the Hybrid config — no new entity
 * access is added in Phase 2.  The companion_upgrade and warmth_enabled flags
 * signal to the session context layer that the warmer, more emotionally attuned
 * response rules should be activated and that response variety tracking should
 * be enabled to reduce repetition.
 *
 * New flags:
 *   companion_upgrade  — master signal that this is an upgraded companion path
 *   companion_upgrade_phase — phase identifier (2)
 *   warmth_enabled     — activates warmer, more attuned response patterns and
 *                        anti-repetition tracking in the companion context layer
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveCompanionWiring() returns it, which requires BOTH flags to be true:
 *   - COMPANION_UPGRADE_ENABLED (master gate)
 *   - COMPANION_UPGRADE_WARMTH_ENABLED (Phase 2 gate)
 * Both default to false.  ACTIVE_AI_COMPANION_WIRING remains
 * AI_COMPANION_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set COMPANION_UPGRADE_ENABLED or COMPANION_UPGRADE_WARMTH_ENABLED to false
 * to revert to AI_COMPANION_WIRING_HYBRID with no other code changes.
 * THERAPIST wiring is completely unaffected by this flag.
 *
 * ROLE SEPARATION
 * ---------------
 * This wiring is intentionally isolated from the CBT Therapist upgrade chain.
 * The companion upgrade flags (COMPANION_UPGRADE_*) have no effect on
 * resolveTherapistWiring(), and the therapist upgrade flags
 * (THERAPIST_UPGRADE_*) have no effect on resolveCompanionWiring().
 *
 * Source of truth: Problem statement — Phase 2 AI Companion Upgrade Foundation
 */
export const AI_COMPANION_WIRING_UPGRADE_V1 = {
  name: 'ai_companion',
  companion_upgrade: true,
  companion_upgrade_phase: 2,
  warmth_enabled: true,             // Phase 2 — warmer, more attuned responses
  tool_configs: [
    // ── Step 1: Preferred entities (identical to Hybrid) ──
    {
      entity_name: 'CompanionMemory',
      access_level: 'preferred',
      source_order: 1,
      use_for_clinical_reasoning: false,
    },
    { entity_name: 'MoodEntry',       access_level: 'preferred',   source_order: 2 },
    // ── Step 2: Allowed shared content pool (identical to Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',     source_order: 3 },
    { entity_name: 'Resource',        access_level: 'allowed',     source_order: 4 },
    { entity_name: 'AudioContent',    access_level: 'allowed',     source_order: 5 },
    { entity_name: 'Journey',         access_level: 'allowed',     source_order: 6 },
    // ── Step 3: Non-caution restricted entities (identical to Hybrid) ──
    { entity_name: 'Goal',            access_level: 'restricted',  source_order: 7, reference_only: true },
    { entity_name: 'SessionSummary',  access_level: 'restricted',  source_order: 8, continuity_check_only: true },
    // ── Hybrid: Caution-layer entity (identical to Hybrid) ──
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 9,
      secondary_only: true,
      caution_layer: true,
    },
    // NOTE: CaseFormulation remains PROHIBITED for AI Companion at all upgrade
    // phases (enforcement spec §E).  No new prohibited entities are added here.
  ],
};

// ─── Stage 2 V6 wiring config (Phase 1 Quality Gains) ────────────────────────

/**
 * Stage 2 V6 wiring for the CBT Therapist agent.
 *
 * Phase 1 Quality Gains — Formulation Context Injection + Socratic Patterns.
 *
 * This config extends CBT_THERAPIST_WIRING_STAGE2_V5 with formulation-context
 * capability.  V6 is a strict superset of V5: all Phase 7 flags and entity
 * tool_configs are preserved unchanged, and one new flag is added.
 *
 * New flags:
 *   formulation_context_enabled — signals Phase 1 Quality Gains is active;
 *                         workflowContextInjector will read CaseFormulation
 *                         (read-only, caution layer) and inject its core
 *                         fields into the session-start context to ground
 *                         the therapist in the longitudinal clinical frame.
 *                         The Socratic, non-repetitive, and formulation-
 *                         aligned rules in the workflow engine are also active
 *                         on this wiring.
 *
 * Entity tool_configs: IDENTICAL to V5.  No new entity access is added.
 * Formulation context is read through the existing CaseFormulation tool_config
 * (source_order 12, read_only: true, caution_layer: true) already in V5.
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveTherapistWiring() returns it, which requires BOTH flags to be true:
 *   - THERAPIST_UPGRADE_ENABLED (master gate)
 *   - THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED (Phase 1 Quality gate)
 * Both default to false.  ACTIVE_CBT_THERAPIST_WIRING remains
 * CBT_THERAPIST_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED to false to revert to V5
 * with no other code changes.  Set THERAPIST_UPGRADE_ENABLED to false to
 * revert to HYBRID entirely.
 *
 * Source of truth: Problem statement — Phase 1 Highest-ROI Therapist Quality Gains
 */
export const CBT_THERAPIST_WIRING_STAGE2_V6 = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 10,
  memory_context_injection: true,           // from V1 — structured memory layer
  workflow_engine_enabled: true,            // from V2 — workflow engine active
  workflow_context_injection: true,         // from V2 — inject workflow instructions
  retrieval_orchestration_enabled: true,    // from V3 — Phase 5 retrieval orchestration
  live_retrieval_enabled: true,             // from V4 — Phase 6 live retrieval wrapper
  safety_mode_enabled: true,               // from V5 — Phase 7 safety mode
  formulation_context_enabled: true,       // Phase 1 Quality — formulation context injection
  tool_configs: [
    // ── Step 1: Preferred entities (identical to V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (identical to V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (identical to V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (identical to V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
    // ── Phase 5: External trusted knowledge (identical to V5 / V4 / V3; lowest entity priority) ──
    {
      entity_name: 'ExternalKnowledgeChunk',
      access_level: 'restricted',
      source_order: 14,
      read_only: true,
      external_trusted: true,
      caution_layer: false,
    },
    // NOTE: Live retrieval (Phase 6) is NOT an entity access — it goes through
    // the technical allowlist wrapper (liveRetrievalWrapper.js) and the
    // fetchLiveResource backend function.  No new entity is added here.
    // NOTE: Safety mode (Phase 7) is NOT an entity access — it constrains
    // behavior at the context/instruction layer.  No new entity is added here.
    // NOTE: Formulation context (Phase 1 Quality) is NOT a new entity access
    // — CaseFormulation is already present at source_order 12 (read_only:
    // true, caution_layer: true).  The formulation_context_enabled flag only
    // enables additional injection of CaseFormulation fields into the session-
    // start context payload via workflowContextInjector.js.
    // NOTE: Continuity layer (Phase 3) is NOT a new entity access — it reads
    // from CompanionMemory (source_order 10, read_only: true) which is already
    // present.  The continuity_layer_enabled flag enables cross-session memory
    // injection via crossSessionContinuity.js and workflowContextInjector.js.
  ],
};

// ─── Stage 2 V7 wiring config (Phase 3 Deep Personalization) ─────────────────

/**
 * Stage 2 V7 wiring for the CBT Therapist agent.
 *
 * Phase 3 Deep Personalization — Cross-Session Continuity Layer.
 *
 * This config extends CBT_THERAPIST_WIRING_STAGE2_V6 with cross-session
 * continuity capability.  V7 is a strict superset of V6: all Phase 1 Quality
 * and prior phase flags and entity tool_configs are preserved unchanged, and
 * one new flag is added.
 *
 * New flags:
 *   continuity_layer_enabled — activates cross-session memory injection;
 *                         workflowContextInjector reads the last N therapist
 *                         memory records from CompanionMemory (read-only,
 *                         bounded) and injects a structured continuity block
 *                         into the session-start payload so the therapist
 *                         agent can provide session-to-session awareness.
 *
 * Entity tool_configs: IDENTICAL to V6.  No new entity access is added.
 * Continuity reads from the existing CompanionMemory tool_config
 * (source_order 10, read_only: true) already present in V6.
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveTherapistWiring() returns it, which requires BOTH flags to be true:
 *   - THERAPIST_UPGRADE_ENABLED (master gate)
 *   - THERAPIST_UPGRADE_CONTINUITY_ENABLED (Phase 3 continuity gate)
 * Both default to false.  ACTIVE_CBT_THERAPIST_WIRING remains
 * CBT_THERAPIST_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set THERAPIST_UPGRADE_CONTINUITY_ENABLED to false to revert to V6
 * with no other code changes.  Set THERAPIST_UPGRADE_ENABLED to false to
 * revert to HYBRID entirely.
 *
 * Source of truth: Problem statement — Phase 3 Deep Personalization, Continuity,
 * Formulation Quality.
 */
export const CBT_THERAPIST_WIRING_STAGE2_V7 = {
  name: 'cbt_therapist',
  stage2: true,
  stage2_phase: 11,
  memory_context_injection: true,           // from V1 — structured memory layer
  workflow_engine_enabled: true,            // from V2 — workflow engine active
  workflow_context_injection: true,         // from V2 — inject workflow instructions
  retrieval_orchestration_enabled: true,    // from V3 — Phase 5 retrieval orchestration
  live_retrieval_enabled: true,             // from V4 — Phase 6 live retrieval wrapper
  safety_mode_enabled: true,               // from V5 — Phase 7 safety mode
  formulation_context_enabled: true,       // from V6 — Phase 1 Quality formulation context
  continuity_layer_enabled: true,          // Phase 3 — cross-session continuity injection
  tool_configs: [
    // ── Step 1: Preferred entities (identical to V6 / V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'SessionSummary',  access_level: 'preferred',  source_order: 2 },
    { entity_name: 'ThoughtJournal',  access_level: 'preferred',  source_order: 3 },
    { entity_name: 'Goal',            access_level: 'preferred',  source_order: 4 },
    { entity_name: 'CoachingSession', access_level: 'preferred',  source_order: 5 },
    // ── Step 2: Allowed shared content pool (identical to V6 / V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',    source_order: 6 },
    { entity_name: 'Resource',        access_level: 'allowed',    source_order: 7 },
    { entity_name: 'AudioContent',    access_level: 'allowed',    source_order: 8 },
    { entity_name: 'Journey',         access_level: 'allowed',    source_order: 9 },
    // ── Step 3: Non-caution restricted entities (identical to V6 / V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    { entity_name: 'CompanionMemory', access_level: 'restricted', source_order: 10, read_only: true },
    { entity_name: 'MoodEntry',       access_level: 'restricted', source_order: 11, calibration_only: true },
    // ── Hybrid: Caution-layer entities (identical to V6 / V5 / V4 / V3 / V2 / V1 / Hybrid) ──
    {
      entity_name: 'CaseFormulation',
      access_level: 'restricted',
      source_order: 12,
      read_only: true,
      unrestricted: false,
      secondary_only: true,
      caution_layer: true,
    },
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 13,
      secondary_only: true,
      caution_layer: true,
    },
    // ── Phase 5: External trusted knowledge (identical to V6 / V5 / V4 / V3; lowest entity priority) ──
    {
      entity_name: 'ExternalKnowledgeChunk',
      access_level: 'restricted',
      source_order: 14,
      read_only: true,
      external_trusted: true,
      caution_layer: false,
    },
    // NOTE: Live retrieval (Phase 6) is NOT an entity access — it goes through
    // the technical allowlist wrapper (liveRetrievalWrapper.js) and the
    // fetchLiveResource backend function.  No new entity is added here.
    // NOTE: Safety mode (Phase 7) is NOT an entity access — it constrains
    // behavior at the context/instruction layer.  No new entity is added here.
    // NOTE: Formulation context (Phase 1 Quality) is NOT a new entity access
    // — CaseFormulation is already present at source_order 12 (read_only:
    // true, caution_layer: true).  The formulation_context_enabled flag only
    // enables additional injection of CaseFormulation fields into the session-
    // start context payload via workflowContextInjector.js.
    // NOTE: Continuity layer (Phase 3) is NOT a new entity access — it reads
    // from CompanionMemory (source_order 10, read_only: true) which is already
    // present.  The continuity_layer_enabled flag enables cross-session memory
    // injection via crossSessionContinuity.js and workflowContextInjector.js.
  ],
};

// ─── Phase 3 — AI Companion Upgrade V2 (Continuity layer) ────────────────────

/**
 * Stage 3 upgrade V2 wiring for the AI Companion agent.
 *
 * Phase 3 Deep Personalization — Companion Continuity Layer.
 *
 * This config extends AI_COMPANION_WIRING_UPGRADE_V1 with a continuity flag
 * that signals the companion session-context layer should surface prior
 * session summaries for individually tailored responses.
 *
 * New flags:
 *   continuity_enabled — signals the companion should use session continuity
 *                        cues; SessionSummary restricted access (already present
 *                        at source_order 8) is leveraged to provide warm,
 *                        personalized continuity greetings and follow-up.
 *
 * Entity tool_configs: IDENTICAL to V1.  No new entity access is added.
 * Continuity is surfaced through the existing SessionSummary restricted
 * tool_config (source_order 8, continuity_check_only: true) already in V1.
 *
 * ACTIVATION
 * ----------
 * This config is NOT the active config.  It becomes reachable only when
 * resolveCompanionWiring() returns it, which requires BOTH flags to be true:
 *   - COMPANION_UPGRADE_ENABLED (master gate)
 *   - COMPANION_UPGRADE_CONTINUITY_ENABLED (Phase 3 gate)
 * Both default to false.  ACTIVE_AI_COMPANION_WIRING remains
 * AI_COMPANION_WIRING_HYBRID until the flags are explicitly enabled.
 *
 * ROLLBACK
 * --------
 * Set COMPANION_UPGRADE_CONTINUITY_ENABLED to false to revert to V1
 * with no other code changes.  Set COMPANION_UPGRADE_ENABLED to false to
 * revert to AI_COMPANION_WIRING_HYBRID entirely.
 *
 * Source of truth: Problem statement — Phase 3 Deep Personalization, Continuity,
 * Formulation Quality.
 */
export const AI_COMPANION_WIRING_UPGRADE_V2 = {
  name: 'ai_companion',
  companion_upgrade: true,
  companion_upgrade_phase: 3,
  warmth_enabled: true,             // from V1 — Phase 2 warmer, more attuned responses
  continuity_enabled: true,         // Phase 3 — continuity-aware personalised responses
  tool_configs: [
    // ── Step 1: Preferred entities (identical to V1 / Hybrid) ──
    {
      entity_name: 'CompanionMemory',
      access_level: 'preferred',
      source_order: 1,
      use_for_clinical_reasoning: false,
    },
    { entity_name: 'MoodEntry',       access_level: 'preferred',   source_order: 2 },
    // ── Step 2: Allowed shared content pool (identical to V1 / Hybrid) ──
    { entity_name: 'Exercise',        access_level: 'allowed',     source_order: 3 },
    { entity_name: 'Resource',        access_level: 'allowed',     source_order: 4 },
    { entity_name: 'AudioContent',    access_level: 'allowed',     source_order: 5 },
    { entity_name: 'Journey',         access_level: 'allowed',     source_order: 6 },
    // ── Step 3: Non-caution restricted entities (identical to V1 / Hybrid) ──
    { entity_name: 'Goal',            access_level: 'restricted',  source_order: 7, reference_only: true },
    { entity_name: 'SessionSummary',  access_level: 'restricted',  source_order: 8, continuity_check_only: true },
    // ── Hybrid: Caution-layer entity (identical to V1 / Hybrid) ──
    {
      entity_name: 'Conversation',
      access_level: 'restricted',
      source_order: 9,
      secondary_only: true,
      caution_layer: true,
    },
    // NOTE: CaseFormulation remains PROHIBITED for AI Companion at all upgrade
    // phases (enforcement spec §E).  No new prohibited entities are added here.
  ],
};
