# Therapeutic Forms Folder Structure Audit

**Date:** 2026-06-12
**Status:** Audit-only — no files moved, renamed, or deleted
**Branch:** `copilot/docsforms-folder-structure-audit`

---

## 1. Purpose

This document records the current state of the `public/forms/` directory tree and recommends a target structure for future migration. No files have been moved, renamed, or deleted as part of this audit.

---

## 2. Current Folder Structure (as-is)

The `public/forms/` directory currently contains a mix of structured paths (already following a hierarchical convention) and flat/legacy paths (named with underscore-concatenated conventions):

### 2a. Structured paths (partially normalized)

```
public/forms/adolescents/en/cbt-specialized/
public/forms/adolescents/en/core/individual/
public/forms/children/en/cbt-core/
```

### 2b. Legacy flat paths (Hebrew series — adolescents)

```
public/forms/adolescents_cbt_core_he_series_1/
public/forms/adolescents_cbt_core_he_series_2/
public/forms/adolescents_cbt_core_he_series_3/
public/forms/adolescents_cbt_core_he_series_4/
public/forms/adolescents_cbt_core_he_series_5_git/
public/forms/adolescents_cbt_core_he_series_6_git/
```

### 2c. Legacy flat paths (Hebrew — children core)

```
public/forms/children_cbt_core_he_module_01_github_upload/
public/forms/children_cbt_core_he_module_02_github_upload/
public/forms/children_cbt_core_he_module_03_github_upload/
public/forms/children_cbt_core_he_module_04_github_upload/
public/forms/children_cbt_core_he_module_05_github_upload/
```

### 2d. Legacy flat paths (English — children specialized)

```
public/forms/children_cbt_specialized_en_1/
public/forms/children_cbt_specialized_en_2/
public/forms/children_cbt_specialized_en_2.1_anger/
public/forms/children_cbt_specialized_en_2.2_odd/
public/forms/children_cbt_specialized_en_3/
public/forms/children_cbt_specialized_en_4/
public/forms/children_cbt_specialized_en_5/
public/forms/children_cbt_specialized_en_5.2_psychosomatic_complaints/
```

### 2e. Legacy flat paths (Hebrew — children specialized)

```
public/forms/children_cbt_specialized_he_01_01_separation_anxiety_github_upload/
public/forms/children_cbt_specialized_he_01_02_specific_phobias_github_upload/
public/forms/children_cbt_specialized_he_01_03_specific_phobias_github_upload/
public/forms/children_cbt_specialized_he_01_04_specific_phobias_github_upload/
public/forms/children_cbt_specialized_he_01_05_specific_phobias_github_upload/
public/forms/children_cbt_specialized_he_2.3__impulsivity/
public/forms/children_cbt_specialized_he_3.1_low_self_esteem/
public/forms/children_cbt_specialized_he_4.1_ocd/
public/forms/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd/
public/forms/children_cbt_specialized_he_5.1_sleep_problems/
public/forms/children_cbt_specialized_he_5.3_enuresis_stress_support/
```

### 2f. Unscoped module folders (root-level — audience/language unknown)

```
public/forms/module-01/
public/forms/module-02/
public/forms/module-03/
public/forms/module-04/
public/forms/module-05/
public/forms/module-06/
public/forms/module-07/
public/forms/module-08/
public/forms/module-09/
public/forms/module_10/
```

### 2g. Manifest files (root-level)

```
public/forms/manifest.children-cbt-specialized-en.json
```

---

## 3. Recommended Target Structure

The recommended structure follows the convention:

```
public/forms/{audience}/{lang}/{collection}/module-XX/
```

### Examples

```
public/forms/adolescents/he/cbt-core/module-01/
public/forms/adolescents/he/cbt-core/module-02/
public/forms/adolescents/he/cbt-core/module-03/
public/forms/adolescents/he/cbt-core/module-04/
public/forms/adolescents/he/cbt-core/module-05/
public/forms/adolescents/he/cbt-core/module-06/

public/forms/adolescents/en/cbt-specialized/module-01/
public/forms/adolescents/en/core/module-01/

public/forms/children/he/cbt-core/module-01/
public/forms/children/he/cbt-core/module-02/
public/forms/children/he/cbt-core/module-03/
public/forms/children/he/cbt-core/module-04/
public/forms/children/he/cbt-core/module-05/

public/forms/children/en/cbt-core/module-01/
public/forms/children/en/cbt-specialized/module-01/
public/forms/children/en/cbt-specialized/module-02/
...

public/forms/children/he/cbt-specialized/module-01/
public/forms/children/he/cbt-specialized/module-02/
...
```

---

## 4. Why Lowercase `en`/`he` (Not `EN`/`HE`)

All existing runtime language codes in the application use lowercase (`en`, `he`). The `fileUrl` values in `src/generated/therapeutic-forms-index.json` and all registered paths already use lowercase. Using uppercase language codes in new paths would:

- Introduce a casing mismatch with existing registry entries.
- Require updates to language-gating logic.
- Risk breaking Open/Download behavior on case-sensitive file systems.

**Recommendation:** Always use lowercase language codes in new path segments.

---

## 5. Observations

| Area | Finding |
|---|---|
| Partially structured paths | `adolescents/en/` and `children/en/` already follow the target convention. |
| Hebrew paths | All Hebrew assets (`_he_`) are stored as legacy flat paths, inconsistent with English assets. |
| Root-level modules | `public/forms/module-01/` through `module-10/` are unscoped — audience and language are unknown. |
| Manifests | `manifest.children-cbt-specialized-en.json` is at the root of `public/forms/`; should be colocated or consolidated. |
| `_git` / `_github_upload` suffixes | Legacy upload artifacts embedded in folder names. Should be removed in future migration. |

---

## 6. Migration Prerequisites

> **No migration is recommended in this PR.** This document is audit-only.

Before any folder migration:

1. **Run safety tests** — ensure all existing `fileUrl` values resolve correctly.
2. **Regenerate the forms index** — run `npm run generate:forms-index` and `npm run check:forms-index` to confirm no orphan or missing PDFs.
3. **Update `fileUrl` references** — update all entries in `src/generated/therapeutic-forms-index.json` and the source data to reflect new paths (do not change existing paths until tests confirm the new paths work).
4. **Verify language gating** — confirm Hebrew forms only appear in Hebrew mode and English forms only in English mode after migration.
5. **Verify Open/Download behavior** — confirm PDF viewer and download attachment URLs resolve correctly on the new paths.
6. **Verify AI awareness** — ensure no AI agent references break.
7. **Migrate in a dedicated PR** — one audience+language+collection at a time, never in bulk.

---

## 7. Accidental Nested Path Check

| Path checked | Exists? |
|---|---|
| `yossi-dabby/mindful-path/docs/forms-folder-structure-audit.md` | **No** — this accidental nesting was not present in the repository. |
| `docs/forms-folder-structure-audit.md` | **Yes** — this file, at the correct path. |

---

## 8. Summary

- **Audit-only PR.** No files were moved, renamed, or deleted.
- **No registries changed.** No manifests changed. No generated files changed. No production code changed.
- **Recommended target:** `public/forms/{audience}/{lang}/{collection}/module-XX/`
- **Lowercase language codes** (`en`, `he`) are required to match the runtime.
- **Recommended next step:** Safety tests before any migration.
