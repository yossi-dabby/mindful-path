import { test } from '@playwright/test';

test('debug requests', async ({ page }) => {
  const requests: string[] = [];
  
  page.on('request', req => {
    requests.push(`${req.method()} ${req.resourceType()} ${req.url()}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[PAGE ERROR]', msg.text().substring(0, 200));
    }
  });
  
  await page.goto('http://127.0.0.1:5173/chat', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  
  console.log('\n=== MODULE REQUESTS ===');
  requests.filter(r => r.includes('script') || r.includes('.js') || r.includes('.jsx') || r.includes('.ts')).forEach(r => console.log(r));
});
