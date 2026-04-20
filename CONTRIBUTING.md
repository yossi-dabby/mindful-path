# Contributing to Mindful Path

> This is a production-sensitive CBT application serving real users.
> Please read this document fully before opening any pull request.

---

## Branch Policy — Staging First

**All rollout and preparation PRs must target `staging`, not `main`.**

| Branch | Role |
|---|---|
| `main` | Stable, Base44-connected production branch. Merges from `staging` only. |
| `staging` | Rollout-validation branch. All rollout/preparation PRs target here first. |

### Rules

1. **Target `staging`** for all rollout/preparation work.
2. **`main` is stable and Base44-connected.** Do not open rollout/preparation PRs directly against `main`.
3. **Merge to `main` only after staging validation passes** — CI green, human review complete, staging environment confirmed safe.
4. **If you opened a PR against `main` by mistake**, close it immediately and reopen it targeting `staging`.

---

## Safety Rules (Short Version)

- Do not modify `functions/postLlmSafetyFilter.ts`, `functions/sanitizeAgentOutput.ts`, or `functions/sanitizeConversation.ts` without explicit written approval.
- Do not modify `src/api/entities/` (entity schemas) without explicit written approval.
- Do not modify `src/api/agentWiring.js` or `src/api/activeAgentWiring.js` without explicit written approval.
- Do not expand retrieval scope or add private user entities to any shared pipeline.
- Do not commit secrets, credentials, or API keys.

For the full safety rule set, see `docs/copilot-safety-rules.md`.

---

## Before Opening a PR

1. Confirm your PR targets **`staging`** (not `main`).
2. Run `npm run lint` — zero errors required.
3. Run `npm test` — all tests must pass.
4. Run `npm run build` — build must succeed.
5. Fill out the PR template completely (`.github/pull_request_template.md`).

---

## Further Reading

- `docs/base44-preview-only-reentry-guardrails.md` — Recovery Stage 4 guardrails (GitHub source-of-truth + Base44 preview-only)
- `.github/copilot-instructions.md` — master Copilot instruction set
- `docs/copilot-pr-workflow.md` — full PR and review workflow (including branch policy)
- `docs/copilot-safety-rules.md` — safety rules quick reference
- `docs/ai-agent-access-policy.md` — agent entity access policy
