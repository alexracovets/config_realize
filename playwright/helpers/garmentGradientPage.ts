import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { expect, type Page } from '@playwright/test';

import { snapshotCanvas } from './garmentLogoPage';

const SCREENSHOT_DIR = path.join(process.cwd(), 'playwright', 'test-results', 'sleeve-gradient');

const waitForConfigurator = async (page: Page, route: string) => {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 90_000 });
  await expect(page.getByTestId('configurator-canvas')).toBeVisible({ timeout: 90_000 });
};

const openShadingStep = async (page: Page) => {
  await page.locator('[data-slot="tabs-trigger"]', { hasText: 'Sfumatura' }).click();
  await expect(page.getByTestId('skeleton-step-accordion')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator('[data-slot="accordion-item"]').filter({ hasText: 'Davanti' })).toBeVisible();
};

const partAccordionItem = (page: Page, label: string) => page.locator('[data-slot="accordion-item"]').filter({ hasText: label }).first();

const enablePartGradient = async (page: Page, label: string) => {
  const item = partAccordionItem(page, label);
  const trigger = item.locator('[data-slot="accordion-trigger"]');
  await expect(trigger).toBeVisible();
  if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
    await trigger.click();
  }

  const toggle = item.locator('button[data-active]').first();
  await expect(toggle).toBeVisible();
  if ((await toggle.getAttribute('data-active')) !== 'true') {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute('data-active', 'true');
};

const focusPart = async (page: Page, label: string) => {
  const trigger = partAccordionItem(page, label).locator('[data-slot="accordion-trigger"]');
  await trigger.click();
  await page.waitForTimeout(600);
};

const enableBodyAndSleeveGradients = async (page: Page) => {
  const canvasBefore = await snapshotCanvas(page);
  for (const label of ['Davanti', 'Retro', 'Manica 1', 'Manica 2']) {
    await enablePartGradient(page, label);
  }
  await expect.poll(async () => snapshotCanvas(page), { timeout: 20_000 }).not.toBe(canvasBefore);
};

const saveCanvasPng = async (page: Page, fileName: string) => {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOT_DIR, fileName);
  const dataUrl = await snapshotCanvas(page);
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  writeFileSync(filePath, Buffer.from(base64, 'base64'));
  return filePath;
};

const readGarmentMeshes = async (page: Page) =>
  page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="configurator-canvas"]') as HTMLCanvasElement & {
      __r3f?: { root?: { getState?: () => { scene?: unknown } }; getState?: () => { scene?: unknown } };
    };
    const fiber = canvas?.__r3f;
    const scene = fiber?.getState?.()?.scene ?? fiber?.root?.getState?.()?.scene;
    type meshRowType = { name: string; dir: number[] | null; origin: number[] | null };
    const rows: meshRowType[] = [];
    const visit = (object: { name?: string; isMesh?: boolean; userData?: Record<string, unknown>; children?: unknown[]; material?: unknown }) => {
      if (object?.isMesh && object.userData?.configuratorGarment) {
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        for (const material of materials as { userData?: Record<string, { value?: { x: number; y: number; z: number } }> }[]) {
          const dir = material?.userData?.uGradientDirUniform?.value;
          const origin = material?.userData?.uGradientOriginUniform?.value;
          rows.push({
            name: String(object.name ?? ''),
            dir: dir ? [dir.x, dir.y, dir.z] : null,
            origin: origin ? [origin.x, origin.y, origin.z] : null,
          });
        }
      }
      for (const child of object?.children ?? []) visit(child as typeof object);
    };
    if (scene) visit(scene as Parameters<typeof visit>[0]);
    return { foundScene: Boolean(scene), rows };
  });

export { enableBodyAndSleeveGradients, enablePartGradient, focusPart, openShadingStep, readGarmentMeshes, saveCanvasPng, waitForConfigurator };
