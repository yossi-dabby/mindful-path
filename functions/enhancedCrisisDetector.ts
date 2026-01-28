import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Enhanced crisis detection using LLM-based classifier
 * Complements regex-based detection for nuanced, implicit crisis language
 * Returns: { is_crisis: boolean, severity: string, reason: string, confidence: number }
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, language = 'en' } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ 
        is_crisis: false, 
        severity: 'none', 
        reason: 'invalid_input',
        confidence: 0 
      });
    }

    // Use LLM to classify crisis risk with structured output
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a mental health crisis detection system. Analyze the following user message for crisis indicators.

User message: "${message}"

Classify the message for crisis risk based on these criteria:
- SEVERE: Explicit self-harm intent, suicide plan, immediate danger, active overdose
- HIGH: Implicit self-harm thoughts, hopelessness, "can't go on", wanting to disappear
- MEDIUM: Distress but no harm intent, feeling overwhelmed, struggling but coping
- NONE: No crisis indicators, normal emotional expression

Return ONLY this JSON structure:
{
  "is_crisis": true/false,
  "severity": "severe" | "high" | "medium" | "none",
  "reason": "brief explanation",
  "confidence": 0.0-1.0
}

Language context: ${language === 'he' ? 'Hebrew (translate if needed)' : 'English'}`,
      response_json_schema: {
        type: "object",
        properties: {
          is_crisis: { type: "boolean" },
          severity: { 
            type: "string", 
            enum: ["severe", "high", "medium", "none"] 
          },
          reason: { type: "string" },
          confidence: { 
            type: "number",
            minimum: 0,
            maximum: 1
          }
        },
        required: ["is_crisis", "severity", "reason", "confidence"]
      }
    });

    // Log all crisis detections
    if (response.is_crisis) {
      base44.analytics.track({
        eventName: 'crisis_detected_llm',
        properties: {
          severity: response.severity,
          confidence: response.confidence,
          reason: response.reason,
          user_email: user.email
        }
      });
    }

    return Response.json(response);

  } catch (error) {
    console.error('[Enhanced Crisis Detector] Error:', error);
    
    // Fail-safe: default to non-crisis but log error
    return Response.json({
      is_crisis: false,
      severity: 'none',
      reason: 'detection_error',
      confidence: 0,
      error: error.message
    }, { status: 200 }); // Return 200 to avoid breaking chat flow
  }
});