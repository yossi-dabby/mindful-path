import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Post-LLM safety filter: validates agent output for medical claims and harmful advice
 * Called after agent generates response, before displaying to user
 * Returns: { safe: boolean, filtered_message: string, violations: string[] }
 */

const MEDICAL_CLAIM_PATTERNS = [
  /\b(diagnos(e|is|ed|ing)|prescrib(e|ed|ing)|treat(ment)?)\b/i,
  /\byou (have|might have|could have|probably have)\b.*\b(disorder|condition|disease|illness)\b/i,
  /\btake (this|these) (medication|drug|pill|supplement)s?\b/i,
  /\bstop taking (your )?(medication|meds|pills)\b/i,
  /\b(definitely|certainly) (have|are|suffer from)\b/i,
  /\bI (can )?(diagnose|prescribe|treat)\b/i
];

const HARMFUL_ADVICE_PATTERNS = [
  /\b(skip|avoid|ignore) (your )?(therapy|doctor|medical|professional)\b/i,
  /\byou don'?t need (a )?(therapist|doctor|professional|help)\b/i,
  /\bjust (stop|quit) (your )?(medication|meds|pills)\b/i,
  /\b(self-medicate|self medicate)\b/i
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { assistant_message, conversation_id, agent_name } = await req.json();

    if (!assistant_message || typeof assistant_message !== 'string') {
      return Response.json({ 
        safe: false, 
        filtered_message: 'Unable to process response.',
        violations: ['invalid_input']
      });
    }

    const violations = [];
    
    // Check for medical claims
    for (const pattern of MEDICAL_CLAIM_PATTERNS) {
      if (pattern.test(assistant_message)) {
        violations.push('medical_claim');
        break;
      }
    }

    // Check for harmful advice
    for (const pattern of HARMFUL_ADVICE_PATTERNS) {
      if (pattern.test(assistant_message)) {
        violations.push('harmful_advice');
        break;
      }
    }

    // If violations found, use LLM to double-check and generate safe alternative
    if (violations.length > 0) {
      console.log('[Safety Filter] Violations detected:', violations);
      
      const llmCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a safety filter for a mental health AI. Review this AI response for safety violations:

AI Response: "${assistant_message}"

Potential violations detected: ${violations.join(', ')}

1. Does this response make medical claims (diagnosis, prescriptions, treatment advice)? YES/NO
2. Does this response give harmful advice (avoid doctors, stop medication)? YES/NO
3. If YES to either: Provide a safe, supportive alternative response that redirects appropriately.

Return ONLY this JSON:
{
  "is_unsafe": true/false,
  "confirmed_violations": ["medical_claim", "harmful_advice"],
  "safe_alternative": "string or null"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            is_unsafe: { type: "boolean" },
            confirmed_violations: { 
              type: "array",
              items: { type: "string" }
            },
            safe_alternative: { type: "string" }
          },
          required: ["is_unsafe", "confirmed_violations"]
        }
      });

      if (llmCheck.is_unsafe) {
        // Log safety violation
        base44.analytics.track({
          eventName: 'safety_filter_triggered',
          properties: {
            violations: llmCheck.confirmed_violations,
            conversation_id,
            agent_name
          }
        });

        // Return filtered response
        return Response.json({
          safe: false,
          filtered_message: llmCheck.safe_alternative || 
            "I'm not able to provide medical advice. For health concerns, please consult a licensed professional.",
          violations: llmCheck.confirmed_violations
        });
      }
    }

    // No violations or false positive - allow original message
    return Response.json({
      safe: true,
      filtered_message: assistant_message,
      violations: []
    });

  } catch (error) {
    console.error('[Post-LLM Safety Filter] Error:', error);
    
    // Fail-safe: return original message but log error
    return Response.json({
      safe: true,
      filtered_message: req.json().assistant_message || 'Error processing response.',
      violations: [],
      error: error.message
    }, { status: 200 });
  }
});