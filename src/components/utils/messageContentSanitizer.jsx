/**
 * Client-side message content sanitizer
 * 
 * PURPOSE: Strip internal reasoning tokens from assistant messages before rendering
 * CONTEXT: Acts as "airbag" filter even when agent prompt fails
 * 
 * CRITICAL: This is the LAST line of defense before user sees content
 */

/**
 * Extract content inside <think>...</think> blocks (without consuming it from the text)
 * @param {string} text - Raw message content
 * @returns {string|null} - The combined thinking content, or null if no blocks found
 */
export function extractThinkingContent(text) {
  if (!text || typeof text !== 'string') return null;
  const matches = [];
  const re = /<think>([\s\S]*?)<\/think>/gi;
  let match;
  while ((match = re.exec(text)) !== null) {
    const trimmed = match[1].trim();
    if (trimmed) matches.push(trimmed);
  }
  return matches.length > 0 ? matches.join('\n\n') : null;
}

const FORBIDDEN_PATTERNS = [
  // Explicit reasoning markers (at start of line, case-insensitive)
  /^\s*THOUGHT\b/mi,
  /^\s*THOUGHT\s*:/mi,
  /^\s*THINKING\b/mi,
  /^\s*THINKING\s*:/mi,
  /^\s*ANALYSIS\s*:/mi,
  /^\s*REASONING\s*:/mi,
  /^\s*INTERNAL\s*:/mi,
  /^\s*SYSTEM\s*:/mi,
  /^\s*DEVELOPER\s*:/mi,
  /^\s*PLAN\s*:/mi,
  /^\s*DEBUG\s*:/mi,
  /^\s*TRACE\s*:/mi,
  /^\s*NOTE\s*:/mi,
  /^\s*CONTEXT\s*:/mi,
  /^\s*OBSERVATION\s*:/mi,
  /^\s*LOCKED_DOMAIN/mi,
  /^\s*RULE ZERO/mi,
  /^\s*CP\d+\b/mi,

  // Planning/meta lines
  /^\s*Step\s+\d+\s*:/mi,
  /^\s*Phase\s+\d+/mi,
  /^Constraint\s+checklist/mi,
  /^Mental\s+sandbox/mi,
  /^Confidence\s+score/mi,

  // Code blocks with reasoning
  /^```(thought|reasoning|analysis|debug)/mi,

  // Meta planning phrases (start of line)
  /^(First\s+I'll|Then\s+I'll|I\s+should\b|I\s+need\s+to\b|My\s+goal\s+is\b)/mi,
  /^\[checking/mi,
  /^\[internal/mi,
  /^\[validation/mi,
  /^\[constraint/mi,
  /^\[protocol/mi,
  /^\[thinking/mi,
  /^\[reasoning/mi,
  /^\[thought/mi,
  /^\[THOUGHT/mi
];

// Patterns that must not appear ANYWHERE on a line (tool names, param labels, schema)
const FORBIDDEN_INLINE_PATTERNS = [
  // Tool names
  /retrieveCurriculumUnit/i,
  /retrieveTherapistMemory/i,
  /writeTherapistMemory/i,
  /retrieveTrustedCBTContent/i,
  /retrieveRelevantContent/i,

  // Curriculum / routing field names
  /\bclinical_topic\b/i,
  /\bunit_type\b/i,
  /\blinked_hierarchy_level\b/i,
  /\blinked_outcome_patterns\b/i,
  /\bpriority_score\b/i,
  /\bwhen_to_use\b/i,
  /\bagent_usage_rules\b/i,
  /\bdirective_rewrite_pattern\b/i,
  /\bsource_chunk_ids\b/i,

  // Internal label tokens
  /\bblocker_resolution\b/i,
  /\bmicro_step_ladder\b/i,
  /\boutcome_interpretation\b/i,
  /\bphrasing_pattern\b/i,
  /\bmultilingual_response_pattern\b/i,
  /\bformulation_to_action\b/i,
  /\bgraded_exposure\b(?!\s+(exercise|technique|approach|practice|step|work))/i,
  /\banxiety_cycle_mapping\b/i,
  /\bgrounding_calming\b/i,
  /\bbalanced_thought_work\b/i,
  /\bbehavioral_activation\b/i,
  /\bcoping_plan\b/i,
  /\bproblem_solving\b/i,
  /\bself_observation\b/i,
  /\bsleep_intervention\b/i,

  // Outcome pattern labels
  /\bcompleted_step_with_distress\b/i,
  /\bcompleted_step_with_learning\b/i,
  /\bpartial_completion\b/i,
  /\bavoidance_or_noncompletion\b/i,
  /\bstep_too_hard\b/i,
  /\bstep_too_easy\b/i,
  /\bemotional_flooding\b/i,
  /\bno_clear_change\b/i,
  /\bincreased_confidence\b/i,
  /\bnew_specific_fear_discovered\b/i,
  /\breturn_after_two_steps\b/i,

  // Hierarchy labels (standalone routing context)
  /\bLOCKED_DOMAIN\b/i,
  /\bINTERVENTION_MODE\b/i,

  // Response schema structures
  /A(?:→|->)B(?:→|->)C(?:→|->)D(?:→|->)E/,
  /A\s*→\s*B\s*→\s*C/,
  /A\s*->\s*B\s*->\s*C/,

  // Memory field names
  /\bcurrent_issue\b/i,
  /\bnext_recommended_step\b/i,
  /\bintervention_mode\b/i,
  /\blatest_completed_step\b/i,
  /\blatest_outcome_pattern\b/i,
  /\bdifficulty_level\b/i,
  /\bspecific_fear_discovered\b/i,
  /\bunresolved_blocker\b/i,
  /\bfollow_up_tasks\b/i,
  /\btherapist_memory_version\b/i
];

const HEBREW_FAILSAFE = "אני כאן איתך. מה הכי מטריד אותך כרגע?";
const ENGLISH_FAILSAFE = "I'm here with you. What's on your mind right now?";

/**
 * Sanitize text by removing lines containing reasoning tokens
 * @param {string} text - Raw message content
 * @param {string} language - User language ('he' or 'en')
 * @returns {string} - Cleaned content safe for user display
 */
export function sanitizeMessageContent(text, language = 'en') {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Strip <think>...</think> blocks (XML-style reasoning tokens used by some LLMs)
  if (/<think>/i.test(text)) {
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    console.warn('[Sanitizer] ⚠️ Stripped <think> block from assistant message');
    if (!text || text.length < 5) {
      console.error('[Sanitizer] ⚠️ All content removed after <think> stripping - using failsafe');
      return language === 'he' ? HEBREW_FAILSAFE : ENGLISH_FAILSAFE;
    }
  }

  // Quick check - if no forbidden patterns exist, return as-is (performance optimization)
  const hasAnyForbiddenPattern = FORBIDDEN_PATTERNS.some(pattern => pattern.test(text));
  if (!hasAnyForbiddenPattern) {
    return text;
  }

  // Split into lines for precise filtering
  const lines = text.split('\n');

  // Filter out lines containing forbidden patterns (line-start OR inline)
  const cleanedLines = lines.filter(line => {
    // Skip empty lines
    if (!line.trim()) return true;

    // Check line-start forbidden patterns
    if (FORBIDDEN_PATTERNS.some(pattern => pattern.test(line))) {
      console.warn('[Sanitizer] ⚠️ REMOVED reasoning line (start-pattern):', line.substring(0, 60));
      return false;
    }

    // Check inline forbidden patterns (tool names, field names, schema labels)
    if (FORBIDDEN_INLINE_PATTERNS.some(pattern => pattern.test(line))) {
      console.warn('[Sanitizer] ⚠️ REMOVED leakage line (inline-pattern):', line.substring(0, 60));
      return false;
    }

    return true;
  });

  // Join back and trim
  let cleaned = cleanedLines.join('\n').trim();

  // Failsafe: If cleaning removed everything, use language-appropriate fallback
  if (!cleaned || cleaned.length < 5) {
    console.error('[Sanitizer] ⚠️ All content removed - using failsafe');
    cleaned = language === 'he' ? HEBREW_FAILSAFE : ENGLISH_FAILSAFE;
  }

  return cleaned;
}

/**
 * Check if content contains reasoning leakage (for testing/monitoring)
 * @param {string} text - Message content to check
 * @returns {boolean} - True if reasoning tokens detected
 */
export function hasReasoningLeakage(text) {
  if (!text || typeof text !== 'string') return false;
  
  if (/<think>/i.test(text)) return true;
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Extract reasoning tokens found (for debugging/monitoring)
 * @param {string} text - Message content to analyze
 * @returns {Array<string>} - List of matched patterns
 */
export function extractReasoningTokens(text) {
  if (!text || typeof text !== 'string') return [];
  
  const found = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        found.push(line.substring(0, 80));
      }
    });
  });
  
  return found;
}