import { expect, type Page, test } from '@playwright/test';

declare global {
  interface Window {
    __printRelationE2e?: {
      getTopBackPair: () => {
        name: { fontSize: number; uv: { x: number; y: number } };
        testo: { uv: { x: number; y: number } };
        error: number;
      } | null;
      setNameFontSize: (fontSize: number) => boolean;
      setTestoFontSize: (fontSize: number) => boolean;
      previewNameFontSize: (fontSize: number) => boolean;
      previewTestoFontSize: (fontSize: number) => boolean;
    };
  }
}

const CONFIGURATOR_ROUTE = '/completo-gara-calcio/baggio_calcio';
const TOP_BACK_LABEL = 'Nome schiena superiore';
const RELATION_ERROR_MAX = 1e-4;

const waitForConfiguratorScene = async (page: Page) => {
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

  await page.waitForFunction(() => Boolean(window.__printRelationE2e), undefined, { timeout: 60_000 });
  await page.waitForTimeout(1_500);
};

const clickConfigurationStep = async (page: Page, label: string) => {
  const tab = page.getByRole('tab', { name: new RegExp(label, 'i') }).first();
  await expect(tab).toBeVisible({ timeout: 10_000 });
  await tab.click();
  await page.waitForTimeout(400);
};

const addPrintPosition = async (page: Page, label: string) => {
  await page.getByRole('button', { name: /Seleziona posizione/i }).click();

  const option = page.locator('[role="dialog"] button').filter({ hasText: label });
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
  await page.waitForTimeout(500);
};

const readTopBackPair = async (page: Page) =>
  page.evaluate(() => window.__printRelationE2e?.getTopBackPair() ?? null);

test.describe('print position relation', () => {
  test('keeps testo glued to top-center of nomo when nomo size changes', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    await clickConfigurationStep(page, 'Nome');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await clickConfigurationStep(page, 'Testo');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await expect.poll(async () => (await readTopBackPair(page))?.error ?? null, { timeout: 10_000 }).not.toBeNull();

    const before = await readTopBackPair(page);
    expect(before).not.toBeNull();
    expect(before!.error, 'testo should snap to nomo after add').toBeLessThan(RELATION_ERROR_MAX);

    const nextFontSize = Math.min(before!.name.fontSize + 80, 220);
    const resized = await page.evaluate((fontSize) => window.__printRelationE2e?.setNameFontSize(fontSize) ?? false, nextFontSize);
    expect(resized).toBe(true);

    await expect
      .poll(
        async () => {
          const pair = await readTopBackPair(page);
          if (!pair) return null;
          return { error: pair.error, fontSize: pair.name.fontSize, testoUvX: pair.testo.uv.x };
        },
        { timeout: 10_000 },
      )
      .toEqual(
        expect.objectContaining({
          fontSize: nextFontSize,
        }),
      );

    const after = await readTopBackPair(page);
    expect(after).not.toBeNull();
    expect(after!.name.fontSize).toBe(nextFontSize);
    expect(after!.error, 'testo should stay glued after nomo resize').toBeLessThan(RELATION_ERROR_MAX);
    expect(Math.abs(after!.testo.uv.x - before!.testo.uv.x), 'testo uv should move when nomo grows').toBeGreaterThan(1e-4);
  });

  test('keeps testo glued to nomo when testo own size changes', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    await clickConfigurationStep(page, 'Nome');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await clickConfigurationStep(page, 'Testo');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await expect.poll(async () => (await readTopBackPair(page))?.error ?? null, { timeout: 10_000 }).not.toBeNull();

    const before = await readTopBackPair(page);
    expect(before).not.toBeNull();
    expect(before!.error, 'testo should snap to nomo after add').toBeLessThan(RELATION_ERROR_MAX);

    const nextFontSize = Math.min(before!.testo.fontSize + 80, 220);
    const resized = await page.evaluate((fontSize) => window.__printRelationE2e?.setTestoFontSize(fontSize) ?? false, nextFontSize);
    expect(resized).toBe(true);

    await expect
      .poll(
        async () => {
          const pair = await readTopBackPair(page);
          if (!pair) return null;
          return { error: pair.error, fontSize: pair.testo.fontSize };
        },
        { timeout: 10_000 },
      )
      .toEqual(
        expect.objectContaining({
          fontSize: nextFontSize,
        }),
      );

    const after = await readTopBackPair(page);
    expect(after).not.toBeNull();
    expect(after!.testo.fontSize).toBe(nextFontSize);
    expect(after!.error, 'testo should stay glued to nomo after resizing itself').toBeLessThan(RELATION_ERROR_MAX);
  });

  test('keeps testo glued to nomo live while dragging, before commit', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    await clickConfigurationStep(page, 'Nome');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await clickConfigurationStep(page, 'Testo');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await expect.poll(async () => (await readTopBackPair(page))?.error ?? null, { timeout: 10_000 }).not.toBeNull();

    const before = await readTopBackPair(page);
    expect(before).not.toBeNull();
    expect(before!.error, 'testo should snap to nomo after add').toBeLessThan(RELATION_ERROR_MAX);

    const previewFontSize = Math.min(before!.name.fontSize + 80, 220);
    const previewed = await page.evaluate((fontSize) => window.__printRelationE2e?.previewNameFontSize(fontSize) ?? false, previewFontSize);
    expect(previewed).toBe(true);

    await expect
      .poll(
        async () => {
          const pair = await readTopBackPair(page);
          if (!pair) return null;
          return { error: pair.error, fontSize: pair.name.fontSize };
        },
        { timeout: 10_000 },
      )
      .toEqual(
        expect.objectContaining({
          fontSize: previewFontSize,
        }),
      );

    const duringDrag = await readTopBackPair(page);
    expect(duringDrag).not.toBeNull();
    expect(duringDrag!.error, 'testo should stay glued to nomo while nomo is still mid-drag (not committed)').toBeLessThan(RELATION_ERROR_MAX);
    expect(Math.abs(duringDrag!.testo.uv.x - before!.testo.uv.x), 'testo uv should move live during drag, before commit').toBeGreaterThan(1e-4);
  });

  test('keeps testo glued to nomo live while dragging testo own size, before commit', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    await clickConfigurationStep(page, 'Nome');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await clickConfigurationStep(page, 'Testo');
    await addPrintPosition(page, TOP_BACK_LABEL);

    await expect.poll(async () => (await readTopBackPair(page))?.error ?? null, { timeout: 10_000 }).not.toBeNull();

    const before = await readTopBackPair(page);
    expect(before).not.toBeNull();
    expect(before!.error, 'testo should snap to nomo after add').toBeLessThan(RELATION_ERROR_MAX);

    const previewFontSize = Math.min(before!.testo.fontSize + 80, 220);
    const previewed = await page.evaluate((fontSize) => window.__printRelationE2e?.previewTestoFontSize(fontSize) ?? false, previewFontSize);
    expect(previewed).toBe(true);

    await expect
      .poll(
        async () => {
          const pair = await readTopBackPair(page);
          if (!pair) return null;
          return { error: pair.error, fontSize: pair.testo.fontSize };
        },
        { timeout: 10_000 },
      )
      .toEqual(
        expect.objectContaining({
          fontSize: previewFontSize,
        }),
      );

    const duringDrag = await readTopBackPair(page);
    expect(duringDrag).not.toBeNull();
    expect(duringDrag!.error, 'testo should stay glued to nomo while testo itself is still mid-drag (not committed)').toBeLessThan(RELATION_ERROR_MAX);
  });
});
