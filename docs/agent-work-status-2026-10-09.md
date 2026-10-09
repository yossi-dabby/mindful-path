# Active-Agent Work Status — 2026-10-09

| Stage | Status | Evidence / remaining gate |
|---|---|---|
| 1. Configuration protection | Complete | CI enforces exactly two active agents, inert archives, per-user memory, approved tools, no unplanned connectors/channels, and `automatic` models |
| 2. Quality benchmark | Structural gate complete; response review pending | All 140 production-assets structural cases passed: 14 crisis cases plus 126 non-crisis routing cases. Live model-response grading still requires a dedicated test account and bilingual/clinical reviewers |
| 3. Coach model experiment | Prepared, not started | Baseline is hashed; protocol and promotion gates are defined. Exact candidates must come from the authenticated Base44 editor. No production model was changed |
| 4. Coach improvement | Safe foundation complete | Coach is concise, read-only, consent-led, crisis-gated, and app-owned persistence is gated by explicit completion plus feature flags. Further prompt/model tuning waits for Stage 2 response evidence |
| 5. Therapist compaction | Baseline only | 142,779-character prompt is hashed and frozen. No compaction is permitted before baseline/candidate multilingual comparison and rollback proof |
| 6. Legacy cleanup | Inventory and wave plan complete | `ai_companion` is unmounted and inert; 41 reference files are categorized. No historical agent or compatibility path was deleted |

## Live response benchmark runner

The repository now includes a manually gated live-response runner for the 126 non-crisis
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

