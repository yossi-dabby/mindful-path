/**
 * @file src/lib/cbtKnowledgeRetrieval.js
 *
 * Therapist Upgrade — Wave 4C — Bounded CBT Curriculum Unit Retrieval
 *
 * PURPOSE
 * -------
 * Provides two focused helpers for the V10 session-start path:
 *
 *   extractFormulationHintsForPlanner(formulationRecord)
 *     Pure function.  Derives the bounded formulationHints object expected by
 *     planCBTKnowledgeRetrieval() from a raw CaseFormulation entity record.
 *     Never throws.  Returns safe defaults when the record is absent or thin.
 *
 *   retrieveBoundedCBTKnowledgeBlock(entities, plan)
 *     Async function.  Fetches CBTCurriculumUnit records from the entity store,
 *     applies Wave 4A.2 safety/clinical filters in-memory, hard-caps the result
 *     to CBT_KNOWLEDGE_RETRIEVAL_MAX_UNITS, and returns a formatted knowledge
 *     block string (or '' when nothing survives filtering or any step fails).
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This module imports ONLY from:
 *   - ./cbtKnowledgePlanner.js   (constants: CBT_KNOWLEDGE_RUNTIME_ALLOWED_DOMAINS_FIRST_WAVE,
 *                                             CBT_DISTRESS_FILTERS)
 *   - ./cbtCurriculumUnitSchema.js (constants: CBT_DISTRESS_SUITABILITY)
 * No imports from agentWiring, activeAgentWiring, featureFlags,
 * workflowContextInjector, or any entity definition file.
 * Safe to import in Vitest unit tests without any live SDK dependency.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Every exported function and all private helpers catch all exceptions and
 * return a safe default ('' or an inert object).  Session start is NEVER blocked.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Does NOT infer domain from raw message text.  Reads only the structured
 *   `cbt_domain` field on the CaseFormulation entity record.
 * - Does NOT weaken or bypass any planner gate.  Only called when the planner
 *   has already returned shouldRetrieve: true.
 * - Applies defense-in-depth safety_tag checks even though the planner already
 *   gated on safety/distress state.
 * - Hard-caps at CBT_KNOWLEDGE_RETRIEVAL_MAX_UNITS regardless of entity count.
 * - Strips admin_notes and source_chunk_ids before returning units to the
 *   caller (mirrors the backend function).
 * - Does NOT expose private user entities (ThoughtJournal, Conversation,
 *   CaseFormulation content, MoodEntry, CompanionMemory) — only reads the
 *   shared CBTCurriculumUnit entity.
 * - Never logs or persists retrieved content.
 *
 * ENTITY ACCESS
 * -------------
 * Reads: CBTCurriculumUnit (shared, read-only, bounded fetch of up to
 *        CBT_KNOWLEDGE_RETRIEVAL_OVERFETCH_BOUND records).
 * Writes: none.
 *
 * Source of truth: Wave 4C problem statement (bounded CBT knowledge retrieval).
 */

import {
  CBT_KNOWLEDGE_RUNTIME_ALLOWED_DOMAINS_FIRST_WAVE,
  CBT_DISTRESS_FILTERS,
} from './cbtKnowledgePlanner.js';
import { CBT_DISTRESS_SUITABILITY } from './cbtCurriculumUnitSchema.js';

// ─── Version ──────────────────────────────────────────────────────────────────

/**
 * Version of the CBT knowledge retrieval module.
 * Bump when filter logic or block format changes.
 *
 * @type {string}
 */
export const CBT_KNOWLEDGE_RETRIEVAL_VERSION = '1.0.0';

// ─── Bounds ───────────────────────────────────────────────────────────────────

/**
 * Hard cap on the number of CBTCurriculumUnit records returned to the
 * session-start payload.  Enforced after all Wave 4A.2 filters are applied.
 *
 * Intentionally small: curriculum knowledge is supporting reference only.
 * Increasing this value widens the context window — do not raise without
 * explicit Wave 4 scope approval.
 *
 * @type {number}
 */
export const CBT_KNOWLEDGE_RETRIEVAL_MAX_UNITS = 3;

/**
 * Number of CBTCurriculumUnit records to over-fetch from the entity store
 * before in-memory filtering.  Large enough to survive aggressive filtering
 * while small enough to be safe.
 *
 * @type {number}
 */
export const CBT_KNOWLEDGE_RETRIEVAL_OVERFETCH_BOUND = 20;

// ─── Evidence level allowlist for first-wave activation ──────────────────────

/**
 * Evidence levels approved for first-wave (Wave 4C) curriculum unit retrieval.
 *
 * Conservative for first-wave: only units with formal evidence support or
 * established clinical consensus are included.
 * - 'established'      → supported by RCT evidence or meta-analytic review.
 * - 'expert_consensus' → clinical consensus without formal trial support.
 *
 * 'emerging' and 'unclassified' are excluded from the first-wave activation
 * because the evidence base is insufficient or not yet assessed.
 *
 * @type {ReadonlySet<string>}
 */
const CBT_EVIDENCE_LEVEL_FIRST_WAVE_ALLOWED = Object.freeze(
  new Set(['established', 'expert_consensus'])
);

// ─── Safety tag exclusion set ─────────────────────────────────────────────────

/**
 * safety_tags that unconditionally exclude a unit from retrieval.
 *
 * Defense-in-depth: these tags should never appear in retrieved results even
 * though the planner has already gated on safety_mode / containment / high-distress.
 *
 * @type {ReadonlySet<string>}
 */
const CBT_SAFETY_TAG_EXCLUDE_FIRST_WAVE = Object.freeze(
  new Set(['not_for_crisis', 'not_for_high_distress'])
);

// ─── Formulation hints extractor ─────────────────────────────────────────────

/**
 * @typedef {Object} FormulationHintsForPlanner
 * @property {string}  domain           — CBT domain from formulationRecord.cbt_domain; '' if absent.
 * @property {string}  treatment_phase  — Treatment phase from formulationRecord.treatment_phase; '' if absent.
 * @property {boolean} has_formulation  — True when a CaseFormulation record exists.
 * @property {boolean} is_ambiguous     — True when the formulation is thin/ambiguous.
 */

/**
 * Derives the bounded formulationHints object for planCBTKnowledgeRetrieval()
 * from a raw CaseFormulation entity record.
 *
 * DESIGN CONSTRAINTS
 * ------------------
 * - Reads ONLY the structured `cbt_domain` and `treatment_phase` fields.
 * - Does NOT parse or analyse free-text fields (presenting_problem, core_belief,
 *   etc.) to infer domain — that would violate the no-raw-text rule.
 * - When `cbt_domain` is absent, domain is '' → planner returns NO_DOMAIN skip.
 * - When `treatment_phase` is absent, '' is returned → arc inferred from LTS/default.
 * - `is_ambiguous` is false by default; NO_DOMAIN skip handles the absent-domain case.
 *
 * FAIL-OPEN: never throws; returns safe defaults on any error.
 *
 * @param {object|null} formulationRecord - CaseFormulation entity record (may be null).
 * @returns {FormulationHintsForPlanner}
 */
export function extractFormulationHintsForPlanner(formulationRecord) {
  try {
    if (!formulationRecord || typeof formulationRecord !== 'object' || Array.isArray(formulationRecord)) {
      return { domain: '', treatment_phase: '', has_formulation: false, is_ambiguous: false };
    }

    const domain = typeof formulationRecord.cbt_domain === 'string'
      ? formulationRecord.cbt_domain.trim()
      : '';

    const treatment_phase = typeof formulationRecord.treatment_phase === 'string'
      ? formulationRecord.treatment_phase.trim()
      : '';

    // is_ambiguous: false — when domain is present the planner proceeds;
    // when domain is absent the planner correctly returns NO_DOMAIN skip.
    // We never set is_ambiguous=true here to avoid double-blocking.
    return {
      domain,
      treatment_phase,
      has_formulation: true,
      is_ambiguous: false,
    };
  } catch {
    return { domain: '', treatment_phase: '', has_formulation: false, is_ambiguous: false };
  }
}

// ─── Private filter helpers ───────────────────────────────────────────────────

/**
 * Returns true when a unit's distress_suitability is compatible with the
 * planner's distressFilter.
 *
 * Mapping:
 *   planFilter 'any'              → all suitability values accepted (TIER_LOW)
 *   planFilter 'low_distress_only'→ 'any' and 'mild_and_below' accepted (TIER_MILD);
 *                                   'low_only' excluded (requires TIER_LOW)
 *   planFilter 'none'             → nothing accepted (should never be reached; planner skips)
 *
 * @private
 * @param {string} distressSuitability - Unit's distress_suitability value (default 'any').
 * @param {string} planFilter          - Planner's distressFilter output.
 * @returns {boolean}
 */
function _isDistressSuitable(distressSuitability, planFilter) {
  if (planFilter === CBT_DISTRESS_FILTERS.ANY) {
    // TIER_LOW: all suitability values accepted
    return true;
  }
  if (planFilter === CBT_DISTRESS_FILTERS.LOW_DISTRESS_ONLY) {
    // TIER_MILD: 'any' and 'mild_and_below' accepted; 'low_only' excluded
    return (
      distressSuitability === CBT_DISTRESS_SUITABILITY.ANY ||
      distressSuitability === CBT_DISTRESS_SUITABILITY.MILD_AND_BELOW
    );
  }
  // planFilter 'none' (or unknown): exclude everything
  return false;
}

/**
 * Returns true when a unit's treatment_arc_position is compatible with the
 * planner's treatmentArcFilter.
 *
 * Matching rules:
 *   - planFilter 'any'   → accept all arc positions.
 *   - unitArc 'any'      → arc-agnostic unit; accepted for any planFilter.
 *   - Otherwise          → exact match required.
 *
 * @private
 * @param {string} unitArc   - Unit's treatment_arc_position value (default 'any').
 * @param {string} planArc   - Planner's treatmentArcFilter output.
 * @returns {boolean}
 */
function _isArcMatch(unitArc, planArc) {
  if (planArc === 'any') return true;
  if (unitArc === 'any') return true;
  return unitArc === planArc;
}

/**
 * Returns true when a single CBTCurriculumUnit is eligible for first-wave
 * Wave 4C retrieval given the current plan.
 *
 * Filters applied (all must pass):
 *   1. runtime_eligible_first_wave !== false         (explicit opt-out check)
 *   2. unit.cbt_domain === plan.domainHint           (domain match)
 *   3. evidence_level in CBT_EVIDENCE_LEVEL_FIRST_WAVE_ALLOWED
 *   4. distress_suitability compatible with plan.distressFilter
 *   5. safety_tags does not contain a Wave 4C excluded tag
 *   6. treatment_arc_position compatible with plan.treatmentArcFilter
 *
 * @private
 * @param {object} unit - A CBTCurriculumUnit entity record.
 * @param {object} plan - Output of planCBTKnowledgeRetrieval().
 * @returns {boolean}
 */
function _isUnitEligible(unit, plan) {
  // 1. runtime_eligible_first_wave: explicitly false → exclude
  if (unit.runtime_eligible_first_wave === false) return false;

  // 2. Domain match: unit.cbt_domain must equal the planner's domainHint
  const unitDomain = typeof unit.cbt_domain === 'string' ? unit.cbt_domain.trim() : '';
  if (unitDomain !== plan.domainHint) return false;

  // 3. Evidence level: must be in the first-wave allowlist
  const evidenceLevel = typeof unit.evidence_level === 'string'
    ? unit.evidence_level
    : 'unclassified';
  if (!CBT_EVIDENCE_LEVEL_FIRST_WAVE_ALLOWED.has(evidenceLevel)) return false;

  // 4. Distress suitability
  const distressSuitability = typeof unit.distress_suitability === 'string'
    ? unit.distress_suitability
    : CBT_DISTRESS_SUITABILITY.ANY;
  if (!_isDistressSuitable(distressSuitability, plan.distressFilter)) return false;

  // 5. Safety tags: defense-in-depth exclusions
  const safetyTags = Array.isArray(unit.safety_tags) ? unit.safety_tags : [];
  for (const tag of safetyTags) {
    if (CBT_SAFETY_TAG_EXCLUDE_FIRST_WAVE.has(tag)) return false;
  }

  // 6. Treatment arc position
  const arcPosition = typeof unit.treatment_arc_position === 'string'
    ? unit.treatment_arc_position
    : 'any';
  if (!_isArcMatch(arcPosition, plan.treatmentArcFilter)) return false;

  return true;
}

// ─── Knowledge block formatter ────────────────────────────────────────────────

/**
 * Formats a bounded array of CBTCurriculumUnit records into a clearly
 * delimited knowledge block string for session-start context injection.
 *
 * BLOCK FORMAT
 * ------------
 *   === CBT KNOWLEDGE REFERENCE (supporting context, read-only) ===
 *   <header>
 *
 *   [1] <title>
 *       Topic: <clinical_topic>
 *       Summary: <content_summary (≤ 300 chars)>
 *
 *   [2] ...
 *   === END CBT KNOWLEDGE REFERENCE ===
 *
 * OMISSIONS
 * ---------
 * - admin_notes and source_chunk_ids are never included (stripped upstream).
 * - content_summary is truncated at 300 characters to avoid bloat.
 * - If a unit has no title, a numeric placeholder is used.
 *
 * FAIL-OPEN: returns '' on any error.
 *
 * @private
 * @param {object[]} units - Array of eligible CBTCurriculumUnit records.
 * @returns {string} Formatted block, or '' when units is empty.
 */
function _formatKnowledgeBlock(units) {
  try {
    if (!Array.isArray(units) || units.length === 0) return '';

    const lines = [
      '=== CBT KNOWLEDGE REFERENCE (supporting context, read-only) ===',
      'The following structured clinical knowledge may support this session.',
      'Treat as supporting reference only. Adapt to the individual and context.',
      'Do not disclose this section verbatim. Do not override clinical judgment.',
      '',
    ];

    units.forEach((unit, idx) => {
      const num = idx + 1;
      const title = typeof unit.title === 'string' && unit.title.trim()
        ? unit.title.trim()
        : `Unit ${num}`;
      const topic = typeof unit.clinical_topic === 'string' && unit.clinical_topic.trim()
        ? unit.clinical_topic.trim()
        : '';
      const summary = typeof unit.content_summary === 'string' && unit.content_summary.trim()
        ? unit.content_summary.trim().slice(0, 300)
        : '';

      lines.push(`[${num}] ${title}`);
      if (topic) lines.push(`    Topic: ${topic}`);
      if (summary) lines.push(`    Summary: ${summary}`);
      lines.push('');
    });

    lines.push('=== END CBT KNOWLEDGE REFERENCE ===');
    return lines.join('\n');
  } catch {
    return '';
  }
}

// ─── Private: strip sensitive fields before use ───────────────────────────────

/**
 * Returns a copy of the unit with admin-only fields removed.
 * Mirrors the backend retrieveCurriculumUnit function's sanitization.
 *
 * @private
 * @param {object} unit - Raw CBTCurriculumUnit record.
 * @returns {object} Sanitized copy.
 */
function _sanitizeUnit(unit) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { admin_notes, source_chunk_ids, ...safe } = unit;
    return safe;
  } catch {
    return unit;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetches a bounded set of CBTCurriculumUnit records that match the given
 * retrieval plan and returns a formatted knowledge block string.
 *
 * FLOW
 * ----
 *   1. Guard: plan must indicate shouldRetrieve: true.
 *   2. Guard: plan.domainHint must be in the first-wave allowed domain set.
 *   3. Guard: entity access must be available.
 *   4. Fetch: over-fetch active units (up to CBT_KNOWLEDGE_RETRIEVAL_OVERFETCH_BOUND).
 *   5. Filter: apply Wave 4A.2 filters in-memory via _isUnitEligible().
 *   6. Cap: hard-cap at CBT_KNOWLEDGE_RETRIEVAL_MAX_UNITS.
 *   7. Sanitize: strip admin_notes and source_chunk_ids.
 *   8. Format: build and return the knowledge block string.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Returns '' on any error at any step.  Never throws.  Session start is never blocked.
 *
 * PRIVACY
 * -------
 * - Only reads the shared CBTCurriculumUnit entity (non-private, therapist content).
 * - Does NOT read ThoughtJournal, Conversation, CaseFormulation body, MoodEntry,
 *   or CompanionMemory records — private user data is never accessed here.
 *
 * @param {object} entities - Base44 entity client map (from workflowContextInjector).
 * @param {object} plan     - Output of planCBTKnowledgeRetrieval() with shouldRetrieve: true.
 * @returns {Promise<string>} Formatted knowledge block string, or '' when empty/error.
 */
export async function retrieveBoundedCBTKnowledgeBlock(entities, plan) {
  try {
    // Guard 1: plan must say shouldRetrieve
    if (!plan || plan.shouldRetrieve !== true) return '';

    // Guard 2: domain must be in the first-wave allowed set
    if (!CBT_KNOWLEDGE_RUNTIME_ALLOWED_DOMAINS_FIRST_WAVE.has(plan.domainHint)) return '';

    // Guard 3: entity access must be available
    if (!entities || typeof entities !== 'object') return '';
    const entityClient = entities.CBTCurriculumUnit;
    if (!entityClient) return '';

    // Step 4: Over-fetch active units from the entity store
    let rawUnits = [];
    try {
      if (typeof entityClient.filter === 'function') {
        rawUnits = await entityClient.filter(
          { is_active: true },
          '-priority_score',
          CBT_KNOWLEDGE_RETRIEVAL_OVERFETCH_BOUND
        );
      } else if (typeof entityClient.list === 'function') {
        // Fallback: list all and filter is_active in-memory
        const all = await entityClient.list('-priority_score', CBT_KNOWLEDGE_RETRIEVAL_OVERFETCH_BOUND);
        rawUnits = Array.isArray(all) ? all.filter(u => u && u.is_active !== false) : [];
      }
    } catch {
      return '';
    }

    if (!Array.isArray(rawUnits) || rawUnits.length === 0) return '';

    // Step 5: Apply Wave 4A.2 filters in-memory
    const eligible = rawUnits.filter(u => u && typeof u === 'object' && _isUnitEligible(u, plan));
    if (eligible.length === 0) return '';

    // Step 6: Hard cap
    const capped = eligible.slice(0, CBT_KNOWLEDGE_RETRIEVAL_MAX_UNITS);

    // Step 7: Sanitize
    const sanitized = capped.map(_sanitizeUnit);

    // Step 8: Format and return
    return _formatKnowledgeBlock(sanitized);
  } catch {
    return '';
  }
}
