# TrustedCBTChunk Import Rollout

**Status:** Pre-import. All records are `is_active: false`.  
**Target entity:** `TrustedCBTChunk` (Base44)  
**Import path:** KnowledgeStudio → Bulk Import tab (admin only)

---

## Files

| File | Records | Purpose |
|---|---|---|
| `src/data/trusted-cbt-batch-1.smoke.base44.json` | 3 | Smoke-test import — validate flow before full batch |
| `src/data/trusted-cbt-batch-1.base44.json` | 10 | Full batch import |

Both files contain only the 16 Base44 `TrustedCBTChunk` fields. No repo-only metadata (`entity_type`, `content_source_type`, `chunk_index`, `evidence_level`) is present.

---

## Import Order

**Always import the smoke file first, then the full batch.**

### Step 1 — Smoke Import (3 records)

1. Log in as an admin user.
2. Navigate to `/KnowledgeStudio` → **Bulk Import** tab.
3. Open `src/data/trusted-cbt-batch-1.smoke.base44.json`, copy its contents.
4. Paste into the JSON textarea.
5. Click **Validate JSON** — confirm 3 valid records, 0 invalid.
6. Click **Import 3 valid record(s)**.
7. Navigate to the **Library** tab and verify 3 draft records appear (`is_active: false`).
8. Navigate to the **Retrieval Preview** tab and run the three sample payloads below to confirm retrieval shape. Expect 0 results (all `is_active: false`), which confirms the pipeline is wired correctly.
9. Activate 1 record (panic or catastrophizing) via the Library tab edit form.
10. Re-run the relevant Retrieval Preview payload — confirm 1 result is returned.
11. Deactivate the record after verification.

If step 8–11 succeed without errors, proceed to Step 2.

### Step 2 — Full Batch Import (10 records)

1. Navigate to `/KnowledgeStudio` → **Bulk Import** tab.
2. Open `src/data/trusted-cbt-batch-1.base44.json`, copy its contents.
3. Paste into the JSON textarea.
4. Click **Validate JSON** — confirm 10 valid records, 0 invalid.
5. Click **Import 10 valid record(s)**.
6. Navigate to the **Library** tab and verify all 10 draft records appear.

> The smoke records will appear as duplicates in the Library. Delete or deactivate any duplicates as needed.

---

## Retrieval Preview Payloads

Run these in the **Retrieval Preview** tab at `/KnowledgeStudio`. All records are inactive initially, so expect 0 results until records are activated. Use these payloads to confirm the retrieval pipeline is wired correctly after activation.

### Payload 1 — Panic

```json
{
  "userMessage": "I keep having panic attacks and can't breathe properly",
  "topicHint": "panic",
  "emotionalState": "panicked, overwhelmed",
  "maxResults": 3
}
```

**Expected match (when active):** "Coping with Panic Attacks: Grounding and Breathing"  
**Expected tags scored:** panic, grounding, breathing, 5-4-3-2-1

---

### Payload 2 — Behavioral Activation

```json
{
  "userMessage": "I feel so low and I've stopped doing anything I used to enjoy",
  "topicHint": "depression",
  "emotionalState": "depressed, hopeless, unmotivated",
  "maxResults": 3
}
```

**Expected match (when active):** "Behavioral Activation for Depression: Scheduling Rewarding Activities"  
**Expected tags scored:** depression, behavioral activation, activity scheduling, anhedonia

---

### Payload 3 — Catastrophizing

```json
{
  "userMessage": "I catastrophize everything. I always assume the worst will happen",
  "topicHint": "anxiety",
  "emotionalState": "anxious, fearful",
  "maxResults": 3
}
```

**Expected match (when active):** "Identifying and Challenging Catastrophic Thinking"  
**Expected tags scored:** catastrophizing, cognitive distortion, anxiety, cognitive restructuring

---

## Activation Guidance

1. **Keep all records `is_active: false` until after the smoke import and retrieval preview are verified.**
2. After successful retrieval preview (Step 1, items 8–11), activate only 1–2 records for initial live testing.
3. Suggested first activations (highest clinical priority):
   - `priority_score: 10` — "Safety Planning: Creating a Personal Crisis Response Plan"
   - `priority_score: 9` — "Coping with Panic Attacks: Grounding and Breathing"
   - `priority_score: 9` — "Behavioral Activation for Depression: Scheduling Rewarding Activities"
4. Monitor retrieval results for 48 hours after each activation before activating additional records.
5. Activate remaining records individually, in descending `priority_score` order.

---

## Validation

Before import, validate either file with the batch validator:

```bash
node -e "
const { validateBatchFile } = require('./src/lib/trustedCBTBatchValidator.js');
const r = validateBatchFile('./src/data/trusted-cbt-batch-1.base44.json');
console.log(r.summary);
"
```

Or run the test suite:

```bash
npx vitest run test/utils/trustedCBTBatchValidator.test.js
```

All 58 tests must pass before import.

---

## Rollback

If an import produces unexpected records or retrieval errors:

1. Navigate to `/KnowledgeStudio` → **Library** tab.
2. Ensure all imported records have `is_active: false` (the default — no change needed if activation was not yet performed).
3. Delete individual records using the Library edit/delete controls.
4. No changes to entity schema, agent wiring, or production flows are required — this import is fully reversible.

---

## Assumptions

- The `/KnowledgeStudio` admin route and `TrustedCBTChunk` entity are live and accessible.
- The `retrieveTrustedCBTContent` Base44 function is deployed and filters by `is_active: true`.
- Duplicate records (from smoke + full batch) can be resolved via the Library UI delete action.
- The retrieval pipeline uses keyword scoring (v1 deterministic); semantic scoring may improve results in future phases.

---

*Last updated: 2026-03-26*
