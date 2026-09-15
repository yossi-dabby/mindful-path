import { expect, test, type Page } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

async function setupFormsPage(page: Page, language: 'en' | 'he') {
  await page.addInitScript((selectedLanguage) => {
    localStorage.setItem('language', selectedLanguage);
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  }, language);
  await mockApi(page);
  await spaNavigate(page, '/TherapeuticForms');
}

test.describe('Forms Library under-revision runtime', () => {
  test('English page exposes maintenance state without downloadable forms', async ({ page }) => {
    await setupFormsPage(page, 'en');

    await expect(page.getByTestId('therapeutic-forms-page')).toBeVisible();
    await expect(page.getByTestId('forms-under-revision')).toContainText('Forms are being updated');
    await expect(page.getByTestId('collections-grid')).toHaveCount(0);
    await expect(page.locator('a[href$=".pdf" i]')).toHaveCount(0);
  });

  test('Hebrew page exposes localized RTL maintenance state without downloadable forms', async ({ page }) => {
    await setupFormsPage(page, 'he');

    const pageRoot = page.getByTestId('therapeutic-forms-page');
    await expect(pageRoot).toBeVisible();
    await expect(pageRoot).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('forms-under-revision')).toContainText('הטפסים נמצאים בתהליך עדכון');
    await expect(page.getByTestId('collections-grid')).toHaveCount(0);
    await expect(page.locator('a[href$=".pdf" i]')).toHaveCount(0);
  });
});
