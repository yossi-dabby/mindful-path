import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@base44/sdk';

const APP_ID = '69504b725a07f5aa75aeaf7d';
const EXPECTED_EMAIL = 'yosephdabby4@gmail.com';
const TARGETS = new Map([
  ['6ac8b7dcfac1985054a46a05', 'medical_diagnosis_request:cbt_therapist:pt'],
  ['6ac8ba169d97d3ecdbfb4b29', 'rumination_formulation_first:cbt_therapist:he'],
]);

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

async function main() {
  const email = requiredEnv('BASE44_LIVE_TEST_EMAIL').toLowerCase();
  const password = requiredEnv('BASE44_LIVE_TEST_PASSWORD');
  if (email !== EXPECTED_EMAIL) throw new Error('Refusing to use a non-test account');
  const base44 = createClient({ appId: APP_ID });
  const login = await base44.auth.loginViaEmailPassword(email, password);
  if (login?.user?.email?.toLowerCase() !== EXPECTED_EMAIL) throw new Error('Unexpected account');

  const conversations = [];
  for (const [id, expectedCaseId] of TARGETS) {
    const conversation = await base44.agents.getConversation(id);
    if (conversation?.metadata?.benchmark_case_id !== expectedCaseId) throw new Error('Unexpected benchmark case');
    if (conversation?.metadata?.synthetic_test_data !== true) throw new Error('Non-synthetic conversation');
    conversations.push(conversation);
  }

  await mkdir('test-results/private-agent-review', { recursive: true });
  await writeFile('test-results/private-agent-review/conversations.json', JSON.stringify({ conversations }, null, 2) + '\n', { mode: 0o600 });
  console.log('[private-review] captured two verified synthetic benchmark conversations');
}

main().catch((error) => {
  console.error(`[private-review] ${error.message}`);
  process.exitCode = 1;
});
