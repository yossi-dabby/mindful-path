<<<<<<< copilot/fix-update-trusted-cbt-chunk-import-files
# TrustedCBTChunk Smoke Import — Admin Rollout Guide

> **Audience:** Administrators with access to `/KnowledgeStudio`.
> **Purpose:** Step-by-step instructions for safely importing the first batch of TrustedCBTChunk records using the existing Bulk Import flow.

---

## Overview

Two bundled JSON files are now available in the app:

| File | Records | Purpose |
|---|---|---|
| `trusted-cbt-batch-1.smoke.base44.json` | 3 | Smoke test — validate end-to-end import with minimal data |
| `trusted-cbt-batch-1.base44.json` | 10 | Full batch — complete first set of curated CBT chunks |

Both files contain only valid Base44 `TrustedCBTChunk` schema fields. All records have `is_active: false` so they will not surface in retrieval until explicitly activated.

---

## Step-by-Step: Smoke Import

### 1. Open Bulk Import

Navigate to `/KnowledgeStudio` → click the **Bulk Import** tab.

### 2. Load the Smoke Batch

Click **Load Smoke Batch**. The textarea will be pre-filled with 3 records. No file browsing required.

### 3. Validate JSON

Click **Validate JSON**. The Validation Report will show:
- ✅ 3 valid records
- No missing required fields, no extra non-Base44 fields, no invalid `language` or `priority_score`

If any errors appear, do not import. Review the error details and contact the development team.

### 4. Import

Click **Import 3 valid record(s)**. The import progress is shown record-by-record. Expect all 3 to succeed.

### 5. Confirm in Library

Switch to the **Library** tab. You should see 3 new `TrustedCBTChunk` records with `is_active: false`.

### 6. Retrieval Preview (Before Activating)

Switch to the **Retrieval Preview** tab. Run each of the three sample payloads below. Confirm that each returns meaningful results from the newly imported chunks.

### 7. Activate 1–2 Records

Return to the **Library** tab. Edit one or two records and set `is_active` to `true`. Then re-run the Retrieval Preview to confirm they surface correctly in responses.

> **Do not activate all records at once.** Activate incrementally and monitor retrieval quality between activations.

---

## Step-by-Step: Full Batch Import

After the smoke import is confirmed to be working correctly:

1. Open **Bulk Import** tab.
2. Click **Load Full Batch** (10 records).
3. Click **Validate JSON** — expect 10 valid records.
4. Click **Import 10 valid record(s)**.
5. Confirm in Library — 10 records with `is_active: false`.
6. Activate records gradually, verifying retrieval after each activation.

---

## Key Safety Rules

- **Keep all records inactive initially.** `is_active: false` is the default for all bundled records.
- **Activate only 1–2 records at a time** after verifying Retrieval Preview output.
- **Never activate the Safety Planning record** (`priority_score: 10`, topic: `crisis_intervention`) without a clinical review — it is clinician-use only.
- If an import fails partway through, re-run from Bulk Import — the `TrustedCBTChunk` entity deduplicates by title at the application layer.

---

## Sample Retrieval Preview Payloads

Use these payloads in the **Retrieval Preview** tab to validate that imported chunks surface appropriately for key clinical topics.

### Payload 1 — Panic

```json
{
  "query": "I keep having panic attacks and I'm terrified something is wrong with my heart",
  "topic": "panic",
  "population": "adults"
}
```

**Expected:** The Panic Disorder Psychoeducation chunk (`fight-or-flight response`) should rank in the top result. The response should include reassurance about cardiac symptoms and explain the physiological mechanism of panic.

---

### Payload 2 — Behavioral Activation

```json
{
  "query": "I have no motivation to do anything. I just lie in bed all day and feel worse",
  "topic": "depression",
  "population": "adults"
}
```

**Expected:** The Behavioral Activation chunk (`activity_scheduling`) should surface prominently. The response should describe the withdrawal-depression cycle and introduce activity monitoring and scheduling as the intervention.

---

### Payload 3 — Catastrophising

```json
{
  "query": "I always assume the worst will happen. I know it's irrational but I can't stop spiralling",
  "topic": "anxiety",
  "population": "adults"
}
```

**Expected:** The Catastrophising / Decatastrophisation chunk should be retrieved. The response should introduce the probability reappraisal technique and the best-case / worst-case / most-likely-case exercise.

---

## Rollback

If imported records need to be removed:

1. In the **Library** tab, filter by `is_active: false`.
2. Identify and delete the newly imported chunks individually using the delete action.
3. There is no bulk-delete; deletions must be performed record by record.

---

## Files Changed

| File | What It Does |
|---|---|
| `src/data/trusted-cbt-batch-1.base44.json` | 10 curated CBT chunks — Base44 TrustedCBTChunk schema only |
| `src/data/trusted-cbt-batch-1.smoke.base44.json` | 3-record smoke subset (panic, BA, catastrophising) |
| `src/components/knowledge/BulkImport.jsx` | Added "Load Smoke Batch" and "Load Full Batch" buttons; added extra-fields validation guard |

---

<!-- Last updated: 2026-03-26 -->
=======
# TrustedCBTChunk Import Rollout Guide

**File:** `docs/trusted-cbt-import-rollout.md`  
**Branch:** `copilot/audit-and-refresh-trusted-cbt`  
**Status:** Ready for admin review before activation

---

## 1. Overview

This document describes the safe rollout procedure for importing the first batch of `TrustedCBTChunk` records into the Base44 live entity store using the existing `/KnowledgeStudio → Bulk Import` admin flow.

All records are prepared with `is_active: false`. No record will be retrievable by the CBT Therapist agent until an admin explicitly activates it after a successful Retrieval Preview.

---

## 2. Import Files

| File | Records | Purpose |
|------|---------|---------|
| `src/data/trusted-cbt-batch-1.smoke.base44.json` | 3 | Smoke import — validates the end-to-end pipeline |
| `src/data/trusted-cbt-batch-1.base44.json` | 10 | Full batch import |

Both files contain only fields from the Base44 `TrustedCBTChunk` schema:  
`title`, `topic`, `subtopic`, `population`, `clinical_goal`, `content`, `short_summary`, `tags`, `source_name`, `source_type`, `license_status`, `safety_notes`, `contraindications`, `language`, `priority_score`, `is_active`

No non-Base44 fields (`entity_type`, `content_source_type`, `chunk_index`, `evidence_level`) are present.

---

## 3. Import Order — Smoke First, Then Full Batch

### Step 1 — Smoke Import

1. Navigate to `/KnowledgeStudio` (admin only).
2. Click the **Bulk Import** tab.
3. Open `src/data/trusted-cbt-batch-1.smoke.base44.json`, copy the entire contents.
4. Paste into the JSON textarea.
5. Click **Validate JSON** — all 3 records must show as valid (green ticks) with zero errors.
6. Click **Import 3 valid record(s)**.
7. Confirm the success toast: `Imported 3/3 records`.

> **Do not proceed to Step 2 until Step 1 succeeds completely.**

### Step 2 — Retrieval Preview Verification

After the smoke import, verify retrieval works before activating any record:

1. In KnowledgeStudio, switch to the **Retrieval Preview** tab.
2. Run the three sample queries below (see Section 4).
3. All three must return **0 results** (because `is_active: false`).
4. Activate the 1–2 records most relevant to your test query (see Section 5).
5. Re-run the preview — you should now see matched results for the activated records.

### Step 3 — Full Batch Import

1. After the smoke import is confirmed successful and at least one record has been Retrieval-Preview-verified:
2. Open `src/data/trusted-cbt-batch-1.base44.json`, copy the entire contents.
3. Paste into the BulkImport textarea.
4. Click **Validate JSON** — all 10 records must show as valid.
5. Click **Import 10 valid record(s)**.
6. Confirm: `Imported 10/10 records`.

> **Note:** The 3 smoke records will already exist. BulkImport creates new records; it does not deduplicate. If you imported the smoke file in Step 1, **delete the 3 smoke records from the Library tab before importing the full batch**. This is the recommended path. Do not import the full batch on top of the smoke import — you will have 13 records with 3 duplicates.

---

## 4. Sample Retrieval Preview Payloads

Use these in the **Retrieval Preview** tab (`/KnowledgeStudio → Retrieval Preview`) to validate that the retrieval function returns relevant chunks after activation.

### 4a — Panic

```json
{
  "userMessage": "I keep having panic attacks and I can't breathe. My heart is racing and I feel like I'm dying.",
  "topicHint": "panic",
  "emotionalState": "panic",
  "maxResults": 3
}
```

**Expected results after activating relevant records:**
- `Diaphragmatic Breathing for Panic Attacks` (topic: panic, tags: panic, breathing)
- `Interoceptive Exposure for Panic Disorder` (topic: panic, tags: panic, interoceptive exposure)

---

### 4b — Behavioral Activation

```json
{
  "userMessage": "I have no motivation and I can't get myself to do anything. I just stay in bed all day.",
  "topicHint": "behavioral activation",
  "emotionalState": "depression",
  "maxResults": 3
}
```

**Expected results after activating relevant records:**
- `Behavioral Activation: Scheduling Pleasant Activities` (topic: behavioral activation, tags: depression, behavioral activation)
- `Values Clarification in CBT: Building a Meaningful Life` (tags: behavioral activation, motivation, depression)

---

### 4c — Catastrophizing

```json
{
  "userMessage": "Every time something goes wrong I immediately think it's a total disaster and the worst will happen.",
  "topicHint": "catastrophizing",
  "emotionalState": "anxiety",
  "maxResults": 3
}
```

**Expected results after activating relevant records:**
- `Cognitive Restructuring for Catastrophizing` (topic: catastrophizing, tags: catastrophizing, cognitive restructuring)
- `The ABC Thought Record for Anxiety` (tags: thought record, automatic thoughts)

---

## 5. Activation Guidance

> **Rule:** Keep all records at `is_active: false` initially. Only activate 1–2 records per Retrieval Preview test cycle.

### Activation procedure (per record):

1. In KnowledgeStudio, switch to the **Library** tab.
2. Locate the record by title.
3. Click **Edit**.
4. Toggle `is_active` to **true**.
5. Click **Save**.
6. Switch to **Retrieval Preview** and run a query that should match this record.
7. Confirm the record appears in results.
8. If it does not appear, check: (a) the `is_active` toggle was saved, (b) the query tokens match the record's `tags` or `topic`.

### Recommended initial activation order:

1. `Diaphragmatic Breathing for Panic Attacks` (priority_score: 9) — test with panic query.
2. `Behavioral Activation: Scheduling Pleasant Activities` (priority_score: 9) — test with depression/motivation query.
3. `Cognitive Restructuring for Catastrophizing` (priority_score: 9) — test with catastrophizing/anxiety query.

Only after all three Retrieval Previews pass, activate remaining records in descending priority_score order.

---

## 6. Rollback

If the import causes any issues:

1. Go to the **Library** tab in KnowledgeStudio.
2. Delete the imported records one by one using the delete action.
3. No other system state is affected — the import only creates `TrustedCBTChunk` entity records; it does not change agent wiring, routing, or any production flow.

Because all records are imported with `is_active: false`, a partial rollback (deactivation without deletion) is also safe:
- Toggle `is_active` back to `false` on any record to immediately remove it from retrieval results.

---

## 7. Validation

Before importing, optionally run the local validation utility to confirm the files are Base44-compatible:

```bash
npm test -- --reporter=verbose test/utils/validateBase44Import.test.js
```

All 49 tests must pass. The integration tests directly parse and validate both import files.

---

*Last updated: 2026-03-26*
>>>>>>> staging-fresh
