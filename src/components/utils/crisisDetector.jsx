// Conservative crisis language detection with bypass-resistant normalization
// Returns true if message contains high-risk patterns

const CRISIS_PATTERNS = [
  // Self-harm language
  /\b(kill|hurt|harm)\s+(myself|my\s*self)\b/i,
  /\bsuicide\b/i,
  /\bend\s+(my|it\s+all)\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\bcut(ting)?\s+(myself|my\s*self)\b/i,
  
  // Overdose/method language
  /\boverdose\b/i,
  /\btake\s+all\s+(my|the)\s+(pills|meds|medication)\b/i,
  
  // Immediate danger
  /\bgoodbye\s+(cruel\s+)?world\b/i,
  /\bcan'?t\s+go\s+on\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  
  // Indirect/semantic patterns
  /\bno\s+point\s+(in\s+)?(living|going\s+on|continuing)\b/i,
  /\bwant\s+to\s+disappear\b/i,
  /\beveryone\s+(would\s+be\s+)?better\s+(off\s+)?without\s+me\b/i,
  /\bcan'?t\s+(take|do)\s+(this|it)\s+anymore\b/i,
  /\bready\s+to\s+(die|end\s+it)\b/i,
];

/**
 * Aggressively normalize text to prevent bypass attempts:
 * - Remove spaces between letters (ki ll -> kill)
 * - Replace common character substitutions (1->i, 3->e, 0->o, @->a, $->s)
 * - Remove punctuation between letters (k.i.l.l -> kill)
 * - Convert to lowercase
 */
function normalizeForDetection(text) {
  if (!text || typeof text !== 'string') return '';
  
  let normalized = text.toLowerCase().trim();
  
  // Replace common character substitutions
  const substitutions = {
    '1': 'i', '3': 'e', '0': 'o', '@': 'a', '$': 's',
    '!': 'i', '7': 't', '5': 's', '8': 'b', '4': 'a'
  };
  
  for (const [char, replacement] of Object.entries(substitutions)) {
    normalized = normalized.replace(new RegExp(char, 'g'), replacement);
  }
  
  // Remove punctuation and excessive spacing between letters
  // This helps catch "k.i.l.l" or "ki  ll" patterns
  normalized = normalized.replace(/([a-z])[.\s_-]+([a-z])/g, '$1$2');
  
  // Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  return normalized;
}

/**
 * Categorize detected crisis language into reason codes
 */
function categorizeReason(message) {
  const normalized = normalizeForDetection(message);
  const original = message.toLowerCase().trim();
  
  const testMessage = (text) => {
    if (/\b(kill|hurt|harm|cut)\s+(myself|my\s*self)\b/i.test(text)) return 'self_harm';
    if (/\bsuicide\b/i.test(text)) return 'suicide';
    if (/\boverdose\b/i.test(text)) return 'overdose';
    if (/\b(take\s+all\s+(my|the)\s+(pills|meds)|goodbye\s+world|ready\s+to\s+(die|end\s+it))\b/i.test(text)) return 'immediate_danger';
    return 'general_crisis';
  };
  
  return testMessage(original) || testMessage(normalized) || 'general_crisis';
}

export function detectCrisisLanguage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  // Check both original and aggressively normalized versions
  const original = message.toLowerCase().trim();
  const normalized = normalizeForDetection(message);
  
  // Check against patterns on both versions for robustness
  return CRISIS_PATTERNS.some(pattern => 
    pattern.test(original) || pattern.test(normalized)
  );
}

/**
 * Detect crisis language and return reason code if detected
 * Returns null if no crisis detected, otherwise returns reason code
 */
export function detectCrisisWithReason(message) {
  if (detectCrisisLanguage(message)) {
    return categorizeReason(message);
  }
  return null;
}