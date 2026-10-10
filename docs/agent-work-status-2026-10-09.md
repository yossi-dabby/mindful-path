# Active-Agent Work Status — updated 2026-10-10

| Stage | Status | Evidence / remaining gate |
|---|---|---|
| 1. Configuration protection | Complete | CI enforces exactly two active agents, inert archives, per-user memory, approved tools, no unplanned connectors/channels, and `automatic` models |
| 2. Quality benchmark | Corrected live baseline completed | PR #1013 / run 37946159587: 140/140 passed preliminary live-response review. PR #1020 / run 37969173230: production crisis workflow succeeded. Human bilingual/clinical review remains pending |
| 3. Coach model experiment | Completed; promotion pending human review | Automatic, GPT-6 Luna, GPT-6 Sol: 70/70. Claude Sonnet 5: 69/70, rejected for Portuguese/Spanish mismatch. See ai-coach-model-comparison-2026-10-09.md. Production stays automatic |
| 4. Coach improvement | First isolated candidate rejected | #1023 / run 38071587060: 68/70, two hard-gate failures (Hebrew raw tool markup, Portuguese technical output). No promotion; production instructions unchanged |
| 5. Therapist compaction | Preliminary live comparison passed; human review pending | #1024 / run 38071607703: 77/77, 11/11 per language, zero hard-gate failures. Formatting candidate 150,256 → 142,599 characters; no latency/length improvement demonstrated. Production unchanged |
| 6. Legacy cleanup | First UI cleanup PR prepared | #1025 removes the unmounted draggable widget; 158 targeted unit tests and 8 archive SDK read fixtures pass. Four archived agents and all data retained; full CI and human web/Android smoke remain |

## Live response benchmark runner

The repository now includes a manually gated live-response runner for the 140 non-crisis
agent/language cases. It authenticates only as the dedicated verified test user
`yosephdabby4@gmail.com`, creates a fresh conversation per synthetic case, and performs a
batched AI-assisted bilingual and clinical-safety screen. Retained evidence contains response
hashes, model/usage/latency metadata, scores, and short rationales, but no raw response text or
credentials.

The runner cannot replace licensed-clinician review. Any model change or wide release remains
blocked until a qualified clinician reviews the critical cases. The workflow requires the
repository secrets `BASE44_LIVE_TEST_EMAIL` and `BASE44_LIVE_TEST_PASSWORD`; the latter must be
the Mindful Path/Base44 app password, never the user's Google password.

## Controlled-release gate

No wide release follows automatically from these engineering stages. Every behavioral change
still requires local tests, Test Suite, Playwright, Base44 preview, manual web/Android checks,
a limited tester cohort, and then an explicit release decision.


## Post-#1019 verification — 2026-10-10

Base44 source checkpoint: `945294067616dd0f8841a2d2d9554d8f18a0c678`.

- Agent policy: 2 active, 4 archived; no mutable entity tools.
- Targeted memory/summarization/continuity unit tests: 264/264 passed.
- Browser continuity suite: 12/12 passed across desktop and mobile, with mocked backend surfaces.
- #1022 / run 38071364970 proves a live synthetic app-owned summary write and fresh-authenticated read across distinct sessions. Raw responses/credentials are not retained. Full live UI-to-model carryover remains a human check.
- Live verification uses repository secrets only; production persistence flags passed again in run 38071607662.
- `scripts/agent-prompt-candidates.mjs` emits measurement metadata only; it cannot deploy candidates or edit production agents.
- Human review packet: `agent-human-review-packet-2026-10-10.md`; bilingual/clinical sign-off and a limited pilot are pending.
- Original immutable prompt report is retained. It predates #1019; do not treat its therapist hash as the current baseline.

## Final isolated experiments

- Coach refinement: rejected, 68/70 with two hard-gate failures; artifact 11676658888.
- Therapist formatting compaction: 77/77 preliminary passes; artifact 11676634734. Human bilingual/clinical review pending; do not infer a quality gain from character savings.
- Combined isolated worktree: 10,980 tests passed, 267 pre-existing skips; lint passed; build produced dist/index.html; 18 boot/coach/continuity checks and 8 archive read checks passed.
- Temporary remote benchmark configs removed. Checkpoint c88f107a2ab8a1231e0a6f681c481dd79316b354 has source content identical to verified baseline 945294067616dd0f8841a2d2d9554d8f18a0c678. Canonical 2-active/4-archived policy passes.
- #1021, #1022 and #1025 are reviewable PRs, not merged production changes. Final CI and human preview/web/Android checks remain release gates.
