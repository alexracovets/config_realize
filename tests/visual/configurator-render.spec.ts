import { expect, test } from '@playwright/test';
import path from 'node:path';

const CONFIGURATOR_ROUTES = [
  { collectionHandle: 'completo-gara-calcio', slug: 'cruijff_calcio', label: 'cruijff-shorts' },
  { collectionHandle: 'completo-gara-calcio', slug: 'baggio_calcio', label: 'baggio' },
] as const;

const OUTPUT_DIR = path.join(process.cwd(), 'tests', 'visual', 'output');

const waitForConfiguratorScene = async (page: import('@playwright/test').Page) => {
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible({ timeout: 60_000 });

  await page.waitForFunction(
    () => {
      const initialLoader = document.querySelector('[aria-busy="true"]');
      if (!initialLoader) return true;
      return initialLoader.getAttribute('aria-hidden') === 'true';
    },
    undefined,
    { timeout: 60_000 },
  );

  await page.waitForTimeout(4_000);

  const canvasWidth = await canvas.evaluate((node) => (node as HTMLCanvasElement).width);
  expect(canvasWidth).toBeGreaterThan(0);
};

for (const route of CONFIGURATOR_ROUTES) {
  test(`renders 3D configurator: ${route.slug}`, async ({ page }) => {
    await page.goto(`/${route.collectionHandle}/${route.slug}`, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${route.label}-page.png`),
      fullPage: false,
    });

    await page
      .locator('canvas')
      .first()
      .screenshot({
        path: path.join(OUTPUT_DIR, `${route.label}-canvas.png`),
      });
  });
}
