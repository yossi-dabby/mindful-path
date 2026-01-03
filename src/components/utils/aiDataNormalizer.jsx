/**
 * AI Data Normalizer
 * 
 * Defensive utility to safely normalize AI-generated data structures.
 * Ensures all expected array fields are actual arrays, preventing runtime errors.
 */

/**
 * Normalizes a value to always be an array
 * @param {*} value - The value to normalize
 * @param {number} maxItems - Maximum items to return (for safety)
 * @returns {Array} - Always returns an array
 */
export function ensureArray(value, maxItems = 100) {
  // Already an array
  if (Array.isArray(value)) {
    return value.slice(0, maxItems);
  }
  
  // Null or undefined
  if (value == null) {
    return [];
  }
  
  // String - try to parse as JSON, or split by common delimiters
  if (typeof value === 'string') {
    // Empty string
    if (!value.trim()) {
      return [];
    }
    
    // Try JSON parse
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, maxItems);
      }
    } catch (e) {
      // Not JSON, continue
    }
    
    // Split by common delimiters
    if (value.includes(',')) {
      return value.split(',').map(s => s.trim()).filter(Boolean).slice(0, maxItems);
    }
    if (value.includes('\n')) {
      return value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, maxItems);
    }
    
    // Single item
    return [value];
  }
  
  // Object - wrap in array
  if (typeof value === 'object') {
    return [value];
  }
  
  // Primitive - wrap in array
  return [value];
}

/**
 * Normalizes AI goal suggestion data
 * @param {Object} goal - Raw goal data from AI
 * @returns {Object} - Normalized goal data
 */
export function normalizeGoalData(goal) {
  if (!goal || typeof goal !== 'object') {
    return null;
  }
  
  return {
    ...goal,
    // Ensure milestones is always an array
    milestones: ensureArray(goal.milestones || goal.initial_milestones || goal.steps || goal.actions),
    // Ensure tips is always an array
    tips: ensureArray(goal.tips || goal.helpful_tips || goal.advice),
    // Ensure benefits is always an array  
    benefits: ensureArray(goal.benefits || goal.advantages),
    // Normalize SMART criteria if present
    smart_criteria: goal.smart_criteria && typeof goal.smart_criteria === 'object' 
      ? goal.smart_criteria 
      : null,
    // Normalize smart_breakdown if present
    smart_breakdown: goal.smart_breakdown && typeof goal.smart_breakdown === 'object'
      ? goal.smart_breakdown
      : null
  };
}

/**
 * Normalizes AI feed data
 * @param {Object} feed - Raw feed data from AI
 * @returns {Object} - Normalized feed data
 */
export function normalizeFeedData(feed) {
  if (!feed || typeof feed !== 'object') {
    return null;
  }
  
  return {
    ...feed,
    recommended_exercises: ensureArray(feed.recommended_exercises),
    relevant_resources: ensureArray(feed.relevant_resources),
    community_highlights: ensureArray(feed.community_highlights),
    daily_focus: feed.daily_focus || null,
    inspirational_quote: feed.inspirational_quote && typeof feed.inspirational_quote === 'object'
      ? feed.inspirational_quote
      : null
  };
}

/**
 * Safely joins array values with proper validation
 * @param {*} value - Value to join
 * @param {string} separator - Separator to use
 * @returns {string} - Joined string
 */
export function safeJoin(value, separator = ', ') {
  const arr = ensureArray(value);
  return arr.filter(Boolean).join(separator);
}

/**
 * Safely maps over array values with proper validation
 * @param {*} value - Value to map over
 * @param {Function} fn - Mapping function
 * @returns {Array} - Mapped array
 */
export function safeMap(value, fn) {
  const arr = ensureArray(value);
  return arr.map(fn);
}