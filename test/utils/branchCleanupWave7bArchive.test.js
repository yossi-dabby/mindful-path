import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  APPROVED_LIST_RELATIVE_PATH,
  ARCHIVE_TAG_PREFIX,
  AUDIT_SOURCE_RELATIVE_PATH,
  MAX_BRANCHES,
  REFERENCE_SEARCH_PATHS,
  buildArchiveTag,
  findReferences,
  openPrCount,
  parseAuditAbandonedWipBranches,
  validateApprovedBranches,
} from '../../scripts/branch-cleanup-wave-7b-archive.mjs';

const REPO_ROOT = resolve(import.meta.dirname, '../..');
const WORKFLOW_PATH = resolve(REPO_ROOT, '.github/workflows/branch-cleanup-wave-7b-archive.yml');
const APPROVED_LIST_PATH = resolve(REPO_ROOT, 'docs/branch-cleanup-wave-7b-approved-list.txt');
const AUDIT_PATH = resolve(REPO_ROOT, 'docs/remaining-branch-reduction-audit.md');
const ORIGINAL_GITHUB_TOKEN = process.env.GITHUB_TOKEN;

beforeEach(() => {
  process.env.GITHUB_TOKEN = ORIGINAL_GITHUB_TOKEN;
});

afterEach(() => {
  process.env.GITHUB_TOKEN = ORIGINAL_GITHUB_TOKEN;
});

describe('branch cleanup wave 7b reference scanning', () => {
  it('approved-list and audit-source references do not block', () => {
    const refs = findReferences('copilot/example-branch', {
      searchPaths: ['docs'],
      repoRoot: '/virtual/repo',
      pathExists: () => true,
      runCommand: () => `${APPROVED_LIST_RELATIVE_PATH}\n${AUDIT_SOURCE_RELATIVE_PATH}\n`,
    });

    expect(refs).toEqual([]);
  });

  it('other docs/workflow references block', () => {
    const refs = findReferences('copilot/example-branch', {
      searchPaths: ['docs', '.github/workflows'],
      repoRoot: '/virtual/repo',
      pathExists: () => true,
      runCommand: () =>
        `${APPROVED_LIST_RELATIVE_PATH}\n` +
        'docs/remaining-branch-reduction-audit.md\n' +
        '.github/workflows/branch-cleanup-wave-7b-archive.yml\n',
    });

    expect(refs).toEqual(['.github/workflows/branch-cleanup-wave-7b-archive.yml']);
  });

  it('still scans package and deployment config paths', () => {
    expect(REFERENCE_SEARCH_PATHS).toEqual(
      expect.arrayContaining(['package.json', 'railway.toml', 'vercel.json', 'netlify.toml'])
    );
  });
});

describe('branch cleanup wave 7b guardrails', () => {
  it('empty approved list is rejected', () => {
    expect(() => validateApprovedBranches([])).toThrow(/Approved list is empty/);
  });

  it('more than 50 branches is rejected', () => {
    const branches = Array.from({ length: MAX_BRANCHES + 1 }, (_, index) => `copilot/branch-${index}`);
    expect(() => validateApprovedBranches(branches)).toThrow(/exceeds the limit of 50/);
  });

  it('main and staging-fresh are blocked', () => {
    expect(() => validateApprovedBranches(['main'])).toThrow(/Protected branch "main"/);
    expect(() => validateApprovedBranches(['staging-fresh'])).toThrow(
      /Protected branch "staging-fresh"/
    );
  });

  it('archive tags follow the required prefix and include date + branch', () => {
    const tag = buildArchiveTag('copilot/example-branch', '20260610');
    expect(tag).toBe(`${ARCHIVE_TAG_PREFIX}/20260610/copilot/example-branch`);
  });

  it('parses abandoned WIP branches from audit section 2c', () => {
    const auditMap = parseAuditAbandonedWipBranches(readFileSync(AUDIT_PATH, 'utf8'));

    expect(auditMap.has('copilot/fix-chat-smoke-test-flakiness')).toBe(true);
    expect(auditMap.get('copilot/fix-chat-smoke-test-flakiness')?.ageDays).toBeGreaterThan(90);
    expect(auditMap.has('copilot/add-accessibility-tests-community-page')).toBe(false);
  });

  it('retries transient open-PR API failures and then succeeds', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => null },
        json: async () => [{ id: 1 }, { id: 2 }],
      });

    const count = await openPrCount('yossi-dabby', 'mindful-path', 'copilot/example-branch', {
      fetchFn,
      sleepFn: async () => {},
    });

    expect(count).toBe(2);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-retryable open-PR API failures', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => null },
    });

    await expect(
      openPrCount('yossi-dabby', 'mindful-path', 'copilot/example-branch', {
        fetchFn,
        sleepFn: async () => {},
      })
    ).rejects.toThrow(/404 Not Found/);

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

describe('branch cleanup wave 7b workflow', () => {
  it('workflow remains workflow_dispatch only', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');

    expect(workflow).toMatch(/^on:\s*\n\s+workflow_dispatch:/m);
    expect(workflow).not.toMatch(/^\s+push:/m);
    expect(workflow).not.toMatch(/^\s+pull_request:/m);
    expect(workflow).not.toMatch(/^\s+schedule:/m);
    expect(workflow).not.toMatch(/^\s+workflow_run:/m);
  });

  it('exact confirmation string is required', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');

    expect(workflow).toContain('CONFIRM_ARCHIVE_AND_DELETE_ABANDONED_WIP_WAVE_7B');
    expect(workflow).not.toContain('CONFIRM_ARCHIVE_AND_DELETE_ABANDONED_WIP_WAVE_7A');
  });

  it('configures git identity before creating archive tags', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');

    expect(workflow).toContain('Configure git identity for archive tags');
    expect(workflow).toContain('git config user.name "github-actions[bot]"');
    expect(workflow).toContain(
      'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"'
    );
  });
});

describe('branch cleanup wave 7b approved list', () => {
  function readBranches() {
    return readFileSync(APPROVED_LIST_PATH, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  }

  it('contains at least one branch and stays within the wave cap', () => {
    const branches = readBranches();

    expect(branches.length).toBeGreaterThan(0);
    expect(branches.length).toBeLessThanOrEqual(MAX_BRANCHES);
  });

  it('does not include protected branches', () => {
    expect(readBranches()).not.toContain('main');
    expect(readBranches()).not.toContain('staging-fresh');
  });

  it('does not include branches from wave 7a', () => {
    const wave7aBranches = [
      'copilot/fix-e2e-tests-playwright',
      'copilot/fix-playwright-e2e-tests-again',
      'copilot/improve-e2e-tests-robustness',
      'copilot/fix-404-errors-e2e-tests',
      'copilot/fix-e2e-job-404-errors',
      'copilot/fix-spa-fallback-routes',
      'copilot/fix-e2e-test-goalcoach',
      'copilot/fix-next-button-enable-issue',
      'copilot/add-console-error-logging',
      'copilot/add-debugging-step-to-ci',
      'copilot/add-debugging-step-to-workflow',
      'copilot/add-debugging-steps-to-playwright-workflow',
      'copilot/add-deep-diagnostics-chat-e2e',
      'copilot/add-deep-diagnostics-web-chat',
      'copilot/add-deep-diagnostics-web-chat-e2e',
      'copilot/fix-e2e-playwright-tests',
      'copilot/fix-playwright-ci-test-structure',
      'copilot/fix-playwright-e2e-tests-another-one',
      'copilot/fix-syntax-error-in-ui-tests',
      'copilot/fix-syntax-error-in-ui-tests-again',
      'copilot/move-tests-to-top-level-directory',
      'copilot/patch-chat-page-improvements',
      'copilot/patch-e2e-smoke-tests',
      'copilot/remove-invalid-code-block',
      'copilot/restore-missing-e2e-tests',
    ];

    const branches = readBranches();
    for (const wave7aBranch of wave7aBranches) {
      expect(branches).not.toContain(wave7aBranch);
    }
  });
});
