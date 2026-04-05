# CBT Therapist — Limited Release Protocol

## Status
**ACTIVE — Limited Release Phase**

Baseline: CP11 + CP12 patch (social anxiety / sleep anxiety ask-back suppression) + CP12-HE Hebrew semantic anti-worksheet rewrite (email-pressure, fear-of-disapproval, long-term distress compression).
All therapist logic is frozen at this baseline.

**Hold lifted: 2026-04-05.** CP12 Hebrew verification passed. Resuming live monitoring under standard Limited Release rules.

---

## Hard Rules

| Rule | Detail |
|------|--------|
| Freeze therapist logic | No broad implementation changes during this phase |
| No new layers | No new CP / C / L levels unless escalation criteria met |
| No curriculum expansion | No new CBTCurriculumUnit records during this phase |
| Log regressions only | Every observed regression goes into RegressionLog |
| Single bad answer | Monitor only — no fix |
| 2+ independent repetitions of same regression | One targeted micro-fix eligible (narrowest possible scope) |
| Internal leakage | Immediate hold + escalate — do not wait for repetition |

---

## Primary Monitoring Languages
- Hebrew
- English

## Secondary Monitoring Languages
- Spanish
- French
- German

---

## Active Watchpoints

### 1. Worry not action-first
- **Pattern:** Agent responds to worry/rumination with exploration, reflection, or question instead of a bounded action step.
- **Expected behavior:** Worry postponement window OR one concrete bounded action — no ask-back, no "tell me more".
- **Threshold:** 2 independent confirmed instances → micro-fix eligible.

### 2. Continuity contamination
- **Pattern:** Agent references a prior session's topic/domain when current message does not contain an explicit topic keyword (RULE ZERO violation).
- **Expected behavior:** Suppressed opener — no prior-topic mention whatsoever.
- **Threshold:** 2 independent confirmed instances → micro-fix eligible.

### 3. Product-level disappearing replies
- **Pattern:** Agent reply is sent but does not render in the chat UI, or arrives empty/truncated.
- **Note:** Track separately from CBT logic regressions. This is a platform/rendering issue, not a prompt issue.
- **Escalation:** Any confirmed instance → immediate platform-level investigation.

### 4. Hebrew worksheet drift (watchpoint only)
- **Pattern:** Hebrew response returns tracking homework, belief-rating, evidence loops, or multi-day logging as first move.
- **Expected behavior:** One same-day bounded directive step, no worksheet, no rating, no question ending.
- **Note:** CP12-HE semantic rewrite is now live. Remaining instances are monitoring data only.
- **Threshold:** 2 independent confirmed instances of the same sub-pattern → micro-fix eligible.

---

## Regression Logging

Use entity: `RegressionLog`

Required fields per entry:
- `date` — session date
- `language` — session language
- `scenario_type` — clinical scenario category
- `user_prompt` — exact user message that triggered the regression
- `model_reply` — exact agent reply that exhibited the regression
- `regression_category` — one of the defined categories
- `severity` — low / medium / high

Optional but recommended:
- `repeated_regression` — true if this is the 2nd+ independent confirmed instance
- `fix_triggered` — true if a micro-fix was applied as a result
- `notes` — reviewer context, mitigation, or resolution

---

## Severity Definitions

| Level | Meaning |
|-------|---------|
| low | Noticeable drift but recoverable within session |
| medium | Clear regression — directive direction lost |
| high | Safety failure, internal leakage, or major clinical failure |

---

## Decision Rules

| Observation | Action |
|-------------|--------|
| Single regression, severity low/medium | Log → monitor only |
| Single regression, severity high | Log → immediate hold + escalate |
| Internal leakage (any severity) | Immediate hold + escalate — no wait |
| 2+ independent confirmed instances, same category + scenario | Log `repeated_regression: true` → micro-fix eligible |
| Micro-fix applied | Log `fix_triggered: true` → re-run focused regression test on that prompt |

---

## Micro-Fix Rules

- Scope: one isolated code path only — the confirmed regression pattern.
- No collateral changes to unrelated CP/C/L rules.
- No broad re-tuning.
- Must pass focused regression test on the two triggering prompts before merge.
- Document the fix in the RegressionLog entry.

---

## Release Stages

| Stage | Criteria to advance |
|-------|---------------------|
| Limited Release (current) | Real sessions collected, no unresolved high-severity regressions, no internal leakage |
| Expanded Release | 50+ sessions, ≤2 medium regressions unfixed, zero high/leakage |
| General Availability | 200+ sessions, regression rate stable, all high-severity resolved |

---

## Notes

- Do not modify this protocol during Limited Release without explicit sign-off.
- All micro-fixes must be logged before deployment.
- Disappearing-reply incidents are tracked in a separate incident log, not in RegressionLog.