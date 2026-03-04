import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spaNavigate, mockApi } from '../helpers/ui';

test.describe('Community Page – Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('should have no critical or serious accessibility violations', async ({ page }) => {
    test.setTimeout(60000);

    await spaNavigate(page, '/Community');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Wait for the Community page heading to be visible so the page is fully rendered
    await expect(
      page.locator('h1').filter({ hasText: /community/i }).first()
    ).toBeVisible({ timeout: 15000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalOrSerious.length > 0) {
      const report = criticalOrSerious.map((v) => {
        const nodes = v.nodes
          .map((n) => `  • ${n.html}`)
          .join('\n');
        return `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n${nodes}`;
      });
      console.error(
        `\n❌ Accessibility violations found on the Community page:\n\n${report.join('\n\n')}`
      );
    }

    expect(
      criticalOrSerious,
      `Found ${criticalOrSerious.length} critical/serious accessibility violation(s). ` +
        `See console output for details.`
    ).toHaveLength(0);
  });
});
