// Conservative crisis language detection
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
];

export function detectCrisisLanguage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  const normalizedMessage = message.toLowerCase().trim();
  
  // Check against patterns
  return CRISIS_PATTERNS.some(pattern => pattern.test(normalizedMessage));
}