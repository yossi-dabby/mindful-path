import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

for (const agentName of ['ai_companion', 'cbt_therapist_lenient', 'cbt_therapist_standard', 'cbt_therapist_strict']) {
  test(`archived ${agentName} conversation remains readable without starting an agent`, async ({ page }) => {
    await mockApi(page);
    const id = `archive-fixture-${agentName}`;
    const fixture = {
      id, agent_name: agentName,
      metadata: { name: 'Synthetic historical session', archived: true },
      messages: [
        { id: 'historical-user', role: 'user', content: 'A synthetic historical question.' },
        { id: 'historical-assistant', role: 'assistant', content: 'A synthetic historical reply.' },
      ],
    };
    let reads = 0;
    const mutations: string[] = [];
    await page.route('**/api/**/agents/conversations/**', async route => {
      const request = route.request();
      if (request.method() !== 'GET') mutations.push(request.method());
      if (new URL(request.url()).pathname.endsWith('/' + id)) {
        reads += 1;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) });
      } else {
        await route.fallback();
      }
    });
    await spaNavigate(page, '/');
    const actual = await page.evaluate(async conversationId => {
      // @ts-expect-error Vite resolves this absolute source module at runtime.
      const { base44 } = await import('/src/api/base44Client.js');
      return base44.agents.getConversation(conversationId);
    }, id);
    expect(actual).toEqual(fixture);
    expect(reads).toBe(1);
    expect(mutations).toEqual([]);
  });
}
