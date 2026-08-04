const DEFAULT_CONTEXT_COMPOSER_V2_VERSION = "2.0.0";
const DEFAULT_CONTEXT_COMPOSER_V2_BUDGET_CHARS = 32000;

export const CONTEXT_COMPOSER_V2_VERSION = DEFAULT_CONTEXT_COMPOSER_V2_VERSION;
export const CONTEXT_COMPOSER_V2_BUDGET_CHARS = DEFAULT_CONTEXT_COMPOSER_V2_BUDGET_CHARS;

export const CONTEXT_COMPOSER_V2_OMISSION_REASONS = Object.freeze({
  budget: 'budget',
  duplicate: 'duplicate_id',
  not_emitted: 'not_emitted',
  empty: 'empty_content',
});

function freezeSection(section) {
  return Object.freeze({ ...section });
}

function sanitizeOmissionReason(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function buildSectionRecord({
  id,
  order,
  retention_priority,
  required,
  source_layer,
  content,
  emitted,
  omission_reason,
}) {
  const text = typeof content === 'string' ? content : '';
  return freezeSection({
    id,
    order,
    retention_priority,
    required: required === true,
    source_layer,
    content: text,
    char_count: text.length,
    emitted: emitted === true,
    omission_reason: sanitizeOmissionReason(omission_reason),
  });
}

function buildImmutableResult({ version, budget_chars, budget_exceeded, duplicate_section_detected, fallback_used, output_parity_expected, sections }) {
  const rendered = sections.filter((section) => section.emitted === true).sort((a, b) => a.order - b.order).map((section) => section.content).join('

');
  const emittedSections = sections.filter((section) => section.emitted === true);
  const omittedSections = sections.filter((section) => section.emitted !== true);
  const diagnostic = Object.freeze({
    context_composer_used: true,
    context_composer_version: version,
    section_count: sections.length,
    emitted_section_count: emittedSections.length,
    emitted_section_ids: Object.freeze(emittedSections.map((section) => section.id)),
    omitted_section_ids: Object.freeze(omittedSections.map((section) => section.id)),
    omission_reason_codes: Object.freeze(Array.from(new Set(omittedSections.map((section) => section.omission_reason).filter(Boolean)))),
    duplicate_section_detected: duplicate_section_detected === true,
    total_chars: rendered.length,
    budget_chars,
    budget_exceeded: budget_exceeded === true,
    fallback_used: fallback_used === true,
    output_parity_expected: output_parity_expected === true,
  });
  return Object.freeze({
    version,
    sections: Object.freeze(sections),
    rendered,
    diagnostic,
  });
}

export function createContextComposerV2(options = {}) {
  const version = typeof options.version === 'string' && options.version.trim() ? options.version.trim() : CONTEXT_COMPOSER_V2_VERSION;
  const budget_chars = Number.isInteger(options.budget_chars) && options.budget_chars > 0 ? options.budget_chars : CONTEXT_COMPOSER_V2_BUDGET_CHARS;
  const output_parity_expected = options.output_parity_expected !== false;
  const registry = new Map();
  let duplicate_section_detected = false;
  let finalizedResult = null;

  function registerSection(sectionInput) {
    if (finalizedResult) {
      throw new Error('ContextComposerV2 is already finalized');
    }
    const section = sectionInput && typeof sectionInput === 'object' ? sectionInput : null;
    const id = typeof section?.id === 'string' ? section.id.trim() : '';
    if (!id) {
      throw new Error('ContextComposerV2 section id is required');
    }
    if (registry.has(id)) {
      duplicate_section_detected = true;
      throw new Error(`Duplicate context composer section id: ${id}`);
    }
    const order = Number.isInteger(section?.order) ? section.order : null;
    const retentionPriority = Number.isInteger(section?.retention_priority) ? section.retention_priority : null;
    if (order === null || retentionPriority === null) {
      throw new Error(`ContextComposerV2 section ${id} requires explicit order and retention_priority`);
    }
    registry.set(id, Object.freeze({
      id,
      order,
      retention_priority: retentionPriority,
      required: section?.required === true,
      source_layer: typeof section?.source_layer === 'string' && section.source_layer.trim() ? section.source_layer.trim() : 'unknown',
      content: typeof section?.content === 'string' ? section.content : '',
      omission_reason: sanitizeOmissionReason(section?.omission_reason),
      emitted: section?.emitted !== false,
    }));
  }

  function finalize(finalizeOptions = {}) {
    if (finalizedResult) return finalizedResult;
    const fallbackRendered = typeof finalizeOptions.fallbackRendered === 'string' ? finalizeOptions.fallbackRendered : null;
    const rawSections = Array.from(registry.values()).sort((a, b) => a.order - b.order);
    let sections = rawSections.map((section) => buildSectionRecord({ ...section, emitted: section.emitted !== false && section.content.length > 0, omission_reason: section.emitted === false ? section.omission_reason : (section.content.length > 0 ? null : CONTEXT_COMPOSER_V2_OMISSION_REASONS.empty) }));
    const requiredChars = sections.filter((section) => section.required === true && section.emitted === true).reduce((sum, section) => sum + section.char_count, 0) + Math.max(0, sections.filter((section) => section.required === true && section.emitted === true).length - 1) * 2;
    let budget_exceeded = false;

    if (requiredChars <= budget_chars) {
      let emittedIds = sections.filter((section) => section.emitted === true).map((section) => section.id);
      let renderedLength = sections.filter((section) => section.emitted === true).sort((a, b) => a.order - b.order).map((section) => section.content).join('

').length;
      if (renderedLength > budget_chars) {
        budget_exceeded = true;
        const optionalSections = sections.filter((section) => section.required !== true && section.emitted === true).sort((a, b) => {
          if (a.retention_priority !== b.retention_priority) return a.retention_priority - b.retention_priority;
          return b.order - a.order;
        });
        const dropped = new Set();
        for (const section of optionalSections) {
          if (renderedLength <= budget_chars) break;
          dropped.add(section.id);
          const currentEmitted = sections.filter((item) => item.emitted === true && !dropped.has(item.id)).sort((a, b) => a.order - b.order).map((item) => item.content).join('

');
          renderedLength = currentEmitted.length;
        }
        if (dropped.size > 0) {
          sections = sections.map((section) => dropped.has(section.id)
            ? buildSectionRecord({ ...section, emitted: false, omission_reason: CONTEXT_COMPOSER_V2_OMISSION_REASONS.budget })
            : section);
        }
      }
    } else {
      budget_exceeded = true;
    }

    let fallback_used = false;
    let result = buildImmutableResult({ version, budget_chars, budget_exceeded, duplicate_section_detected, fallback_used, output_parity_expected, sections });

    if (fallbackRendered !== null && result.rendered !== fallbackRendered) {
      fallback_used = true;
      sections = rawSections.map((section) => buildSectionRecord({ ...section, emitted: section.content.length > 0, omission_reason: null }));
      result = buildImmutableResult({ version, budget_chars, budget_exceeded: fallbackRendered.length > budget_chars, duplicate_section_detected, fallback_used, output_parity_expected, sections });
      result = Object.freeze({ ...result, rendered: fallbackRendered, diagnostic: Object.freeze({ ...result.diagnostic, total_chars: fallbackRendered.length, budget_exceeded: fallbackRendered.length > budget_chars, fallback_used: true }) });
    }

    finalizedResult = result;
    return finalizedResult;
  }

  return Object.freeze({
    version,
    budget_chars,
    registerSection,
    finalize,
  });
}
