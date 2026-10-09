const RAW_TOOL_CALL_PATTERNS = Object.freeze([
  /<\/?(?:tool_call|tool_calls|function_call|function_calls)\b[^>]*>/i,
  /<\/?(?:invoke|parameter)\b[^>]*>/i,
  /\b(?:retrieveCurriculumUnit|retrieveTherapistMemory|writeTherapistMemory|retrieveTrustedCBTContent|retrieveRelevantContent)\b/i,
]);

export function hasRawToolCallLeakage(content) {
  if (typeof content !== 'string' || content.trim().length === 0) return false;
  return RAW_TOOL_CALL_PATTERNS.some((pattern) => pattern.test(content));
}
