/**
 * TherapeuticForms — Public Index
 *
 * The single entry point for the TherapeuticForms library.
 *
 * Exports:
 *   - Taxonomy: AUDIENCE_GROUPS, THERAPEUTIC_CATEGORIES, SUPPORTED_LANGUAGES, RTL_LANGUAGES
 *   - Registry: ALL_FORMS (aggregated, read-only)
 *   - Resolver: all resolver utility functions
 *
 * Usage:
 *   import { listFormsByAudience, resolveFormWithLanguage } from '@/data/therapeuticForms';
 */

import GENERATED_THERAPEUTIC_FORMS_INDEX from '../../generated/therapeutic-forms-index.json';

// ─── Taxonomy ─────────────────────────────────────────────────────────────────
export {
  AUDIENCE_GROUPS,
  THERAPEUTIC_CATEGORIES,
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  VALID_AUDIENCE_VALUES,
  VALID_CATEGORY_VALUES,
} from './categories.js';

// ─── Per-audience form registries ─────────────────────────────────────────────
export { FORMS_CHILDREN }              from './forms.children.js';
export { FORMS_CHILDREN_CBT_PREMIUM }  from './forms.children.cbt-premium.js';
export { FORMS_CHILDREN_CBT_SPECIALIZED } from './forms.children.cbt-specialized.js';
export { FORMS_CHILDREN_CBT_CORE_EN } from './forms.children.cbt-core.en.js';
export { FORMS_ADOLESCENTS }           from './forms.adolescents.js';
export { FORMS_ADOLESCENTS_CBT_CORE_EN } from './forms.adolescents.cbt-core.en.js';
export { FORMS_ADOLESCENTS_CBT_SPECIALIZED } from './forms.adolescents.cbt-specialized.js';
export { FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN } from './forms.adolescents.cbt-specialized.en.js';
export { FORMS_ADULTS }                from './forms.adults.js';
export { FORMS_OLDER_ADULTS }          from './forms.olderAdults.js';

// ─── Aggregated registry ──────────────────────────────────────────────────────

function buildCanonicalRegistry(forms) {
  const byId = new Map();
  for (const form of forms) {
    if (!form?.id) continue;
    if (byId.has(form.id)) {
      if (import.meta.env?.DEV) {
        console.warn(`[TherapeuticForms] Duplicate form id in canonical registry ignored: ${form.id}`);
      }
      continue;
    }
    byId.set(form.id, form);
  }
  return Object.freeze(Array.from(byId.values()));
}

/**
 * The complete, aggregated therapeutic forms registry.
 * This is the single source of truth consumed by the resolver.
 *
 * Adding new forms: add entries to the relevant per-audience file.
 * The resolver picks them up automatically via this aggregation.
 *
 * @type {readonly object[]}
 */
export const ALL_FORMS = buildCanonicalRegistry([
  ...GENERATED_THERAPEUTIC_FORMS_INDEX,
]);

export function getTherapeuticFormsRegistryDiagnostics(forms = ALL_FORMS) {
  const diagnostics = {
    total: forms.length,
    byLanguage: {},
    byAudience: {},
    byCategory: {},
    source: 'src/generated/therapeutic-forms-index.json',
    environment: import.meta.env?.MODE || 'unknown',
    sampleResolvedFilePath: forms[0]?.fileUrl || forms[0]?.languages?.en?.file_url || null,
  };

  for (const form of forms) {
    const language = String(form?.language || 'unknown');
    const audience = String(form?.audience || 'unknown');
    const category = String(form?.category || 'unknown');
    diagnostics.byLanguage[language] = (diagnostics.byLanguage[language] || 0) + 1;
    diagnostics.byAudience[audience] = (diagnostics.byAudience[audience] || 0) + 1;
    diagnostics.byCategory[category] = (diagnostics.byCategory[category] || 0) + 1;
  }

  return diagnostics;
}

// ─── Resolver utilities ───────────────────────────────────────────────────────
export {
  listAudienceGroups,
  listTherapeuticCategories,
  listFormsByAudience,
  listFormsByCategory,
  listFormsByAudienceAndCategory,
  resolveFormById,
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from './resolveTherapeuticForms.js';
