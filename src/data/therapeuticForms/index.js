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
export { FORMS_ADOLESCENTS }           from './forms.adolescents.js';
export { FORMS_ADOLESCENTS_CBT_CORE_EN } from './forms.adolescents.cbt-core.en.js';
export { FORMS_ADOLESCENTS_CBT_SPECIALIZED } from './forms.adolescents.cbt-specialized.js';
export { FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN } from './forms.adolescents.cbt-specialized.en.js';
export { FORMS_ADULTS }                from './forms.adults.js';
export { FORMS_OLDER_ADULTS }          from './forms.olderAdults.js';

// ─── Aggregated registry ──────────────────────────────────────────────────────
import { FORMS_CHILDREN }              from './forms.children.js';
import { FORMS_CHILDREN_CBT_PREMIUM }  from './forms.children.cbt-premium.js';
import { FORMS_CHILDREN_CBT_SPECIALIZED } from './forms.children.cbt-specialized.js';
import { FORMS_ADOLESCENTS }           from './forms.adolescents.js';
import { FORMS_ADOLESCENTS_CBT_CORE_EN } from './forms.adolescents.cbt-core.en.js';
import { FORMS_ADOLESCENTS_CBT_SPECIALIZED } from './forms.adolescents.cbt-specialized.js';
import { FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN } from './forms.adolescents.cbt-specialized.en.js';
import { FORMS_ADULTS }                from './forms.adults.js';
import { FORMS_OLDER_ADULTS }          from './forms.olderAdults.js';

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
  ...FORMS_CHILDREN,
  ...FORMS_CHILDREN_CBT_PREMIUM,
  ...FORMS_CHILDREN_CBT_SPECIALIZED,
  ...FORMS_ADOLESCENTS,
  ...FORMS_ADOLESCENTS_CBT_CORE_EN,
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED,
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN,
  ...FORMS_ADULTS,
  ...FORMS_OLDER_ADULTS,
]);

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
