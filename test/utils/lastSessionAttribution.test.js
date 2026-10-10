import { describe, it, expect, vi } from 'vitest';
import { readCrossSessionContinuity, buildCrossSessionContinuityBlockWithDiagnostic } from '../../src/lib/crossSessionContinuity.js';
import { THERAPIST_MEMORY_TYPE, THERAPIST_MEMORY_VERSION, THERAPIST_MEMORY_VERSION_KEY } from '../../src/lib/therapistMemoryModel.js';

function record(id, summary, tasks = [], interventions = [], risk = []) {
  return { id, memory_type: THERAPIST_MEMORY_TYPE, content: JSON.stringify({
    [THERAPIST_MEMORY_VERSION_KEY]: THERAPIST_MEMORY_VERSION,
    session_id: id, session_date: '2026-10-10', session_summary: summary,
    core_patterns: [], triggers: [], automatic_thoughts: [], emotions: [],
    urges: [], actions: [], consequences: [], working_hypotheses: [],
    interventions_used: interventions, risk_flags: risk, safety_plan_notes: '',
    follow_up_tasks: tasks, goals_referenced: [], last_summarized_date: '2026-10-10T20:00:00Z',
  }) };
}
function entities(records) { return { CompanionMemory: { list: vi.fn(async () => records) } }; }
const cases = [
  ['en', 'Read one page on Tuesday', 'Walk five minutes'],
  ['he', 'לקרוא עמוד אחד ביום שלישי', 'ללכת חמש דקות'],
  ['es', 'Leer una página el martes', 'Caminar cinco minutos'],
  ['fr', 'Lire une page mardi', 'Marcher cinq minutes'],
  ['de', 'Am Dienstag eine Seite lesen', 'Fünf Minuten gehen'],
  ['it', 'Leggere una pagina martedì', 'Camminare cinque minuti'],
  ['pt', 'Ler uma página na terça-feira', 'Caminhar cinco minutos'],
];
describe('last-session source attribution', () => {
  it.each(cases)('%s keeps latest actions separate from older actions', async (_language, latest, older) => {
    const e = entities([
      record('reading', 'Latest session: difficulty beginning reading after work.', [latest], ['reading']),
      record('walking', 'Older session: difficulty beginning walking after work.', [older], ['walking'], ['historical-risk']),
    ]);
    const result = await readCrossSessionContinuity(e);
    expect(result.recentFollowUpTasks).toEqual([latest]);
    expect(result.recentInterventionsUsed).toEqual(['reading']);
    expect(result.openFollowUpTasks).toEqual([latest, older]);
    expect(result.riskFlags).toContain('historical-risk');
    const { block, diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(e);
    const latestLine = block.split('\n').find(line => line.startsWith('Most recent session follow-up tasks:'));
    expect(latestLine).toBe('Most recent session follow-up tasks: ' + latest);
    expect(latestLine).not.toContain(older);
    expect(block).not.toContain('historical-risk');
    expect(diagnostic.historical_risk_signal_count).toBe(1);
    expect(e.CompanionMemory.list).toHaveBeenCalledTimes(2);
  });
  it('does not borrow an old step when the latest session has none', async () => {
    const e = entities([
      record('latest', 'Latest session explored reading but no action was agreed.'),
      record('old', 'Older session planned walking.', ['Walk five minutes'], ['walking']),
    ]);
    const result = await readCrossSessionContinuity(e);
    expect(result.recentFollowUpTasks).toEqual([]);
    expect(result.recentInterventionsUsed).toEqual([]);
    expect(result.openFollowUpTasks).toEqual(['Walk five minutes']);
    const { block } = await buildCrossSessionContinuityBlockWithDiagnostic(e);
    expect(block).not.toContain('Most recent session follow-up tasks:');
    expect(block).not.toContain('Most recent session interventions:');
  });
  it('keeps failed reads empty rather than fabricating last-session details', async () => {
    const e = { CompanionMemory: { list: vi.fn().mockRejectedValue(new Error('unavailable')) } };
    const result = await buildCrossSessionContinuityBlockWithDiagnostic(e);
    expect(result.block).toBe('');
    expect(result.diagnostic.continuity_block_emitted).toBe(false);
    expect(result.diagnostic.continuity_fail_safe).toBe(true);
  });
});
