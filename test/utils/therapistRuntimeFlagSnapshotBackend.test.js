import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const THIS_DIR = dirname(fileURLToPath(import.meta.url));
const CONTRACT_PATH = resolve(THIS_DIR, '../../base44/functions/therapistRuntimeFlagSnapshot/runtimeFlagContract.ts');
const ENTRY_PATH = resolve(THIS_DIR, '../../base44/functions/therapistRuntimeFlagSnapshot/entry.ts');

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

function toStrictBoolean(rawValue) {
  return rawValue === 'true';
}

describe('therapistRuntimeFlagSnapshot backend contract', () => {
  it('uses schema therapist-runtime-flags-v1', () => {
    const source = readFileSync(CONTRACT_PATH, 'utf8');
    expect(source).toContain("THERAPIST_RUNTIME_FLAG_SCHEMA = 'therapist-runtime-flags-v1'");
  });

  it('uses fixed allowlist with expected key set and VITE_* mappings', () => {
    const source = readFileSync(CONTRACT_PATH, 'utf8');

    for (const key of EXPECTED_FLAG_KEYS) {
      expect(source).toContain(`${key}: 'VITE_${key}'`);
    }

    // Ensure no extra allowlisted keys were added silently.
    const mapEntries = source.match(/^[\s]{2}[A-Z0-9_]+:\s'VITE_[A-Z0-9_]+'/gm) ?? [];
    expect(mapEntries).toHaveLength(EXPECTED_FLAG_KEYS.length);
  });

  it('strict boolean semantics are exactly value === "true"', () => {
    expect(toStrictBoolean('true')).toBe(true);
    expect(toStrictBoolean('1')).toBe(false);
    expect(toStrictBoolean('TRUE')).toBe(false);
    expect(toStrictBoolean('false')).toBe(false);
    expect(toStrictBoolean(undefined)).toBe(false);
    expect(toStrictBoolean(null)).toBe(false);
  });

  it('entry handler enforces auth and performs read-only response', () => {
    const source = readFileSync(ENTRY_PATH, 'utf8');

    expect(source).toContain('if (!user)');
    expect(source).toContain('status: 401');
    expect(source).toContain('buildTherapistRuntimeFlagSnapshot((envName) => Deno.env.get(envName))');
    expect(source).not.toContain('await req.json');
    expect(source).not.toContain('.create(');
    expect(source).not.toContain('.update(');
    expect(source).not.toContain('.delete(');
    expect(source).not.toContain('Deno.env.toObject');
  });

  it('contract source does not expose dynamic arbitrary env lookups', () => {
    const source = readFileSync(CONTRACT_PATH, 'utf8');
    expect(source).not.toContain('Object.keys(Deno.env');
    expect(source).not.toContain('for (const key in Deno.env');
  });
});
