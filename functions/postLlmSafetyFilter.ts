import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Post-LLM Safety Filter
 * Scans and sanitizes agent outputs to enforce safety boundaries
 * beyond what prompts can guarantee.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assistant_message, metadata } = await req.json();

    // DIAGNOSIS PATTERNS (hard block)
    const diagnosisPatterns = [
      /you (have|are suffering from|show signs of|may have) (depression|anxiety disorder|bipolar|schizophrenia|ptsd|ocd|adhd|bpd|personality disorder)/gi,
      /\b(diagnose|diagnosis of|clinical diagnosis)\b/gi,
      /\byou('re| are) (depressed|bipolar|schizophrenic)\b/gi,
      /\bthis (is|sounds like) (major depression|clinical anxiety|bipolar disorder|ptsd)/gi
    ];

    // MEDICATION PATTERNS (hard block)
    const medicationPatterns = [
      /\b(take|try|start|stop|increase|decrease) (prozac|zoloft|lexapro|xanax|ativan|klonopin|valium|adderall|ritalin|lithium|seroquel|abilify|wellbutrin|cymbalta|effexor|paxil|celexa|buspar)\b/gi,
      /\b(ssri|snri|benzodiazepine|antidepressant|anti-anxiety medication|mood stabilizer|antipsychotic)\s*(might help|could help|would help|is effective)\b/gi,
      /\bask your doctor about (medication|meds|prescription)\b/gi
    ];

    // HARMFUL COPING PATTERNS (replace)
    const harmfulCopingPatterns = [
      { pattern: /\b(drink alcohol|have a drink|use alcohol)\b/gi, replacement: 'use healthy coping strategies' },
      { pattern: /\b(skip meals?|don't eat|avoid eating)\b/gi, replacement: 'maintain regular eating' },
      { pattern: /\b(isolate yourself|stay away from everyone)\b/gi, replacement: 'take breaks when needed, but stay connected' },
      { pattern: /\b(push through the pain|ignore your feelings)\b/gi, replacement: 'acknowledge your feelings and pace yourself' }
    ];

    // OUTCOME GUARANTEE PATTERNS (soften)
    const guaranteePatterns = [
      { pattern: /\bthis will (fix|cure|eliminate|get rid of)\b/gi, replacement: 'this might help with' },
      { pattern: /\byou('ll| will) (definitely |certainly )?feel better\b/gi, replacement: 'you might feel better' },
      { pattern: /\bthis (always |definitely )?works\b/gi, replacement: 'this often helps' },
      { pattern: /\bguaranteed to\b/gi, replacement: 'likely to' }
    ];

    let sanitized_message = assistant_message;
    let flags = [];

    // BLOCK: Diagnosis language
    for (const pattern of diagnosisPatterns) {
      if (pattern.test(sanitized_message)) {
        flags.push('diagnosis_language_detected');
        sanitized_message = "I'm not qualified to diagnose. For a professional assessment, please consult a licensed therapist or psychiatrist.";
        break;
      }
    }

    // BLOCK: Medication advice
    if (flags.length === 0) {
      for (const pattern of medicationPatterns) {
        if (pattern.test(sanitized_message)) {
          flags.push('medication_advice_detected');
          sanitized_message = "I can't provide medication advice. For questions about medication, please consult your doctor or psychiatrist.";
          break;
        }
      }
    }

    // REPLACE: Harmful coping
    if (flags.length === 0) {
      for (const { pattern, replacement } of harmfulCopingPatterns) {
        if (pattern.test(sanitized_message)) {
          flags.push('harmful_coping_replaced');
          sanitized_message = sanitized_message.replace(pattern, replacement);
        }
      }
    }

    // SOFTEN: Guarantees
    if (flags.length === 0) {
      for (const { pattern, replacement } of guaranteePatterns) {
        if (pattern.test(sanitized_message)) {
          flags.push('guarantee_language_softened');
          sanitized_message = sanitized_message.replace(pattern, replacement);
        }
      }
    }

    // LOG INCIDENTS
    if (flags.length > 0) {
      // Track safety filter activations
      base44.analytics.track({
        eventName: 'post_llm_safety_filter_triggered',
        properties: {
          flags: flags.join(', '),
          original_length: assistant_message.length,
          sanitized_length: sanitized_message.length,
          user_email: user.email
        }
      });
    }

    return Response.json({
      sanitized_message,
      flags,
      was_modified: flags.length > 0
    });

  } catch (error) {
    console.error('Post-LLM safety filter error:', error);
    return Response.json({ 
      error: 'Safety filter failed',
      sanitized_message: "I'm having trouble processing that. Let's try a different approach.",
      flags: ['filter_error'],
      was_modified: true
    }, { status: 500 });
  }
});