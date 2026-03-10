# Copilot PR Workflow — Mindful Path CBT App

> **Workflow guidance for all contributors and Copilot-assisted PRs.**
> This document defines safe PR authoring, review, and merge expectations for this production-sensitive repository.
> See also: `.github/copilot-instructions.md`, `docs/copilot-safety-rules.md`.

---

## 1. PR Size and Scope

- **One logical change per PR.** Do not bundle unrelated changes.
- **One risk domain per PR.** Do not mix UI changes with backend function changes, or entity changes with documentation changes.
- **Small diffs are safer diffs.** If a PR is touching more than 5–6 files, pause and consider splitting it.
- **Do not reformat unrelated code** in the same PR. Formatting changes obscure the real diff and make review harder.
- **Do not include build artifacts, generated files, or dependency folders** (`node_modules/`, `dist/`) in the commit.

---

## 2. Required Validation Before Merge

Every PR must pass the following checks before it is eligible for merge:

| Check | Command | Requirement |
|---|---|---|
| Lint | `npm run lint` | Zero errors |
| Unit tests | `npm test` | All tests pass (44+ tests) |
| Build | `npm run build` | Succeeds without errors or warnings |
| Type check | `npm run typecheck` | No type errors |
| E2E tests | `npm run test:e2e` | All tests pass (requires running app) |

For any change to `functions/`:
- Describe the expected behavior change clearly in the PR description.
- Propose or add corresponding unit or integration tests.
- Request a manual human review before merge.

---

## 3. When Tests Are Mandatory

| Change Type | Test Requirement |
|---|---|
| New utility function | Unit test required |
| Bug fix in frontend | Unit or E2E test required |
| New page or component | E2E test strongly recommended |
| Backend function change | Unit or integration test required; human review required |
| i18n key addition | Verify all 7 language keys present in translations.jsx |
| Agent wiring change | Requires explicit human approval before any test is written |
| Entity schema change | Requires explicit human approval; must not be attempted without it |
| Safety filter change | Requires explicit human approval; must not proceed without it |

---

## 4. When a Human Must Review Manually

The following situations **always** require a human reviewer (not just automated CI):

1. Any change to `functions/postLlmSafetyFilter.ts`
2. Any change to `functions/sanitizeAgentOutput.ts`
3. Any change to `functions/sanitizeConversation.ts`
4. Any change to `src/api/agentWiring.js` or `src/api/activeAgentWiring.js`
5. Any change to `src/api/entities/` (entity schema definitions)
6. Any change to `functions/backfillKnowledgeIndex.ts` or retrieval/indexing logic
7. Any change that expands agent tool access or retrieval scope
8. Any change that could affect private user entity access
9. Any PR that touches files in more than one high-scrutiny group (see Section 7)
10. Any PR that the author is uncertain about

---

## 5. Which Paths Require Extra Caution

See Section 7 for the full high-scrutiny path registry. In addition:

- **`src/components/layout/`** — scroll container, AppContent. Changes here can break iOS scroll on all pages.
- **`src/components/i18n/translations.jsx`** — all UI strings in 7 languages; a missing key in one language degrades UX.
- **`src/Layout.jsx`** — app shell; breaks are visible to all users.
- **`functions/checkProactiveNudges.ts`** — automated nudge logic; errors reach real users.
- **`functions/retentionCleanup.ts`** — deletes data; irreversible; must not be modified without approval.

---

## 6. Paths That Should Be Docs/Tests-Only Unless Explicitly Approved

| Path | Safe Actions Without Approval | Actions Requiring Explicit Approval |
|---|---|---|
| `functions/` | Add tests, add inline comments | Any logic change |
| `src/api/entities/` | Read/reference only | Any field, type, or schema change |
| `src/api/agentWiring.js` | Read/reference only | Any change |
| `src/api/activeAgentWiring.js` | Read/reference only | Any change |
| `functions/backfillKnowledgeIndex.ts` | Read/reference only | Any change |
| `functions/postLlmSafetyFilter.ts` | Read/reference only | Any change |
| `functions/sanitizeAgentOutput.ts` | Read/reference only | Any change |
| `functions/sanitizeConversation.ts` | Read/reference only | Any change |
| `src/components/layout/` | Read/reference only | Any change |
| `src/Layout.jsx` | Read/reference only | Any change |

---

## 7. High-Scrutiny Path Registry

### 🔴 SAFETY-CRITICAL — Never Change Without Explicit Human Approval

| Path / File | Why It Is High Scrutiny | What Must Be Validated | Copilot Rule |
|---|---|---|---|
| `functions/postLlmSafetyFilter.ts` | Filters LLM output for safety; weakening it harms vulnerable users | Manual logic review; confirm filter rules are not loosened | DO NOT change without explicit approval |
| `functions/sanitizeAgentOutput.ts` | Sanitizes agent responses; removing sanitization harms users | Manual logic review; no relaxation of sanitization rules | DO NOT change without explicit approval |
| `functions/sanitizeConversation.ts` | Sanitizes conversation content; removing sanitization harms users | Manual logic review; confirm sanitization rules preserved | DO NOT change without explicit approval |
| `src/api/agentWiring.js` | Wires CBT Therapist and Companion agents to data sources | Confirm no new entity access added; confirm no tool expansion | DO NOT change without explicit approval |
| `src/api/activeAgentWiring.js` | Active agent runtime wiring; changes alter live AI behavior | Same as agentWiring.js | DO NOT change without explicit approval |
| `src/api/entities/` | Base44 entity schemas; any schema change breaks the live runtime | Schema diff review; migration plan required | DO NOT change without explicit approval |

---

### 🔴 RETRIEVAL/INDEXING — Never Change Without Explicit Human Approval

| Path / File | Why It Is High Scrutiny | What Must Be Validated | Copilot Rule |
|---|---|---|---|
| `functions/backfillKnowledgeIndex.ts` | Populates the knowledge index; changes corrupt the knowledge base | Full regression of retrieval pipeline before merge | DO NOT change without explicit approval |
| Any retrieval or indexing function in `functions/` | Retrieval scope expansion risks exposing private user data | Confirm private entities are not added to retrieval pipeline | DO NOT change without explicit approval |

---

### 🔴 APP SHELL / LAYOUT — Never Change Without Explicit Human Approval

| Path / File | Why It Is High Scrutiny | What Must Be Validated | Copilot Rule |
|---|---|---|---|
| `src/Layout.jsx` | App shell visible to all users; scroll/viewport conventions are fragile | iOS scroll regression test; visual review | DO NOT change without explicit approval |
| `src/components/layout/AppContent.jsx` | Main scroll container (`#app-scroll-container`); must use `overflow-x-clip` not `overflow-x-hidden` | iOS/Android scroll regression | DO NOT change without explicit approval |
| `src/App.jsx` | Route definitions and auth flow; changes affect all pages | All E2E tests must pass | DO NOT change without explicit approval |

---

### 🟠 MEDIUM SCRUTINY — Backend Functions (Non-Safety-Critical)

| Path / File | Why It Is High Scrutiny | What Must Be Validated | Copilot Rule |
|---|---|---|---|
| `functions/checkProactiveNudges.ts` | Nudges reach real users; errors or misfires cause harm | Unit tests + logic review | Human review required; add tests |
| `functions/retentionCleanup.ts` | Deletes user data permanently; irreversible | Logic review; confirm scope of deletion unchanged | Human review required |
| Other files in `functions/` | Production backend; errors affect live users | Unit tests required; behavior documented in PR | Human review recommended |

---

### 🟠 MEDIUM SCRUTINY — UI / Navigation / i18n

| Path / File | Why It Is High Scrutiny | What Must Be Validated | Copilot Rule |
|---|---|---|---|
| `src/pages/` | Route-level pages; changes affect user flows | E2E test must pass; no broken routes | Explicit request required |
| `src/components/layout/` | Layout components shared by all pages | iOS scroll regression; visual review | Explicit request required |
| `src/components/i18n/translations.jsx` | All 7 language strings; missing key degrades UX | Confirm all 7 language sections updated | Always update all 7 languages |
| `src/Layout.jsx` | See above | See above | DO NOT change without explicit approval |

---

### 🟡 LOWER SCRUTINY — Safe to Change With Tests

| Path / File | Notes |
|---|---|
| `src/components/` (non-layout) | Bug fixes or new components by request; must follow scroll/viewport conventions |
| `src/utils/`, `src/lib/`, `src/hooks/` | Pure utilities; must have no side effects; unit tests required |
| `test/`, `tests/` | Additive tests only; must not remove or weaken existing tests |
| `docs/` | Additive documentation only; must not remove existing policy docs |
| `README.md` | Additive updates only |

---

## 8. Describing Assumptions in PR Descriptions

Every PR description should include:

1. **What changed**: A plain-English summary of what was modified and why.
2. **Assumptions made**: Any assumption about how a function, entity, or agent works that you could not directly verify.
3. **Safety impact**: A clear statement of whether this change could affect safety-critical paths, private entity access, or agent behavior — and why it does or does not.
4. **What was tested**: Which commands were run and whether they passed.
5. **What was NOT tested**: If any test category was skipped, explain why.
6. **Approval needed**: Whether this PR requires human review before merge, and why.

---

## 9. Documenting Safety Impact

When writing a PR description, include a **Safety Impact** section:

```markdown
## Safety Impact
- Does this change affect any safety-critical file? [Yes / No]
  - If yes: which file, and why the change is safe.
- Does this change expand retrieval scope? [Yes / No]
  - If yes: which entities are now accessible, and why this is approved.
- Does this change affect private user entity access? [Yes / No]
- Does this change alter agent tool access? [Yes / No]
- Does this change affect any UI, route, or navigation? [Yes / No]
```

If the answer to any question is **Yes**, a human reviewer must sign off before merge.

---

## 10. Code Review Expectations for Copilot-Assisted PRs

When reviewing a Copilot-assisted PR, the reviewer should check for:

| Risk | What to Look For |
|---|---|
| **Runtime safety** | Does the change affect execution paths in safety-critical functions? |
| **Retrieval scope expansion** | Does the change add any new entity to a retrieval or indexing pipeline? |
| **Private entity access** | Does the change read, write, or index ThoughtJournal, Conversation, CaseFormulation, MoodEntry, CompanionMemory, or UserDeletedConversations at a shared level? |
| **Accidental UI or route changes** | Does the change affect pages, routes, layout, or navigation? |
| **Secret exposure** | Does the change log, expose, or bundle any credential, token, or API key? |
| **Agent tool expansion** | Does the change add new tools to any AI agent? |
| **Therapist/coach boundary drift** | Does the change expand the CBT Therapist's emotional support role beyond clinical boundaries? |
| **Regression test coverage** | For backend function changes: is there a test that covers the changed logic? |
| **Overly large PR** | Is the PR touching more than one risk domain? Should it be split? |
| **Safety-critical file modification** | Is any file from the 🔴 HIGH SCRUTINY list modified? Does it have explicit approval? |

---

## 11. Quick Reference: Safe vs Requires Approval

| Action | Safe Without Approval | Requires Explicit Approval |
|---|---|---|
| Add pure utility function | ✅ | |
| Add unit test | ✅ | |
| Add Playwright E2E test | ✅ | |
| Add docs (additive) | ✅ | |
| Add i18n key (all 7 languages) | ✅ | |
| Fix UI bug (explicitly requested) | ✅ | |
| Add new page (explicitly requested) | ✅ | |
| Change layout or scroll container | | ✅ |
| Change backend function logic | | ✅ |
| Change entity schema | | ✅ |
| Change agent wiring | | ✅ |
| Change retrieval/indexing logic | | ✅ |
| Change safety-critical filter | | ✅ |
| Change automations | | ✅ |
| Change secrets / env | | ✅ |
| Change routes / navigation | | ✅ |

---

> For full Copilot guidance, see `.github/copilot-instructions.md`.
> For safety rules quick-reference, see `docs/copilot-safety-rules.md`.
> For architecture overview, see `docs/repository-architecture-map.md`.
