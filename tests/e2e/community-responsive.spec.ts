import { test, expect } from '@playwright/test';
import { mockApi, setupHebrewMode, spaNavigate } from '../helpers/ui';

async function assertNoHorizontalOverflow(page: any) {
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport + 1);
}

test.describe('Community responsive and localized experience', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('fits forum, groups and progress at tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await spaNavigate(page, '/Community');
    await expect(page.getByTestId('community-page')).toBeVisible({ timeout: 15000 });
    await assertNoHorizontalOverflow(page);

    for (const tabName of [/groups/i, /progress/i, /forum/i]) {
      await page.getByRole('tab', { name: tabName }).click();
      await assertNoHorizontalOverflow(page);
    }
  });

  test('renders the Community post flow in Hebrew and closes with Escape', async ({ page }) => {
    await setupHebrewMode(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await spaNavigate(page, '/Community');

    const community = page.getByTestId('community-page');
    await expect(community).toBeVisible({ timeout: 15000 });
    await expect(community).toHaveAttribute('dir', /rtl/).catch(async () => {
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    });

    const create = page.getByRole('button', { name: /פוסט/ }).first();
    await expect(create).toBeVisible();
    await create.click();
    const dialog = page.getByTestId('forum-post-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('יצירת פוסט', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('does not expose moderation to a regular user', async ({ page }) => {
    await page.route('**/entities/ForumPost**', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'community-test-post',
          title: 'A supportive post',
          content: 'A short community message.',
          category: 'general',
          author_display_name: 'Test User',
          upvotes: 0,
          comment_count: 0,
          created_date: new Date().toISOString()
        }])
      });
    });
    await spaNavigate(page, '/Community');
    await expect(page.getByTestId('forum-post-community-test-post')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /moderate/i })).toHaveCount(0);
  });
});
