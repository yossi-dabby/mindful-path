# Active-Agent Work Status — updated 2026-10-10

| Stage | Status | Evidence / remaining gate |
|---|---|---|
| 1. Configuration protection | Complete | CI enforces exactly two active agents, inert archives, per-user memory, approved tools, no unplanned connectors/channels, and `automatic` models |
| 2. Quality benchmark | Corrected live baseline completed | PR #1013 / run 37946159587: 140/140 passed preliminary live-response review. PR #1020 / run 37969173230: production crisis workflow succeeded. Human bilingual/clinical review remains pending |
| 3. Coach model experiment | Completed; promotion pending human review | Automatic, GPT-6 Luna, GPT-6 Sol: 70/70. Claude Sonnet 5: 69/70, rejected for Portuguese/Spanish mismatch. See ai-coach-model-comparison-2026-10-09.md. Production stays automatic |
| 4. Coach improvement | Isolated candidate prepared | Candidate adds current-turn continuity, reduced repetition, result review, and response-length guidance. Production instructions unchanged; live comparison and human review pending |
| 5. Therapist compaction | Formatting-only candidate prepared | Current post-#1019 baseline: 150,256 characters. Candidate: 142,599 (7,657 fewer). Semantic character order and all non-prompt settings preserved. No production compaction or live quality claim |
| 6. Legacy cleanup | Inventory and wave plan complete | `ai_companion` is unmounted and inert; 41 reference files are categorized. No historical agent or compatibility path was deleted |

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
- These checks prove code-path behavior, not a real production record round-trip. That live persistence check remains open.
- Local sandbox has no dedicated live-test credentials. Existing GitHub workflows use repository secrets without exposing them.
- `scripts/agent-prompt-candidates.mjs` emits measurement metadata only; it cannot deploy candidates or edit production agents.
- Original immutable prompt report is retained. It predates #1019; do not treat its therapist hash as the current baseline.
