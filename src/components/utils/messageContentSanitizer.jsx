/**
 * Client-side message content sanitizer
 * 
 * PURPOSE: Strip internal reasoning tokens from assistant messages before rendering
 * CONTEXT: Acts as "airbag" filter even when agent prompt fails
 * 
 * CRITICAL: This is the LAST line of defense before user sees content
 */

const FORBIDDEN_PATTERNS = [
  // Explicit reasoning markers
  /^\s*THOUGHT\s*:\s*/mi,
  /^\s*THINKING\s*:\s*/mi,
  /^\s*ANALYSIS\s*:\s*/mi,
  /^\s*REASONING\s*:\s*/mi,
  /^\s*INTERNAL\s*:\s*/mi,
  /^\s*SYSTEM\s*:\s*/mi,
  /^\s*DEVELOPER\s*:\s*/mi,
  /^\s*PLAN\s*:\s*/mi,
  /^\s*DEBUG\s*:\s*/mi,
  /^\s*TRACE\s*:\s*/mi,
  
  // Planning/meta lines
  /^\s*Step\s+\d+\s*:\s*/mi,
  /^\s*Phase\s+\d+/mi,
  /^Constraint\s+checklist/mi,
  /^Mental\s+sandbox/mi,
  /^Confidence\s+score/mi,
  
  // Code blocks with reasoning
  /^```(thought|reasoning|analysis|debug)/mi,
  
  // Meta planning phrases
  /^(First\s+I'll|Then\s+I'll|I\s+should|I\s+need\s+to|My\s+goal\s+is)/mi,
  /^\[checking/mi,
  /^\[internal/mi,
  /^\[validation/mi,
  /^\[constraint/mi,
  /^\[protocol/mi
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

  // Quick check - if no forbidden patterns exist, return as-is (performance optimization)
  const hasAnyForbiddenPattern = FORBIDDEN_PATTERNS.some(pattern => pattern.test(text));
  if (!hasAnyForbiddenPattern) {
    return text;
  }

  // Split into lines for precise filtering
  const lines = text.split('\n');
  
  // Filter out lines containing forbidden patterns
  const cleanedLines = lines.filter(line => {
    // Skip empty lines
    if (!line.trim()) return true;
    
    // Check if line matches any forbidden pattern
    const isForbidden = FORBIDDEN_PATTERNS.some(pattern => pattern.test(line));
    
    if (isForbidden) {
      console.warn('[Sanitizer] ⚠️ REMOVED reasoning line:', line.substring(0, 50));
    }
    
    return !isForbidden;
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