import { test, expect, type Page } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

async function setupSpanishForms(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'es');
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });
  await mockApi(page);
}

test.describe('Forms Library — Spanish pilot', () => {
  test('shows the five translated stage-1 worksheets without English fallback', async ({ page }) => {
    await setupSpanishForms(page);
    await spaNavigate(page, '/TherapeuticForms');

    await expect(page.getByTestId('collections-grid')).toBeVisible();
    await page.getByTestId('audience-filter-adolescents').click();

    const collection = page.getByTestId('collection-card-adolescents-cbt-core-es');
    await expect(collection).toBeVisible();
    await expect(collection).toContainText('CBT central para adolescentes');
    await expect(collection).toContainText('Explorar');
    await collection.getByRole('button', { name: 'Explorar' }).click();

    await expect(page.getByTestId('modules-grid')).toBeVisible();
    const module = page.locator('[data-testid^="module-card-"]').first();
    await expect(module).toContainText('Etapa 1');
    await expect(module).toContainText('Comprender lo que está ocurriendo');
    await expect(module).toContainText('Ver formularios');
    await module.getByRole('button', { name: 'Ver formularios' }).click();

    await expect(page.getByTestId('worksheets-grid')).toBeVisible();
    const cards = page.locator('[data-testid^="worksheet-card-"]');
    await expect(cards).toHaveCount(5);
    await expect(page.locator('body')).toContainText('Mi cuerpo me da señales');
    await expect(page.locator('body')).toContainText('Pensamiento, emoción y acción');
    await expect(page.locator('body')).not.toContainText('What Is Going On for Me Right Now?');

    for (let index = 0; index < 5; index += 1) {
      const card = cards.nth(index);
      await expect(card.getByTestId('forms-file-open')).toBeVisible();
      await expect(card.getByTestId('forms-file-download')).toBeVisible();
    }
  });
});
