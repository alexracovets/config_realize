import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, type Page } from '@playwright/test';

type garmentLogoStateType = {
  id: string;
  fileName: string;
  positionKey: string;
  uv: { x: number; y: number };
};

type garmentLogoStampMetaType = {
  grid: number;
  canvasWidth: number;
  canvasHeight: number;
  cellWidth: number;
  cellHeight: number;
};

declare global {
  interface Window {
    __garmentLogoE2e?: {
      getUserLogos: () => garmentLogoStateType[];
      canAddUserLogo: () => boolean;
      getOccupiedStampSlots: () => number;
      getStampMeta: () => garmentLogoStampMetaType | null;
      bringUserLogoToFront: (id: string) => void;
    };
  }
}

const CONFIGURATOR_PATH = process.env.PLAYWRIGHT_CONFIGURATOR_PATH ?? '/completo-gara-pallavolo-config/federer_pallavolo';
const BAGGIO_LOGO_PATH = path.resolve(process.cwd(), 'baggio_active.png');

const snapshotCanvas = async (page: Page) => page.getByTestId('configurator-canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL('image/png'));

const createBaggioLogoFile = (index: number) => ({
  name: `baggio-logo-${String(index + 1).padStart(2, '0')}.png`,
  mimeType: 'image/png' as const,
  buffer: readFileSync(BAGGIO_LOGO_PATH),
});

const readLogoState = async (page: Page) =>
  page.evaluate(() => {
    const api = window.__garmentLogoE2e;
    if (!api) {
      return { logos: [] as garmentLogoStateType[], canAdd: false, occupiedSlots: 0, stampMeta: null as garmentLogoStampMetaType | null };
    }
    return {
      logos: api.getUserLogos(),
      canAdd: api.canAddUserLogo(),
      occupiedSlots: api.getOccupiedStampSlots(),
      stampMeta: api.getStampMeta?.() ?? null,
    };
  });

const waitForLogoState = async (page: Page, assertion: (state: Awaited<ReturnType<typeof readLogoState>>) => boolean, timeout = 30_000) => {
  await expect.poll(async () => assertion(await readLogoState(page)), { timeout }).toBe(true);
  return readLogoState(page);
};

const openLogoStep = async (page: Page) => {
  await page.goto(CONFIGURATOR_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 90_000 });
  await expect(page.getByTestId('configurator-canvas')).toBeVisible({ timeout: 90_000 });
  await page.locator('[data-slot="tabs-trigger"]', { hasText: 'Logo' }).click();
  await expect(page.getByTestId('skeleton-step-logo')).toHaveCount(0);
  await expect(page.getByTestId('logo-file-input')).toBeAttached();
  await page.waitForFunction(() => Boolean(window.__garmentLogoE2e), undefined, { timeout: 30_000 });
};

const uploadLogo = async (page: Page, index: number) => {
  const file = createBaggioLogoFile(index);
  const canvasBefore = await snapshotCanvas(page);

  await page.getByTestId('logo-file-input').setInputFiles(file);
  await expect(page.getByTestId('logo-list-item').filter({ hasText: file.name })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('logo-upload-dropzone')).not.toHaveAttribute('aria-busy', 'true');

  const state = await waitForLogoState(
    page,
    (current) => current.logos.some((logo) => logo.fileName === file.name) && current.occupiedSlots >= current.logos.length,
  );

  await expect.poll(async () => snapshotCanvas(page), { timeout: 15_000 }).not.toBe(canvasBefore);

  return { fileName: file.name, canvasBefore, state };
};

const deleteFirstUserLogo = async (page: Page) => {
  const beforeCount = (await readLogoState(page)).logos.length;
  await page.getByRole('button', { name: 'Elimina logo' }).first().click();
  await waitForLogoState(page, (current) => current.logos.length === beforeCount - 1);
};

const bringUserLogoToFront = async (page: Page, id: string) => {
  await page.evaluate((logoId) => {
    window.__garmentLogoE2e?.bringUserLogoToFront(logoId);
  }, id);
};

const expectUniqueLogoPositions = (logos: garmentLogoStateType[]) => {
  const keys = logos.map((logo) => `${logo.positionKey}:${logo.uv.x.toFixed(4)}:${logo.uv.y.toFixed(4)}`);
  expect(new Set(keys).size, `overlapping logo positions: ${keys.join(', ')}`).toBe(logos.length);
};

const expectPackedStampAtlas = (meta: garmentLogoStampMetaType | null, expectedGrid: number) => {
  expect(meta, 'stamp atlas meta should be published after compose').not.toBeNull();
  expect(meta!.grid).toBe(expectedGrid);
  expect(meta!.cellWidth).toBeGreaterThan(1);
  expect(meta!.cellHeight).toBeGreaterThan(1);
  expect(meta!.canvasWidth).toBe(meta!.cellWidth * expectedGrid);
  expect(meta!.canvasHeight).toBe(meta!.cellHeight * expectedGrid);
};

export {
  bringUserLogoToFront,
  deleteFirstUserLogo,
  expectPackedStampAtlas,
  expectUniqueLogoPositions,
  openLogoStep,
  readLogoState,
  snapshotCanvas,
  uploadLogo,
  waitForLogoState,
};
export type { garmentLogoStampMetaType, garmentLogoStateType };
