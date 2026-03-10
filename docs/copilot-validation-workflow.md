# Copilot Validation Workflow — Mindful Path CBT App

> **Validation reference for contributors and Copilot-assisted PRs.**
> This document defines which commands must pass before merge and how validation maps to change type.
> See also: `docs/copilot-pr-workflow.md`, `docs/copilot-safety-rules.md`.

---

## 1. Core Validation Commands

| Command | Purpose | When Required |
|---|---|---|
| `npm run lint` | ESLint — zero errors required | All PRs |
| `npm run typecheck` | TypeScript type check — no errors | All PRs |
| `npm test` | Vitest unit tests — all must pass | All PRs |
| `npm run build` | Vite production build | All PRs |
| `npm run test:e2e` | Playwright E2E tests (requires running app) | UI / route / component changes |
| `npm run test:knowledge` | Knowledge pipeline unit tests only | Knowledge / retrieval changes |
| `npm run test:regression` | Retrieval regression tests only | Retrieval / indexing changes |
| `npm run validate:pr` | Runs lint + typecheck + unit tests + build in sequence | Full local validation |

---

## 2. Convenience Script: `validate:pr`

Run this locally before opening a PR to confirm all baseline checks pass:

```bash
npm run validate:pr
```

This runs the following in order:
1. `npm run lint` — must produce zero errors
2. `npm run typecheck` — must produce no type errors
3. `npm test` — all unit tests must pass
4. `npm run build` — build must succeed without errors

> **Note:** E2E tests are not included in `validate:pr` because they require a running dev server. Run them separately with `npm run test:e2e` when your change touches UI, routes, or interactive flows.

---

## 3. Risk-Based Validation Strategy

Use the table below to determine which checks are required for your change type. When in doubt, run full validation.

| Change Type | Required Checks |
|---|---|
| **Docs only** (`docs/`, `README.md`, markdown) | `npm run lint` (optional but recommended) |
| **Test only** (`test/`, `tests/`) | `npm run lint` + `npm test` |
| **Pure utility / hook** (`src/utils/`, `src/lib/`, `src/hooks/`) | `npm run validate:pr` |
| **Frontend component** (`src/components/`, `src/pages/`) | `npm run validate:pr` + `npm run test:e2e` |
| **i18n / translations** (`src/components/i18n/translations.jsx`) | `npm run validate:pr` — confirm all 7 language keys present |
| **CI / package scripts** (`.github/workflows/`, `package.json`) | `npm run validate:pr` |
| **Knowledge pipeline changes** (retrieval/indexing logic) | `npm run validate:pr` + `npm run test:knowledge` + `npm run test:regression` |
| **Backend functions** (`functions/`) | `npm run validate:pr` + unit tests for changed logic + **human review required** |
| **Agent wiring / entity schema** | **Explicit human approval required** — do not proceed without it |
| **Safety-critical files** (`postLlmSafetyFilter.ts`, `sanitizeAgentOutput.ts`, `sanitizeConversation.ts`) | **Explicit human approval required** — do not proceed without it |

---

## 4. CI Workflows

### `webpack.yml` — Unit Test and Build Validation

Runs on every push and pull request to `main`, `master`, `develop`.

Steps:
1. Checkout code
2. Setup Node.js (matrix: 20.x, 22.x)
3. Install dependencies (`npm ci`)
4. **Lint** (`npm run lint`)
5. **Type check** (`npm run typecheck`)
6. Build (`npm run build`)
7. Start preview server
8. Run unit tests (`npm test`)

### `playwright.yml` — E2E and Smoke Test Validation

Runs on every push and pull request to `main`, `master`, `develop`.

Jobs:
- **smoke** — smoke tests against `smoke-production-critical` project (read-only, fast)
- **test** — full E2E suite across `web-desktop` and `mobile-390x844` projects

---

## 5. Knowledge Pipeline Validation

When changing anything related to retrieval, indexing, or the knowledge pipeline, run the targeted knowledge tests:

```bash
# Run all knowledge pipeline unit tests
npm run test:knowledge

# Run retrieval regression tests specifically
npm run test:regression
```

These filter vitest by file path fragment, matching files in `test/utils/` whose names contain `knowledgePipeline` (or `knowledgePipeline.retrievalRegression` for the regression script). They are a subset of `npm test` and can be run quickly for focused validation of knowledge-related changes.

---

## 6. Local vs. PR Validation Alignment

The following checks are identical whether run locally or in CI:

| Check | Local command | CI workflow | Required before merge |
|---|---|---|---|
| Lint | `npm run lint` | `webpack.yml` | ✅ Yes |
| Type check | `npm run typecheck` | `webpack.yml` | ✅ Yes |
| Unit tests | `npm test` | `webpack.yml` | ✅ Yes |
| Build | `npm run build` | `webpack.yml` | ✅ Yes |
| Smoke tests | `npm run test:e2e -- --project=smoke-production-critical` | `playwright.yml` | ✅ Yes |
| Full E2E | `npm run test:e2e` | `playwright.yml` | For UI/route changes |

---

## 7. Paths That Require Human Review Before Merge

The following paths **always** require explicit human review, regardless of which automated checks pass:

- `functions/postLlmSafetyFilter.ts`
- `functions/sanitizeAgentOutput.ts`
- `functions/sanitizeConversation.ts`
- `src/api/agentWiring.js`
- `src/api/activeAgentWiring.js`
- `src/api/entities/` (any file)
- `functions/backfillKnowledgeIndex.ts`
- Any change that expands retrieval scope or agent tool access

Automated CI passing is **not sufficient** for these paths. A human reviewer must sign off.

---

## 8. What to Check Before Opening a PR

```bash
# 1. Run full local validation
npm run validate:pr

# 2. For UI/component/route changes, also run E2E:
npm run test:e2e

# 3. For knowledge/retrieval changes, also run:
npm run test:knowledge
npm run test:regression

# 4. Confirm lint is clean with zero errors (not just warnings):
npm run lint
```

> See `docs/copilot-pr-workflow.md` for full PR authoring and review expectations.
> See `docs/copilot-safety-rules.md` for the complete safety rule set.
> See `.github/copilot-instructions.md` for repository-wide Copilot guidance.
