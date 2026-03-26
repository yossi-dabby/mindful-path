# Trusted CBT Chunk — Smoke Import Rollout

> **Audience:** Admins with access to `/KnowledgeStudio`.
> **Risk level:** 🟢 Low — all records are imported as `is_active: false`. No live retrieval is affected until records are manually activated.

---

## Overview

This document describes how to perform the smoke import of the first TrustedCBTChunk batch using the built-in **Bulk Import** tab in KnowledgeStudio. No repository files need to be opened or copied manually.

Two bundled batches are available directly in the UI:

| Button | File | Records |
|---|---|---|
| **Load Smoke Batch** | `trusted-cbt-batch-1.smoke.base44.json` | 3 records (anxiety, depression, catastrophizing) |
| **Load Full Batch** | `trusted-cbt-batch-1.base44.json` | 10 records (full first batch) |

---

## Step-by-step: First Smoke Import

### 1. Open Bulk Import

Navigate to `/KnowledgeStudio` → click the **Bulk Import** tab.

### 2. Load the Smoke Batch

Click **Load Smoke Batch**.

The textarea is automatically populated with the 3-record smoke batch JSON. No file copying or pasting required.

### 3. Validate JSON

Click **Validate JSON**.

The Validation Report appears below. Confirm:
- ✅ **3 valid** — no errors shown.
- If any record shows errors, review the field values in the textarea before proceeding.

### 4. Import

Click **Import 3 valid record(s)**.

The Import Results card appears. All 3 records should show a green ✅ (success).

> **All records are imported as `is_active: false`.** They will **not** appear in live retrieval until explicitly activated.

### 5. Verify in Library

Switch to the **Library** tab. Confirm the 3 records appear with `is_active = false`.

---

## Activating Records (after Retrieval Preview verification)

Keep all records inactive initially. Activate only **1–2 records** after verifying the Retrieval Preview returns expected results.

### Activation Checklist

- [ ] Run at least 3 Retrieval Preview queries (see samples below).
- [ ] Confirm the target record appears in the results at an appropriate rank.
- [ ] Open the record in the **Library** tab → click **Edit**.
- [ ] Set `is_active` to **true**.
- [ ] Save.
- [ ] Re-run the Retrieval Preview to confirm the record is now returned.

---

## Sample Retrieval Preview Payloads

Use these in the **Retrieval Preview** tab to verify retrieval quality before activating records.

### 1. Panic / Anxiety

```json
{
  "userMessage": "I keep having panic attacks and I can't stop thinking about worst case scenarios",
  "topicHint": "anxiety",
  "emotionalState": "panic",
  "maxResults": 5
}
```

**Expected:** Records tagged with `anxiety`, `catastrophizing`, `automatic thoughts` should rank highly.

---

### 2. Behavioural Activation

```json
{
  "userMessage": "I have no motivation to do anything and I've stopped doing the things I used to enjoy",
  "topicHint": "depression",
  "emotionalState": "low mood",
  "maxResults": 5
}
```

**Expected:** Records tagged with `behavioral activation`, `depression`, `activity scheduling` should rank highest.

---

### 3. Catastrophizing

```json
{
  "userMessage": "Every time something goes wrong I assume the absolute worst is going to happen",
  "topicHint": "cognitive distortions",
  "emotionalState": "anxious",
  "maxResults": 5
}
```

**Expected:** The "Decatastrophizing" record tagged with `catastrophizing`, `coping` should rank highly.

---

## Loading the Full Batch (after smoke verification)

Once the smoke batch import has been verified:

1. Navigate to **Bulk Import** tab.
2. Click **Load Full Batch**.
3. Click **Validate JSON** — confirm **10 valid** records.
4. Click **Import 10 valid record(s)**.
5. Verify all 10 records appear in the Library as `is_active: false`.
6. Activate records incrementally, re-running Retrieval Preview after each activation.

---

## What Each File Does

| File | Purpose |
|---|---|
| `src/data/trusted-cbt-batch-1.smoke.base44.json` | 3-record smoke batch for initial import validation. Topics: anxiety, depression, catastrophizing. |
| `src/data/trusted-cbt-batch-1.base44.json` | Full 10-record first batch covering anxiety, depression, cognitive distortions, relaxation, and core CBT techniques. |
| `src/components/knowledge/BulkImport.jsx` | Admin UI component. Now includes **Load Smoke Batch** and **Load Full Batch** buttons that preload the textarea without requiring manual file access. Also validates non-array tags and extra non-Base44 fields. |

---

## Safety Notes

- All imported records have `is_active: false`. No live user sessions are affected by the import itself.
- Do not activate more than 2 records at a time without running Retrieval Preview.
- If a record returns unexpected results in retrieval, set it back to `is_active: false` immediately.
- The `priority_score` field (0–10) affects retrieval ranking. Records with score ≥ 8 rank above lower-scored records when keyword overlap is equal.

---

*Last updated: 2026-03-26*
