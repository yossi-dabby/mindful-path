# Stage 6 — Settings and shared UI verification

Base: `27773699e7840f71c5a74d0a25e98abf0380aaa8` (merged PR #1039).
Implementation branch: `fix/settings-stage6-ui`; target: `main`.

The changes address preference overwrites and rollback, appearance mode/palette
persistence, language-save feedback, account confirmation recovery, notification
focus and invalid dates, mobile menu focus, authentication form accessibility,
public-page translation and dark surfaces, admin gating/error recovery,
knowledge editor accessibility/import validation, training draft recovery, and
startup error copy, alert loading/partial-data recovery and clipboard errors. Settings no longer creates points/subscription records just
because a user views the page. Quick navigation stays in document flow so a
short viewport can expose Save.

The palette selection previously updated legacy RGB variables that the active
semantic theme did not consume. Five additional palettes now set accessible
primary/secondary tokens in both light and dark mode; the default palette keeps
its established tokens. Canonical legacy values are shared by selection and
initialization. The light/dark/system choice uses the existing next-themes
storage and does not introduce a new profile field.

Preference patches are serialized, merged with a fresh server profile, checked
against the expected user identity, and written through the existing SDK.
Unknown preference keys survive. A failed write does not block later writes;
local cache failures do not misreport a successful server write.

## Evidence and coverage

- 17 regular-user routes across widths 360, 390, 430, 768, 1024, 1280, 1440;
  English/Hebrew × light/dark (476 route observations).
- Authorized admin views at the same sizes (84 route observations), separate
  from the denied-route checks for regular users.
- CrisisAlerts and TestSetupGuide add 56 observations at the same sizes,
  with separate alert gate/filter/error and clipboard permission tests.
  In total, 19 route/state surfaces and 616 matrix observations are covered.
- Focused behavior tests, seven-language copy checks and synthetic success,
  empty/loading/failure/retry paths. See `qa/stage6/README.md` for commands.
- 180 unique browser cases pass, including 25 existing Settings/sidebar cases
  and two Stage 5 nested-menu regressions. Supplementary reruns replace earlier
  results rather than increasing the unique-case count.
- Unit suite: 11,056 passed, 267 pre-existing skips. Lint, typecheck and build pass.
- The HTML audit, coverage JSON and synthetic screenshot archive are delivered
  separately. Raw layout diagnostics are observations, not automatic passes;
  deliberate truncation, offscreen horizontal quick-navigation items and the
  OTP library's transparent password-manager input are recorded separately.

## Scope boundaries and release checks

No backend functions, entity schemas, agent instructions/wiring, retrieval
algorithms/scope, safety filters or clinical scenario data changed.
Therapeutic Forms remains `under_revision`. Existing technical identifiers,
schema enums and source clinical content keep their language; new UI messages
have EN/HE/ES/FR/DE/IT/PT translations. Public deletion translations retain the
existing retention and ownership-verification instructions.

The live About/Privacy visit was read-only. All mutations, export bytes,
account deletion, OTP/password requests, knowledge records, diagnostics and
training responses in automated tests use isolated synthetic fixtures.

Physical iOS/Android keyboards, native rotation/touch, screen readers, actual
OAuth/email delivery, production persistence/account deletion and live AI
quality remain separate release checks. Browser viewport/touch emulation does
not certify those behaviors. CI status must be assessed on the PR head.
