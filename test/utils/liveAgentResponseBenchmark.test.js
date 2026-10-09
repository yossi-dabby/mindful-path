import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { AGENT_BENCHMARK_CATALOG } from '../../scripts/agent-benchmark-catalog.mjs';
import { buildBenchmarkCases } from '../../scripts/agent-benchmark-policy.mjs';

const runner = readFileSync(
  new URL('../../scripts/run-live-agent-response-benchmark.mjs', import.meta.url),
  'utf8',
);
const workflow = readFileSync(
  new URL('../../.github/workflows/live-agent-response-benchmark.yml', import.meta.url),
  'utf8',
);

describe('live agent response benchmark', () => {
  it('covers the 126 non-crisis live model cases across both agents and seven languages', () => {
    const cases = buildBenchmarkCases(AGENT_BENCHMARK_CATALOG)
      .filter(({ scenarioId }) => scenarioId !== 'crisis_explicit_self_harm');
    expect(cases).toHaveLength(126);
    expect(new Set(cases.map(({ agent }) => agent))).toEqual(
      new Set(['ai_coach', 'cbt_therapist']),
    );
    expect(new Set(cases.map(({ language }) => language))).toEqual(
      new Set(['de', 'en', 'es', 'fr', 'he', 'it', 'pt']),
    );
  });

  it('authenticates only the dedicated verified user and never logs credentials', () => {
    expect(runner).toContain("const EXPECTED_EMAIL = 'yosephdabby4@gmail.com'");
    expect(runner).toContain("requiredEnv('BASE44_LIVE_TEST_PASSWORD')");
    expect(runner).toContain('loginViaEmailPassword(email, password)');
    expect(runner).toContain('Authenticated as unexpected account');
    expect(runner).not.toMatch(/console\.log\([^\n]*(password|access_token)/i);
  });

  it('keeps raw responses out of retained evidence and requires human clinical sign-off', () => {
    const retainedResultsStart = runner.indexOf('const results = rawResults.map');
    const retainedResultsEnd = runner.indexOf('const summary = buildSummary', retainedResultsStart);
    const retainedResults = runner.slice(retainedResultsStart, retainedResultsEnd);

    expect(runner).toContain('responseSha256: item.responseSha256');
    expect(retainedResults).not.toContain('response: item.response');
    expect(runner).toContain('rawResponsesPublished: false');
    expect(runner).toContain('humanClinicalSignoffRequired: true');
    expect(runner).toContain('AI-assisted and preliminary');
  });

  it('is manually confirmed or isolated-branch triggered and uses encrypted secrets', () => {
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain("confirmation == 'RUN_126_LIVE_CASES'");
    expect(workflow).toContain("'codex/run-live-agent-response-benchmark-*'");
    expect(workflow).toContain('secrets.BASE44_LIVE_TEST_EMAIL');
    expect(workflow).toContain('secrets.BASE44_LIVE_TEST_PASSWORD');
    expect(workflow).toContain('timeout-minutes: 180');
    expect(workflow).toContain('retention-days: 14');
  });
});
