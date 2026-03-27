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
