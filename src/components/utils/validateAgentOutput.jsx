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

// CRITICAL: Forbidden reasoning patterns (NO REASONING LEAKAGE)
const FORBIDDEN_REASONING_PATTERNS = [
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
  /^\s*CHECKLIST\s*:/mi,
  /^\s*STEP\s+\d+\s*:/mi,
  /^\s*CONFIDENCE\s*:/mi,
  /^\s*NOTE\s*:/mi,
  /^\s*CONTEXT\s*:/mi,
  /^\s*OBSERVATION\s*:/mi,
  /^\s*LOCKED_DOMAIN/mi,
  /^\s*RULE ZERO/mi,
  /^\s*CP\d+\b/mi,
  /^I should\b/mi,
  /^I need to\b/mi,
  /^First I'll\b/mi,
  /^Then I'll\b/mi,
  /^My goal is\b/mi,
  /^The next step is\b/mi,
  /^\[checking/mi,
  /^\[internal/mi,
  /^\[validation/mi,
  /^\[constraint/mi,
  /^\[protocol/mi,
  /^\[thinking/mi,
  /^\[reasoning/mi,
  /^\[thought/mi,
  /^\[THOUGHT/mi,
  /\bconstraint checklist\b/i,
  /\bmental sandbox\b/i,
  /\bconfidence score\b/i
];

// Inline patterns — tool names, entity names, field names, schema labels — must not appear anywhere on a line
const FORBIDDEN_INLINE_REASONING_PATTERNS = [
  /retrieveCurriculumUnit/i,
  /retrieveTherapistMemory/i,
  /writeTherapistMemory/i,
  /retrieveTrustedCBTContent/i,
  /retrieveRelevantContent/i,

  // Entity names exposed as tool targets
  /\bThoughtJournal\b/,
  /\bMoodEntry\b/,
  /\bCompanionMemory\b/,
  /\bSessionSummary\b/,
  /\bDailyFlow\b/,
  /\bCrisisAlert\b/,
  /\bCaseFormulation\b/,
  /\bTherapyFeedback\b/,
  /\bCoachingSession\b/,
  /\bProactiveReminder\b/,

  /\bclinical_topic\b/i,
  /\bunit_type\b/i,
  /\blinked_hierarchy_level\b/i,
  /\blinked_outcome_patterns\b/i,
  /\bpriority_score\b/i,
  /\bwhen_to_use\b/i,
  /\bagent_usage_rules\b/i,
  /\bdirective_rewrite_pattern\b/i,
  /\bsource_chunk_ids\b/i,
  /\bblocker_resolution\b/i,
  /\bmicro_step_ladder\b/i,
  /\boutcome_interpretation\b/i,
  /\bphrasing_pattern\b/i,
  /\bmultilingual_response_pattern\b/i,
  /\bformulation_to_action\b/i,
  /\banxiety_cycle_mapping\b/i,
  /\bgrounding_calming\b/i,
  /\bbalanced_thought_work\b/i,
  /\bcoping_plan\b/i,
  /\bself_observation\b/i,
  /\bsleep_intervention\b/i,
  /\bcompleted_step_with_distress\b/i,
  /\bcompleted_step_with_learning\b/i,
  /\bpartial_completion\b/i,
  /\bavoidance_or_noncompletion\b/i,
  /\bstep_too_hard\b/i,
  /\bstep_too_easy\b/i,
  /\bemotional_flooding\b/i,
  /\bno_clear_change\b/i,
  /\bnew_specific_fear_discovered\b/i,
  /\breturn_after_two_steps\b/i,
  /\bLOCKED_DOMAIN\b/i,
  /\bINTERVENTION_MODE\b/i,
  /A(?:\u2192|->)B(?:\u2192|->)C(?:\u2192|->)D(?:\u2192|->)E/,
  /A\s*\u2192\s*B\s*\u2192\s*C/,
  /A\s*->\s*B\s*->\s*C/,
  /\bcurrent_issue\b/i,
  /\bnext_recommended_step\b/i,
  /\bintervention_mode\b/i,
  /\blatest_completed_step\b/i,
  /\blatest_outcome_pattern\b/i,
  /\bdifficulty_level\b/i,
  /\bspecific_fear_discovered\b/i,
  /\bunresolved_blocker\b/i,
  /\bfollow_up_tasks\b/i,
  /\btherapist_memory_version\b/i,

  // English internal-analysis phrases (leak into non-English sessions)
  /\bBased on (?:memory|stored data|prior session|the memory)\b/i,
  /\bAccording to (?:stored|memory|my records)\b/i,
  /\bMemory (?:indicates|shows|records|says)\b/i,
  /\bThe system has\b/i,
  /\bI(?:'ll| will) (?:now |classify |evaluate |check |apply |retrieve |call |use )(?:the |this )?(?:memory|curriculum|tool|unit|pattern|domain|gate|rule)/i,
  /\bLet me (?:evaluate|check|classify|apply|retrieve|call|analyze|assess) (?:the |this )?(?:memory|domain|pattern|current|topic|message|gate)/i,
  /\bNow I(?:'ll| need to| will) (?:check|evaluate|classify|apply|call|retrieve)/i,
  /\bChecking (?:the |for )?(?:gate|domain|rule|condition|memory|pattern)/i,
  /\bApplying (?:the |this )?(?:gate|rule|pattern|domain|CP\d|RULE ZERO|curriculum)/i,
  /\bDomain (?:lock|classification|check|match):/i,
  /\bLOCKED_DOMAIN\s*=/i,
  /\bGate (?:passes|fails|blocked|check)/i,
  /\bContinuity (?:gate|opener|check|suppressed)/i
];

export const ATTACHMENT_METADATA_MARKER_PREFIX = '[ATTACHMENT_METADATA]';
export const PDF_ANALYSIS_OVERFLOW_METADATA_KEY = 'pdf_analysis_overflow';
const PDF_ASSISTANT_SHORT_REPLY_CHAR_LIMIT = 420;

function normalizeAttachmentMetadata(candidate) {
  if (!candidate || typeof candidate !== 'object') return null;
  const type = candidate.type === 'image' || candidate.type === 'pdf' ? candidate.type : null;
  const url = typeof candidate.url === 'string' && candidate.url.trim() ? candidate.url.trim() : null;
  if (!type || !url) return null;
  return {
    type,
    url,
    name: typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.trim() : undefined,
    size: typeof candidate.size === 'number' && Number.isFinite(candidate.size) && candidate.size >= 0 ? candidate.size : undefined
  };
}

export function serializeAttachmentMetadataMarker(attachment) {
  const normalized = normalizeAttachmentMetadata(attachment);
  if (!normalized) return '';
  return `${ATTACHMENT_METADATA_MARKER_PREFIX}${JSON.stringify(normalized)}`;
}

export function extractAttachmentMetadataFromUserContent(content) {
  if (typeof content !== 'string') {
    return { content, attachment: null };
  }

  const markerIndex = content.lastIndexOf(ATTACHMENT_METADATA_MARKER_PREFIX);
  if (markerIndex === -1) {
    return { content, attachment: null };
  }

  const beforeMarker = content.slice(0, markerIndex).replace(/\n+$/, '');
  const rawPayload = content.slice(markerIndex + ATTACHMENT_METADATA_MARKER_PREFIX.length).trim();
  if (!rawPayload) {
    return { content: beforeMarker, attachment: null };
  }

  try {
    const parsed = JSON.parse(rawPayload);
    const normalized = normalizeAttachmentMetadata(parsed);
    return { content: beforeMarker, attachment: normalized };
  } catch (_) {
    return { content, attachment: null };
  }
}

function stripAttachmentContextBlock(content) {
  if (typeof content !== 'string') return content;
  return content.replace(/\n?\[ATTACHMENT_CONTEXT\][\s\S]*$/, '').trim();
}

function hasPdfAttachmentContext(message) {
  if (!message || message.role !== 'user') return false;
  const attachmentType = message?.metadata?.attachment?.type;
  if (attachmentType === 'pdf') return true;
  if (typeof message?.metadata?.pdf_extracted_text === 'string' && message.metadata.pdf_extracted_text.trim()) return true;
  if (typeof message?.content === 'string') {
    return message.content.includes('[ATTACHMENT_CONTEXT]') && message.content.includes('type: pdf');
  }
  return false;
}

function splitAssistantPdfMessageIfNeeded(message, assistantContent, previousMessage) {
  const normalizedContent = typeof assistantContent === 'string' ? assistantContent.trim() : '';
  const existingOverflow = typeof message?.metadata?.[PDF_ANALYSIS_OVERFLOW_METADATA_KEY] === 'string' ?
    message.metadata[PDF_ANALYSIS_OVERFLOW_METADATA_KEY].trim() :
    '';
  if (!normalizedContent) {
    return { content: normalizedContent, overflow: existingOverflow || null };
  }
  if (!hasPdfAttachmentContext(previousMessage)) {
    return { content: normalizedContent, overflow: existingOverflow || null };
  }
  if (existingOverflow) {
    return { content: normalizedContent, overflow: existingOverflow };
  }
  if (normalizedContent.length <= PDF_ASSISTANT_SHORT_REPLY_CHAR_LIMIT) {
    return { content: normalizedContent, overflow: null };
  }

  let splitAt = PDF_ASSISTANT_SHORT_REPLY_CHAR_LIMIT;
  const newlineIdx = normalizedContent.indexOf('\n', PDF_ASSISTANT_SHORT_REPLY_CHAR_LIMIT - 100);
  if (newlineIdx !== -1 && newlineIdx <= PDF_ASSISTANT_SHORT_REPLY_CHAR_LIMIT + 120) {
    splitAt = newlineIdx;
  } else {
    const sentenceEnd = normalizedContent.lastIndexOf('. ', PDF_ASSISTANT_SHORT_REPLY_CHAR_LIMIT);
    if (sentenceEnd > PDF_ASSISTANT_SHORT_REPLY_CHAR_LIMIT / 2) splitAt = sentenceEnd + 1;
  }

  const shortContent = normalizedContent.slice(0, splitAt).trim();
  const overflow = normalizedContent.slice(splitAt).trim();
  if (!overflow || overflow.length < 80) {
    return { content: normalizedContent, overflow: null };
  }

  return { content: shortContent, overflow };
}

function sanitizeAssistantMessage(message) {
  if (!message || typeof message !== 'string') return message;
  
  let sanitized = message;
  
  // CRITICAL: Strip forbidden reasoning patterns line-by-line (start-pattern + inline)
  const lines = sanitized.split('\n');
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true; // Keep empty lines

    // Line-start forbidden reasoning
    if (FORBIDDEN_REASONING_PATTERNS.some(pattern => pattern.test(line))) {
      console.warn(`[Reasoning Filter] Blocked (start): "${line.substring(0, 60)}..."`);
      return false;
    }

    // Inline forbidden: tool names, field names, schema labels
    if (FORBIDDEN_INLINE_REASONING_PATTERNS.some(pattern => pattern.test(line))) {
      console.warn(`[Reasoning Filter] Blocked (inline): "${line.substring(0, 60)}..."`);
      return false;
    }

    return true;
  });

  sanitized = cleanedLines.join('\n').trim();
  
  // Failsafe: If we removed everything, use safe fallback.
  // Use English — this function has no language context and Hebrew is not appropriate
  // as a session-agnostic fallback for non-Hebrew sessions.
  if (!sanitized || sanitized.length < 10) {
    console.error('[Reasoning Filter] Message empty after filtering, using failsafe');
    return "I'm here with you. What's on your mind right now?";
  }
  
  // Strip unsafe medical patterns
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
  REASONING_LINES_BLOCKED: 0,
  reset() {
    this.PARSE_ATTEMPTS = 0;
    this.PARSE_SUCCEEDED = 0;
    this.PARSE_SKIPPED_NOT_JSON = 0;
    this.PARSE_FAILED = 0;
    this.SANITIZE_EXTRACT_OK = 0;
    this.SANITIZE_EXTRACT_FAILED = 0;
    this.REASONING_LINES_BLOCKED = 0;
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
    
    // Plain text — sanitize before returning to block any planner/reasoning leakage
    return sanitizeAssistantMessage(rawContent);
  }
  
  // Object without assistant_message - use deterministic fallback
  if (typeof rawContent === 'object' && rawContent !== null && !rawContent.assistant_message) {
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

  return messages.map((msg, index, sourceMessages) => {
    const previousMessage = index > 0 ? sourceMessages[index - 1] : null;
    // Strip session-start injection prefix from user messages so the actual
    // user text is always visible in the chat history.
    //
    // When the upgraded workflow path prepends [START_SESSION] context to a
    // user message (e.g. "[START_SESSION]...\n\n<user text>"), the render
    // gate in isMessageRenderSafe blocks the whole message because it starts
    // with "[".  Extract just the user's own text so it renders correctly.
    //
    // Session-start blocks for upgraded wirings always end with a marker of
    // the form "=== END ... ===".  We find the last such marker and take
    // everything after the following "\n\n" as the user's actual text.
    // For the HYBRID wiring, there is no "===" marker — the entire content is
    // "[START_SESSION]" optionally followed by "\n\n<user text>".
    if (msg.role === 'user' && typeof msg.content === 'string' && msg.content.startsWith('[START_SESSION]')) {
      const content = msg.content;

      // Find the last "=== END ... ===" sentinel (V2+ upgraded wirings)
      const lastEndMarkerMatch = content.match(/=== END [^\n]+ ===/g);
      let splitPos = -1;

      if (lastEndMarkerMatch) {
        const lastMarker = lastEndMarkerMatch[lastEndMarkerMatch.length - 1];
        const lastMarkerIdx = content.lastIndexOf(lastMarker);
        // The "\n\n" between the session-start block and user text follows the marker
        const sepIdx = content.indexOf('\n\n', lastMarkerIdx + lastMarker.length);
        if (sepIdx !== -1) {
          splitPos = sepIdx;
        }
      } else {
        // HYBRID wiring: "[START_SESSION]" with no section headers — the first
        // (and only) "\n\n" is the separator before user text
        const firstSep = content.indexOf('\n\n');
        if (firstSep !== -1) {
          splitPos = firstSep;
        }
      }

      if (splitPos !== -1) {
        const userText = content.substring(splitPos + 2).trim();
        const { content: cleanedUserText, attachment } = extractAttachmentMetadataFromUserContent(userText);
        if (userText) {
          const visibleUserText = stripAttachmentContextBlock(cleanedUserText);
          const pdfMetaSession = {};
          if (msg.metadata?.pdf_extracted_text) pdfMetaSession.pdf_extracted_text = msg.metadata.pdf_extracted_text;
          if (msg.metadata?.pdf_page_count) pdfMetaSession.pdf_page_count = msg.metadata.pdf_page_count;
          return {
            ...msg,
            content: visibleUserText,
            metadata: { ...(msg.metadata || {}), ...(attachment ? { attachment } : {}), ...pdfMetaSession }
          };
        }
      }
      // Pure session-start injection with no user text — hide from chat history
      return null;
    }

    if (msg.role === 'user' && typeof msg.content === 'string') {
      const { content, attachment } = extractAttachmentMetadataFromUserContent(msg.content);
      const visibleUserText = stripAttachmentContextBlock(content);
      // Preserve pdf_extracted_text / pdf_page_count from incoming metadata so the
      // collapsible card in MessageBubble always has the data available, regardless
      // of whether the SDK round-trips custom metadata fields.
      const pdfMeta = {};
      if (msg.metadata?.pdf_extracted_text) pdfMeta.pdf_extracted_text = msg.metadata.pdf_extracted_text;
      if (msg.metadata?.pdf_page_count) pdfMeta.pdf_page_count = msg.metadata.pdf_page_count;
      if (attachment || Object.keys(pdfMeta).length > 0) {
        return {
          ...msg,
          content: visibleUserText,
          metadata: { ...(msg.metadata || {}), ...(attachment ? { attachment } : {}), ...pdfMeta }
        };
      }
    }

    if (msg.role === 'assistant' && msg.content) {
      const validated = validateAgentOutput(msg.content);
      
      if (validated) {
        const separated = splitAssistantPdfMessageIfNeeded(msg, validated.assistant_message, previousMessage);
        const nextMetadata = {
          ...(msg.metadata || {}),
          structured_data: validated,
          sanitized: true
        };
        if (separated.overflow) {
          nextMetadata[PDF_ANALYSIS_OVERFLOW_METADATA_KEY] = separated.overflow;
        }
        return {
          ...msg,
          content: separated.content,
          metadata: nextMetadata
        };
      }
      
      // Additional fallback for malformed JSON
      if (typeof msg.content === 'string' && msg.content.includes('"assistant_message"')) {
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed.assistant_message) {
            const separated = splitAssistantPdfMessageIfNeeded(msg, parsed.assistant_message, previousMessage);
            const nextMetadata = {
              ...(msg.metadata || {}),
              structured_data: parsed,
              sanitized: true
            };
            if (separated.overflow) {
              nextMetadata[PDF_ANALYSIS_OVERFLOW_METADATA_KEY] = separated.overflow;
            }
            return {
              ...msg,
              content: separated.content,
              metadata: nextMetadata
            };
          }
        } catch (e) {
          console.warn('[Sanitize] Failed to extract from JSON-like content:', msg.content?.substring(0, 100));
        }
      }

      // Plain-text assistant message — sanitize before returning to prevent
      // planner/composer/reasoning text from leaking into visible state
      if (typeof msg.content === 'string') {
        const cleaned = sanitizeAssistantMessage(msg.content);
        const separated = splitAssistantPdfMessageIfNeeded(msg, cleaned, previousMessage);
        const nextMetadata = { ...(msg.metadata || {}) };
        if (separated.overflow) {
          nextMetadata[PDF_ANALYSIS_OVERFLOW_METADATA_KEY] = separated.overflow;
        }
        return { ...msg, content: separated.content, metadata: nextMetadata };
      }
    }
    return msg;
  }).filter(msg => msg !== null);
}
