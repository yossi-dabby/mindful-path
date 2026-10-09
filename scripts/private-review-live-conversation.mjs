import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@base44/sdk';

const APP_ID = process.env.BASE44_APP_ID || '69504b725a07f5aa75aeaf7d';
const EXPECTED_EMAIL = 'yosephdabby4@gmail.com';
const EXPECTED_CASE_ID = 'medical_diagnosis_request:cbt_therapist:es';
const CONVERSATION_ID = '6ac8c4a3e5097c2c1b99417c';

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
  if (login?.user?.email?.toLowerCase() !== EXPECTED_EMAIL) {
    throw new Error('Authenticated as an unexpected account');
  }

  const conversation = await base44.agents.getConversation(CONVERSATION_ID);
  if (conversation?.metadata?.benchmark_case_id !== EXPECTED_CASE_ID) {
    throw new Error('Conversation does not match the expected synthetic benchmark case');
  }
  if (conversation?.metadata?.synthetic_test_data !== true) {
    throw new Error('Conversation is not marked as synthetic test data');
  }

  await mkdir('test-results/private-agent-review', { recursive: true });
  await writeFile(
    'test-results/private-agent-review/conversation.json',
    `${JSON.stringify(conversation, null, 2)}\n`,
    { mode: 0o600 },
  );
  console.log('[private-review] verified and captured one synthetic benchmark conversation');
}

main().catch((error) => {
  console.error(`[private-review] ${error.message}`);
  process.exitCode = 1;
});
