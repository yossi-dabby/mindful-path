# Branch Cleanup Wave 4

> **Status:** Ready for manual dispatch after this PR is merged and approved.
> **Do not run Wave 4 until this PR is merged and approved.**

---

## Purpose

Wave 4 preserves the same controlled branch-cleanup process used in Waves 1, 2, and 3. It prepares the next manually dispatched cleanup wave after a fresh post-Wave-3 inventory refresh.

The refreshed 2026-06-10 inventory found **no additional remote branches** that still qualified as `SAFE_DELETE_MERGED` after applying all Wave 4 safety rules. As a result, the Wave 4 approved list is intentionally empty.

---

## Wave History

| Wave | Branches Deleted | Status |
|---|---|---|
| Wave 1 | 10 | ✅ Successfully deleted |
| Wave 2 | 50 | ✅ Successfully deleted |
| Wave 3 | 50 | ✅ Successfully deleted |
| Total deleted before Wave 4 | 110 | ✅ Confirmed |

---

## Wave 4 Approved List

**Path:** `docs/branch-cleanup-wave-4-approved-list.txt`

The approved list currently contains **0 branches** because the fresh post-Wave-3 inventory showed:

- 383 remote heads on `origin`
- only `origin/main` and the current Wave 4 prep branch merged into `origin/main`
- no open pull requests in the repository
- no additional remote branches older than 14 days that also passed all `SAFE_DELETE_MERGED` checks

---

## Exact Confirmation Input

To run Wave 4, the operator must type exactly:

```
CONFIRM_DELETE_SAFE_MERGED_BRANCHES_WAVE_4
```

Any other value aborts the workflow immediately.

---

## Safety Rules

Wave 4 keeps the same safety rules as the earlier cleanup waves:

1. The workflow is `workflow_dispatch` only.
2. The approved list must not exceed 50 entries.
3. `main`, `origin/main`, `staging-fresh`, and `origin/staging-fresh` are always blocked.
4. Empty strings and branch names with dangerous shell characters are blocked.
5. Every listed branch must exist on `origin`.
6. Every listed branch must be fully merged into `origin/main`.
7. Every listed branch must have no open pull request.
8. Every listed branch must not be the current branch or any protected/special branch.
9. Every listed branch must have no references in workflows, docs, README, package, or deployment config files, except for `docs/branch-cleanup-wave-4-approved-list.txt` itself.
10. The script prints a pre-delete safety table, deletes one branch at a time only after validation passes, and writes `branch-cleanup-wave-4-report.md`.

---

## How to Run from GitHub Actions

1. Open the repository on GitHub.
2. Go to the **Actions** tab.
3. Select **Branch Cleanup Wave 4**.
4. Click **Run workflow**.
5. In the **confirm** input, type exactly:

   ```
   CONFIRM_DELETE_SAFE_MERGED_BRANCHES_WAVE_4
   ```

6. Click **Run workflow**.

The workflow will:

- check out the repository
- fetch remote branches
- verify the exact confirmation input
- run `scripts/branch-cleanup-wave-4.mjs`
- upload `branch-cleanup-wave-4-report.md` as an artifact

---

## Warnings

> ⚠️ **Do not run Wave 4 until this PR is merged and approved.**

> ⚠️ **Wave 5 requires a separate PR and a separate approved list.**

---

Last updated: 2026-06-10
