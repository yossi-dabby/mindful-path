/**
 * Non-breaking validator for CBT agent structured output.
 * Returns validated/normalized JSON or null if invalid (falls back gracefully).
 * 
 * SAFETY RULES:
 * - Strips any medical/diagnostic language from assistant_message
 * - Blocks responses with harmful advice patterns
 * - Ensures no raw JSON or metadata leaks
 */

// Safety patterns to detect and strip
const UNSAFE_PATTERNS = [
  /\b(you (have|might have) (depression|anxiety|PTSD|bipolar|schizophrenia))\b/gi,
  /\b(I (can )?(diagnose|prescribe))\b/gi,
  /\b(take (this|these) (medication|drug)s?)\b/gi
];

function sanitizeAssistantMessage(message) {
  if (!message || typeof message !== 'string') return message;
  
  let sanitized = message;
  
  // Strip unsafe patterns
  for (const pattern of UNSAFE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[content removed for safety]');
  }
  
  // Ensure no JSON-like structures leak
  if (sanitized.includes('"situation":') || sanitized.includes('"homework":')) {
    console.error('[Safety] JSON structure detected in assistant_message');
    return 'Unable to display this message safely.';
  }
  
  return sanitized;
}

// Global counters for parse tracking (resetable for testing)
export const parseCounters = {
  PARSE_ATTEMPTS: 0,
  PARSE_SUCCEEDED: 0,
  PARSE_SKIPPED_NOT_JSON: 0,
  PARSE_FAILED: 0,
  SANITIZE_EXTRACT_OK: 0,
  SANITIZE_EXTRACT_FAILED: 0,
  reset() {
    this.PARSE_ATTEMPTS = 0;
    this.PARSE_SUCCEEDED = 0;
    this.PARSE_SKIPPED_NOT_JSON = 0;
    this.PARSE_FAILED = 0;
    this.SANITIZE_EXTRACT_OK = 0;
    this.SANITIZE_EXTRACT_FAILED = 0;
  }
};

/**
 * Strict JSON detection - returns true ONLY if content is parseable JSON
 * Prevents JSON.parse on Hebrew/English plain text
 */
function isStrictJSON(content) {
  if (!content || typeof content !== 'string') return false;
  
  const trimmed = content.trim();
  
  // Must start with { or [
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false;
  
  // Must not be inside fences
  if (content.includes('```json') || content.includes('```')) return false;
  
  // Check for non-whitespace prefix (indicates it's not pure JSON)
  const beforeBrace = content.substring(0, content.indexOf(trimmed[0]));
  if (beforeBrace.trim().length > 0) return false;
  
  // Must contain JSON-specific markers
  return trimmed.includes('"assistant_message"') || 
         trimmed.includes('"tool_calls"') || 
         trimmed.includes('"homework"');
}

/**
 * Robust extractor for assistant_message from JSON-like content
 * Handles fenced blocks and strings with prefix/suffix
 * Does NOT use JSON.parse for robustness
 */
function extractAssistantMessageRobust(content) {
  if (!content || typeof content !== 'string') {
    parseCounters.SANITIZE_EXTRACT_FAILED++;
    return null;
  }
  
  // Pattern 1: Extract from fenced JSON block
  const fencedMatch = content.match(/```json?\s*\n?\s*\{[\s\S]*?"assistant_message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (fencedMatch) {
    parseCounters.SANITIZE_EXTRACT_OK++;
    return fencedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  
  // Pattern 2: Extract from JSON-ish string with prefix/suffix
  const jsonishMatch = content.match(/"assistant_message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (jsonishMatch) {
    parseCounters.SANITIZE_EXTRACT_OK++;
    return jsonishMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  
  parseCounters.SANITIZE_EXTRACT_FAILED++;
  return null;
}

export function validateAgentOutput(rawContent) {
  if (!rawContent) {
    return null;
  }

  try {
    // Attempt to parse JSON
    let parsed;
    
    // Handle case where content is already an object
    if (typeof rawContent === 'object') {
      parseCounters.PARSE_ATTEMPTS++;
      parsed = rawContent;
    } else if (typeof rawContent === 'string') {
      // STRICT JSON DETECTION: Only parse if truly JSON-shaped
      if (!isStrictJSON(rawContent)) {
        // Not JSON - try robust extraction for fenced blocks or JSON-ish strings
        const extracted = extractAssistantMessageRobust(rawContent);
        if (extracted) {
          parseCounters.PARSE_SKIPPED_NOT_JSON++;
          // Return as plain text message (no structured data)
          return null;
        }
        // Plain text - skip entirely
        parseCounters.PARSE_SKIPPED_NOT_JSON++;
        return null;
      }
      
      // Strict JSON detected - safe to parse
      parseCounters.PARSE_ATTEMPTS++;
      parsed = JSON.parse(rawContent.trim());
    } else {
      return null;
    }

    // Validate required field: assistant_message
    if (!parsed.assistant_message || typeof parsed.assistant_message !== 'string') {
      parseCounters.PARSE_FAILED++;
      return null;
    }

    // Normalize to expected schema (fill missing fields with defaults)
    // CRITICAL: Sanitize assistant_message for safety
    const normalized = {
      assistant_message: sanitizeAssistantMessage(parsed.assistant_message.trim()),
      mode: parsed.mode || 'thought_work',
      situation: parsed.situation || null,
      automatic_thought: parsed.automatic_thought || null,
      evidence_for: Array.isArray(parsed.evidence_for) ? parsed.evidence_for.slice(0, 5) : [],
      evidence_against: Array.isArray(parsed.evidence_against) ? parsed.evidence_against.slice(0, 5) : [],
      balanced_thought: parsed.balanced_thought || null,
      emotion_ratings: {
        anxiety: parsed.emotion_ratings?.anxiety ?? null
      },
      emotion_ratings_after: {
        anxiety: parsed.emotion_ratings_after?.anxiety ?? null
      },
      homework: [],
      journal_save_candidate: {
        should_offer_save: false,
        save_title: parsed.journal_save_candidate?.save_title || null,
        save_summary_bullets: Array.isArray(parsed.journal_save_candidate?.save_summary_bullets) 
          ? parsed.journal_save_candidate.save_summary_bullets.slice(0, 3) 
          : []
      }
    };

    // Validate and normalize homework
    if (Array.isArray(parsed.homework)) {
      normalized.homework = parsed.homework.slice(0, 2).map(item => {
        if (!item || typeof item !== 'object' || !item.step) {
          return null;
        }
        return {
          step: String(item.step),
          duration_minutes: typeof item.duration_minutes === 'number' 
            ? Math.max(1, Math.min(60, Math.floor(item.duration_minutes))) 
            : 10,
          success_criteria: item.success_criteria ? String(item.success_criteria) : 'Complete the task'
        };
      }).filter(Boolean);
    }

    // Validate emotion_ratings.anxiety if present
    if (normalized.emotion_ratings.anxiety !== null) {
      const anxiety = Number(normalized.emotion_ratings.anxiety);
      if (isNaN(anxiety) || anxiety < 0 || anxiety > 10) {
        normalized.emotion_ratings.anxiety = null;
      } else {
        normalized.emotion_ratings.anxiety = Math.max(0, Math.min(10, anxiety));
      }
    }

    // Validate emotion_ratings_after.anxiety if present
    if (normalized.emotion_ratings_after.anxiety !== null) {
      const anxietyAfter = Number(normalized.emotion_ratings_after.anxiety);
      if (isNaN(anxietyAfter) || anxietyAfter < 0 || anxietyAfter > 10) {
        normalized.emotion_ratings_after.anxiety = null;
      } else {
        normalized.emotion_ratings_after.anxiety = Math.max(0, Math.min(10, anxietyAfter));
      }
    }

    // Enforce should_offer_save rules
    const hasAnxietyBaseline = normalized.emotion_ratings.anxiety !== null;
    const hasHomework = normalized.homework.length > 0;
    
    if (parsed.journal_save_candidate?.should_offer_save === true) {
      // Only allow true if both conditions met
      normalized.journal_save_candidate.should_offer_save = hasAnxietyBaseline && hasHomework;
    } else {
      normalized.journal_save_candidate.should_offer_save = false;
    }

    parseCounters.PARSE_SUCCEEDED++;
    return normalized;

  } catch (error) {
    // Single-line concise warning (no stack trace spam)
    parseCounters.PARSE_FAILED++;
    console.warn(`[Parse] Failed: ${error.message.substring(0, 50)}`);
    return null;
  }
}

/**
 * Extract user-visible message from raw agent output (backward compatible).
 * Returns clean string or original content if validation fails.
 */
export function extractAssistantMessage(rawContent) {
  const validated = validateAgentOutput(rawContent);
  
  if (validated?.assistant_message) {
    return sanitizeAssistantMessage(validated.assistant_message);
  }
  
  // Try robust extraction (handles fenced JSON, JSON-ish strings)
  if (typeof rawContent === 'string') {
    const extracted = extractAssistantMessageRobust(rawContent);
    if (extracted) {
      return sanitizeAssistantMessage(extracted);
    }
    
    // Only try JSON.parse if strict JSON detected
    if (isStrictJSON(rawContent)) {
      try {
        const parsed = JSON.parse(rawContent.trim());
        if (parsed.assistant_message) {
          return sanitizeAssistantMessage(String(parsed.assistant_message));
        }
      } catch (e) {
        // Parse failed - already counted in parseCounters
      }
    }
    
    // Plain text - return as-is
    return rawContent;
  }
  
  // Object without assistant_message - use deterministic fallback
  if (typeof rawContent === 'object' && !rawContent.assistant_message) {
    return 'I received your message. Please rephrase in one sentence what you want me to do next.';
  }
  
  return 'I received your message. Please rephrase in one sentence what you want me to do next.';
}

/**
 * Sanitize corrupted conversation history (recovery utility).
 * Processes all messages and extracts assistant_message from any JSON content.
 */
export function sanitizeConversationMessages(messages) {
  if (!Array.isArray(messages)) return [];
  
  return messages.map(msg => {
    if (msg.role === 'assistant' && msg.content) {
      const validated = validateAgentOutput(msg.content);
      
      if (validated) {
        return {
          ...msg,
          content: validated.assistant_message,
          metadata: {
            ...(msg.metadata || {}),
            structured_data: validated,
            sanitized: true
          }
        };
      }
      
      // Additional fallback for malformed JSON
      if (typeof msg.content === 'string' && msg.content.includes('"assistant_message"')) {
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed.assistant_message) {
            return {
              ...msg,
              content: parsed.assistant_message,
              metadata: {
                ...(msg.metadata || {}),
                structured_data: parsed,
                sanitized: true
              }
            };
          }
        } catch (e) {
          console.warn('[Sanitize] Failed to extract from JSON-like content:', msg.content?.substring(0, 100));
        }
      }
    }
    return msg;
  });
}