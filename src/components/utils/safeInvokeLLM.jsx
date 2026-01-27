import { base44 } from '@/api/base44Client';
import { detectCrisisLanguage } from './crisisDetector';

/**
 * Safe wrapper around base44.integrations.Core.InvokeLLM
 * Applies client-side risk gate for user-message-driven calls
 * 
 * @param {Object} params - InvokeLLM parameters
 * @param {string} params.prompt - The user prompt
 * @param {boolean} params.add_context_from_internet - Optional
 * @param {Object} params.response_json_schema - Optional JSON schema
 * @param {string|Array} params.file_urls - Optional file URLs
 * @param {boolean} skipRiskGate - Internal flag to bypass risk check (for system prompts)
 * @returns {Promise} - InvokeLLM response
 * @throws {Error} - If crisis language detected or API error
 */
export async function safeInvokeLLM(params, skipRiskGate = false) {
  // Risk gate check for user-driven prompts
  if (!skipRiskGate && params.prompt && detectCrisisLanguage(params.prompt)) {
    const error = new Error('CRISIS_LANGUAGE_DETECTED');
    error.isCrisisError = true;
    throw error;
  }

  // Pass through to actual InvokeLLM
  return await base44.integrations.Core.InvokeLLM(params);
}

/**
 * Check if an error is a crisis detection error
 * @param {Error} error 
 * @returns {boolean}
 */
export function isCrisisError(error) {
  return error?.isCrisisError === true || error?.message === 'CRISIS_LANGUAGE_DETECTED';
}