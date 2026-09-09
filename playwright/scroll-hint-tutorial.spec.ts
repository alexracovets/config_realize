import { expect, test } from '@playwright/test';

import { waitForConfigurator } from './helpers/garmentGradientPage';

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const HINT = 'Scorri per vedere tutte le opzioni di personalizzazione';
const ROUTE = '/completo-gara-calcio/bernardi_calcio';

test.use({ viewport: MOBILE_VIEWPORT, hasTouch: true });

test('scroll hint appears on mobile, dismisses, and stays dismissed after reload', async ({ page }) => {
  await waitForConfigurator(page, ROUTE);

  const hint = page.getByRole('dialog', { name: HINT });
  await expect(hint).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(HINT)).toBeVisible();

  await page.waitForTimeout(800);
  await page.screenshot({ path: 'playwright/test-results/scroll-hint-mobile.png' });

  await hint.click({ position: { x: 10, y: 10 } });
  await expect(hint).toBeHidden();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('configurator-canvas')).toBeVisible({ timeout: 90_000 });
  await page.waitForTimeout(3000);
  await expect(page.getByRole('dialog', { name: HINT })).toHaveCount(0);
});

test('scroll hint dismisses on a real drag gesture', async ({ page }) => {
  await waitForConfigurator(page, ROUTE);

  const hint = page.getByRole('dialog', { name: HINT });
  await expect(hint).toBeVisible({ timeout: 30_000 });

  await page.evaluate(() => {
    const viewports = Array.from(document.querySelectorAll<HTMLElement>('[data-overlayscrollbars-viewport]'));
    const panel = viewports.find((el) => el.scrollHeight > el.clientHeight + 1);
    panel?.dispatchEvent(new Event('touchmove', { bubbles: true }));
  });

  await expect(hint).toBeHidden();
});

test('touching the panel without dragging keeps the hint open', async ({ page }) => {
  await waitForConfigurator(page, ROUTE);

  const hint = page.getByRole('dialog', { name: HINT });
  await expect(hint).toBeVisible({ timeout: 30_000 });

  await page.evaluate(() => {
    const viewports = Array.from(document.querySelectorAll<HTMLElement>('[data-overlayscrollbars-viewport]'));
    const panel = viewports.find((el) => el.scrollHeight > el.clientHeight + 1);
    panel?.dispatchEvent(new Event('touchstart', { bubbles: true }));
  });

  await page.waitForTimeout(500);
  await expect(hint).toBeVisible();
});

test('preview animation alone does not dismiss the hint early', async ({ page }) => {
  await waitForConfigurator(page, ROUTE);

  const hint = page.getByRole('dialog', { name: HINT });
  await expect(hint).toBeVisible({ timeout: 30_000 });

  await page.waitForTimeout(2000);
  await expect(hint).toBeVisible();
});

test('scroll hint auto-hides after 3s and persists that it ran', async ({ page }) => {
  await waitForConfigurator(page, ROUTE);

  const hint = page.getByRole('dialog', { name: HINT });
  await expect(hint).toBeVisible({ timeout: 30_000 });

  await expect(hint).toBeHidden({ timeout: 10_000 });

  const stored = await page.evaluate(() => window.localStorage.getItem('realize:scroll-hint-seen'));
  expect(stored).toBe('1');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('configurator-canvas')).toBeVisible({ timeout: 90_000 });
  await page.waitForTimeout(3000);
  await expect(page.getByRole('dialog', { name: HINT })).toHaveCount(0);
});

test('scroll hint stays hidden on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await waitForConfigurator(page, ROUTE);
  await page.waitForTimeout(3000);

  await expect(page.getByRole('dialog', { name: HINT })).toHaveCount(0);
});
