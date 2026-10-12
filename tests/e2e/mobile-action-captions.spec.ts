import { test, expect } from '@playwright/test';
import { mockApi } from '../helpers/ui';

const labels = [
  ['en', 'More actions', 'Calendar'], ['he', 'עוד פעולות', 'יומן'],
  ['es', 'Más acciones', 'Calendario'], ['fr', 'Autres actions', 'Calendrier'],
  ['de', 'Weitere Aktionen', 'Kalender'], ['it', 'Altre azioni', 'Calendario'],
  ['pt', 'Mais ações', 'Calendário']
];
for (const [language, more] of labels) {
  test('mobile actions stay readable and operable: ' + language, async ({ page }) => {
    test.setTimeout(90000);
    await mockApi(page);
    await page.addInitScript((language) => {
      localStorage.setItem('language', language); localStorage.setItem('i18nextLng', language);
      localStorage.setItem('chat_consent_accepted', 'true'); localStorage.setItem('age_verified', 'true');
      (window as any).__TEST_APP_ID__ = 'test-app-id'; (window as any).__DISABLE_ANALYTICS__ = true;
    }, language);
    await page.setViewportSize({width:360,height:780});
    await page.goto('/Goals');
    const trigger = page.getByRole('button', {name:more, exact:true});
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveText(more);
    await trigger.click();
    const actions = page.getByRole('menuitem');
    await expect(actions).toHaveCount(3);
    for (const action of await actions.all()) {
      expect((await action.innerText()).trim()).not.toBe('');
      const box = await action.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await actions.first().click();
    await expect(page.getByRole('menu')).not.toBeVisible();
    const bounds = await page.evaluate(() => ({width:innerWidth, content:document.documentElement.scrollWidth}));
    expect(bounds.content).toBeLessThanOrEqual(bounds.width + 1);
    await page.setViewportSize({width:768,height:1024});
    await expect(trigger).not.toBeVisible();
  });
}
