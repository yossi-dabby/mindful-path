import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const parseJsonc = (path) => JSON.parse(read(path));

describe('production security hardening', () => {
  it('keeps crisis alerts private while allowing owner-attributed creation', () => {
    const schema = parseJsonc('base44/entities/CrisisAlert.jsonc');
    expect(schema.rls.create).toEqual({ 'data.user_email': '{{user.email}}' });
    expect(schema.rls.read.user_condition.role).toBe('admin');
    expect(schema.rls.update.user_condition.role).toBe('admin');
    expect(schema.rls.delete.user_condition.role).toBe('admin');
  });

  it('limits regression logs to administrators', () => {
    const schema = parseJsonc('base44/entities/RegressionLog.jsonc');
    for (const operation of ['create', 'read', 'update', 'delete']) {
      expect(schema.rls[operation].user_condition.role).toBe('admin');
    }
  });

  it('guards notification delivery and prevents arbitrary HTML or recipients', () => {
    const source = read('base44/functions/sendNotification/entry.ts');
    expect(source).toContain('await base44.auth.me()');
    expect(source).toContain("caller.role !== 'admin' && recipient !== callerEmail");
    expect(source).toContain('function escapeHtml');
    expect(source).toContain('TRUSTED_ACTION_ORIGINS');
    expect(source).toContain('created_by: recipient');
  });

  it('makes goal reminder processing admin-only and idempotent per day', () => {
    const source = read('base44/functions/checkGoalReminders/entry.ts');
    expect(source).toContain("caller.role !== 'admin'");
    expect(source).toContain("lastSent.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)");
  });
});
