import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AI_COACH_WIRING } from '../../src/api/agentWiring.js';
import {
  ACTIVE_AI_COACH_WIRING,
  APP_RUNTIME_AGENT_WIRINGS,
} from '../../src/api/activeAgentWiring.js';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readAgent = (name) => JSON.parse(read('base44/agents/' + name + '.jsonc'));

describe('agent architecture hardening', () => {
  it('uses dedicated ai_coach runtime wiring on the Coach screen', () => {
    expect(ACTIVE_AI_COACH_WIRING).toBe(AI_COACH_WIRING);
    expect(ACTIVE_AI_COACH_WIRING.name).toBe('ai_coach');
    expect(APP_RUNTIME_AGENT_WIRINGS.ai_coach).toBe(ACTIVE_AI_COACH_WIRING);
    expect(APP_RUNTIME_AGENT_WIRINGS).not.toHaveProperty('ai_companion');

    const wizard = read('src/components/coaching/CoachingSessionWizard.jsx');
    expect(wizard).toContain('agent_name: ACTIVE_AI_COACH_WIRING.name');
    expect(wizard).toContain('tool_configs: ACTIVE_AI_COACH_WIRING.tool_configs');
    expect(wizard).not.toContain('ACTIVE_AI_COMPANION_WIRING');

    const chat = read('src/components/coaching/CoachingChat.jsx');
    expect(chat).toContain('agentName="ai_coach"');
  });

  it('keeps coach context read-mostly and gates its only write', () => {
    const mutable = AI_COACH_WIRING.tool_configs.filter(
      (tool) => Array.isArray(tool.allowed_operations) && tool.allowed_operations.includes('update'),
    );
    expect(mutable).toEqual([
      expect.objectContaining({
        entity_name: 'CoachingSession',
        update_requires_user_confirmation: true,
      }),
    ]);

    for (const tool of AI_COACH_WIRING.tool_configs) {
      if (tool.entity_name !== 'CoachingSession') {
        expect(tool.read_only).toBe(true);
      }
    }
  });

  it('keeps the deployed ai_coach agent least-privilege and consent-led', () => {
    const coach = readAgent('ai_coach');
    const entityTools = coach.tool_configs.filter((tool) => tool.entity_name);
    const writes = entityTools.filter((tool) =>
      tool.allowed_operations.some((operation) => operation === 'create' || operation === 'update'),
    );

    expect(writes).toEqual([
      expect.objectContaining({
        entity_name: 'CoachingSession',
        allowed_operations: ['read', 'update'],
      }),
    ]);
    expect(coach.instructions).toContain('only after the user explicitly confirms');
    expect(coach.instructions).toContain('Do not force an exercise or homework item on every turn');

    const retrieval = coach.tool_configs.find(
      (tool) => tool.function_name === 'retrieveRelevantContent',
    );
    expect(retrieval.description).toMatch(/shared Mindful Path content library/i);
  });

  it('retains disabled and legacy agent names without live tools or placeholders', () => {
    const archivedNames = [
      'ai_companion',
      'cbt_therapist_lenient',
      'cbt_therapist_standard',
      'cbt_therapist_strict',
    ];

    for (const name of archivedNames) {
      const agent = readAgent(name);
      expect(agent.tool_configs).toEqual([]);
      expect(agent.instructions).toMatch(/ARCHIVED/);
      expect(agent.instructions).not.toContain('[All other instructions identical');
    }

    const chat = read('src/pages/Chat.jsx');
    for (const name of archivedNames.slice(1)) {
      expect(chat).toContain("'" + name + "'");
    }
    expect(chat).toContain('Fail-closed guard');
  });

  it('wires every therapist backend function with an operational description', () => {
    const therapist = readAgent('cbt_therapist');
    const functions = therapist.tool_configs.filter((tool) => tool.function_name);
    const names = functions.map((tool) => tool.function_name);

    expect(names).toContain('retrieveCurriculumUnit');
    expect(names).toContain('retrieveRelevantContent');
    expect(names).toContain('retrieveTrustedCBTContent');
    expect(names).toContain('retrieveTherapistMemory');
    expect(names).toContain('writeTherapistMemory');
    for (const tool of functions) {
      expect(tool.description?.trim().length).toBeGreaterThan(40);
    }
  });

  it('keeps the Coach crisis gate ahead of model delivery', () => {
    const chat = read('src/components/coaching/CoachingChat.jsx');
    const detector = chat.indexOf('detectCrisisWithReason(inputMessage)');
    const riskPanel = chat.indexOf('setShowRiskPanel(true)', detector);
    const delivery = chat.indexOf('base44.agents.addMessage', detector);

    expect(detector).toBeGreaterThan(-1);
    expect(riskPanel).toBeGreaterThan(detector);
    expect(delivery).toBeGreaterThan(riskPanel);
  });

  it('does not mount either legacy AI Companion component', () => {
    const sourceFiles = [
      'src/App.jsx',
      'src/Layout.jsx',
      'src/components/layout/AppContent.jsx',
      'src/components/layout/MobileHeader.jsx',
      'src/components/layout/Sidebar.jsx',
    ].map(read).join('\n');

    expect(sourceFiles).not.toMatch(/from ['"].*AiCompanion/);
    expect(sourceFiles).not.toMatch(/<AiCompanion\b/);
    expect(sourceFiles).not.toMatch(/<DraggableAiCompanion\b/);
  });
});
