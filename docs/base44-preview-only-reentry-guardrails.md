# Base44 Preview-Only Re-entry Guardrails (Recovery Stage 4)

## Purpose

Prevent Base44/GitHub sync confusion by making edit authority explicit:

- **GitHub repository code is the only source of truth for code changes.**
- **Base44 is a preview/runtime surface only for this recovery stage.**

## Non-Negotiable Edit Flow

1. Make code changes in this repository only.
2. Open and merge a PR in GitHub.
3. Treat Base44 as runtime/preview verification only.
4. Do not treat Base44-side edits as authoritative code updates.

## Active Runtime Paths (Do Not Reinterpret)

### i18n runtime source

- Runtime i18n initialization: `src/components/i18n/i18nConfig.jsx`
- Canonical translation object: `src/components/i18n/translations.jsx`
- Runtime merge helper used by i18n init: `src/components/i18n/translationsBuilder.jsx`

### Therapist chat runtime source

- Active route key: `Chat` in `src/pages.config.js`
- Runtime page component: `src/pages/Chat.jsx`
- Route wiring: `src/App.jsx` maps `Pages.Chat` to `"/Chat"`
- Active message list path for therapist chat runtime: `src/components/chat/MessageList.jsx`

## Ambiguity Guardrail

If similarly named files or legacy-looking paths exist elsewhere, do not switch runtime ownership assumptions without explicit approval. Runtime ownership for this stage is defined by the paths listed above.

## Scope Guardrail for Stage 4

- No feature work
- No chat behavior changes
- No AI behavior changes
- No attachment-contract changes
- No unrelated cleanup/deletions

*Last updated: 2026-04-20*
