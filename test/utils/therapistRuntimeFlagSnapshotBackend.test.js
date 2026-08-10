import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  THERAPIST_RUNTIME_FLAG_SCHEMA,
  THERAPIST_RUNTIME_FLAG_ENV_MAP,
  toStrictBoolean,
  buildTherapistRuntimeFlagSnapshot,
} from '../../base44/functions/therapistRuntimeFlagSnapshot/runtimeFlagContract.ts';

const EXPECTED_FLAG_KEYS = [
  'THERAPIST_UPGRADE_ENABLED',
  'THERAPIST_UPGRADE_MEMORY_ENABLED',
  'THERAPIST_UPGRADE_SUMMARIZATION_ENABLED',
  'THERAPIST_UPGRADE_WORKFLOW_ENABLED',
  'THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED',
  'THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED',
  'THERAPIST_UPGRADE_SAFETY_MODE_ENABLED',
  'THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED',
  'THERAPIST_UPGRADE_FORMULATION_LED_ENABLED',
  'THERAPIST_UPGRADE_CONTINUITY_ENABLED',
  'THERAPIST_UPGRADE_STRATEGY_ENABLED',
  'THERAPIST_UPGRADE_LONGITUDINAL_ENABLED',
  'THERAPIST_UPGRADE_KNOWLEDGE_ENABLED',
  'THERAPIST_UPGRADE_COMPETENCE_ENABLED',
  'THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED',
  'CONTEXT_COMPOSER_V2_ENABLED',
  'CHAT_ORCHESTRATOR_V2_ENABLED',
];

describe('therapistRuntimeFlagSnapshot backend contract', () => {
  it('uses a fixed allowlist map with expected keys only', () => {
    expect(Object.keys(THERAPIST_RUNTIME_FLAG_ENV_MAP)).toEqual(EXPECTED_FLAG_KEYS);
    expect(Object.values(THERAPIST_RUNTIME_FLAG_ENV_MAP)).toHaveLength(EXPECTED_FLAG_KEYS.length);
    for (const envName of Object.values(THERAPIST_RUNTIME_FLAG_ENV_MAP)) {
      expect(envName.startsWith('VITE_')).toBe(true);
    }
  });

  it('schema is versioned and bounded', () => {
    expect(THERAPIST_RUNTIME_FLAG_SCHEMA).toBe('therapist-runtime-flags-v1');
  });

  it('strict boolean semantics are exactly value === "true"', () => {
    expect(toStrictBoolean('true')).toBe(true);
    expect(toStrictBoolean('1')).toBe(false);
    expect(toStrictBoolean('TRUE')).toBe(false);
    expect(toStrictBoolean('false')).toBe(false);
    expect(toStrictBoolean(undefined)).toBe(false);
    expect(toStrictBoolean(null)).toBe(false);
  });

  it('reads only allowlisted env names and returns booleans only', () => {
    const readEnv = vi.fn((envName) => {
      if (envName === 'VITE_THERAPIST_UPGRADE_ENABLED') return 'true';
      if (envName === 'VITE_THERAPIST_UPGRADE_MEMORY_ENABLED') return '1';
      return undefined;
    });

    const flags = buildTherapistRuntimeFlagSnapshot(readEnv);

    expect(Object.keys(flags)).toEqual(EXPECTED_FLAG_KEYS);
    expect(flags.THERAPIST_UPGRADE_ENABLED).toBe(true);
    expect(flags.THERAPIST_UPGRADE_MEMORY_ENABLED).toBe(false);
    for (const value of Object.values(flags)) {
      expect(typeof value).toBe('boolean');
    }

    expect(readEnv.mock.calls.map(([name]) => name)).toEqual(Object.values(THERAPIST_RUNTIME_FLAG_ENV_MAP));
  });

  it('entry handler enforces auth and never accepts client-controlled env names', () => {
    const entryPath = '/home/runner/work/mindful-path/mindful-path/base44/functions/therapistRuntimeFlagSnapshot/entry.ts';
    const source = readFileSync(entryPath, 'utf8');

    expect(source).toContain('if (!user)');
    expect(source).toContain("status: 401");
    expect(source).toContain('buildTherapistRuntimeFlagSnapshot((envName) => Deno.env.get(envName))');
    expect(source).not.toContain('await req.json');
    expect(source).not.toContain('Object.keys(Deno.env');
    expect(source).not.toContain('Deno.env.toObject');
  });
});
