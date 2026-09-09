import { expect, test as base } from '@playwright/test';

import {
  bringUserLogoToFront,
  deleteFirstUserLogo,
  expectPackedStampAtlas,
  expectUniqueLogoPositions,
  openLogoStep,
  readLogoState,
  snapshotCanvas,
  uploadLogo,
  waitForLogoState,
} from './helpers/garmentLogoPage';
import { attachShaderErrorGuard } from './helpers/shaderErrorGuard';

const test = base.extend<{ logoConfigurator: void }>({
  logoConfigurator: [
    async ({ page }, use) => {
      const guard = await attachShaderErrorGuard(page);
      await openLogoStep(page);
      await use();
      guard.assertClean();
    },
    { auto: true },
  ],
});

test.describe.configure({ mode: 'serial', timeout: 180_000 });

test.describe('Garment logos on the 3D configurator', () => {
  test.describe('A — basic rendering', () => {
    test('A1 uploads one PNG and shows it on the model and in the list', async ({ page }) => {
      const { fileName, state } = await uploadLogo(page, 0);

      await expect(page.getByTestId('logo-list-item')).toHaveCount(1);
      await expect(page.getByTestId('logo-list-item')).toContainText(fileName);
      expect(state.logos).toHaveLength(1);
      expect(state.occupiedSlots).toBeGreaterThanOrEqual(1);
      await expect(page.getByTestId('configurator-canvas')).toBeVisible();
    });

    test('A2 uploads two logos so both stay visible and look different', async ({ page }) => {
      const first = await uploadLogo(page, 0);
      const second = await uploadLogo(page, 1);

      await expect(page.getByTestId('logo-list-item')).toHaveCount(2);
      await expect(page.getByTestId('logo-list-item').nth(0)).toContainText(first.fileName);
      await expect(page.getByTestId('logo-list-item').nth(1)).toContainText(second.fileName);

      const state = await readLogoState(page);
      expect(state.logos).toHaveLength(2);
      expect(state.occupiedSlots).toBeGreaterThanOrEqual(2);
      expectUniqueLogoPositions(state.logos);
      expect(second.state.occupiedSlots).toBeGreaterThanOrEqual(first.state.occupiedSlots);
    });

    test('A3 uploads four logos and still allows adding more', async ({ page }) => {
      for (let index = 0; index < 4; index += 1) {
        await uploadLogo(page, index);
      }

      await expect(page.getByTestId('logo-list-item')).toHaveCount(4);
      await expect(page.getByTestId('logo-upload-button')).toBeEnabled();

      const state = await readLogoState(page);
      expect(state.logos).toHaveLength(4);
      expect(state.canAdd).toBe(true);
      expect(state.occupiedSlots).toBeGreaterThanOrEqual(4);
    });
  });

  test.describe('B — slot capacity', () => {
    test('B1 uploads a fifth logo and keeps the 4x4 stamp atlas packed without crashing', async ({ page }) => {
      for (let index = 0; index < 5; index += 1) {
        await uploadLogo(page, index);
      }

      await expect(page.getByTestId('logo-list-item')).toHaveCount(5);
      await expect(page.getByTestId('configurator-canvas')).toBeVisible();

      const state = await readLogoState(page);
      expect(state.logos).toHaveLength(5);
      expect(state.occupiedSlots).toBeGreaterThanOrEqual(5);
      expectPackedStampAtlas(state.stampMeta, 4);
    });

    test('B2 uploads ten logos within the precompiled 16-slot atlas', async ({ page }) => {
      test.setTimeout(240_000);

      for (let index = 0; index < 10; index += 1) {
        await uploadLogo(page, index);
      }

      await expect(page.getByTestId('logo-list-item')).toHaveCount(10);
      await expect(page.getByTestId('configurator-canvas')).toBeVisible();
      await expect(page.getByTestId('logo-upload-button')).toBeEnabled();

      const state = await readLogoState(page);
      expect(state.logos).toHaveLength(10);
      expect(state.occupiedSlots).toBeGreaterThanOrEqual(10);
      expectPackedStampAtlas(state.stampMeta, 4);
    });
  });

  test.describe('C — delete and re-add', () => {
    test('C1 deletes the first of three logos then adds a new one on a free slot', async ({ page }) => {
      await uploadLogo(page, 0);
      await uploadLogo(page, 1);
      await uploadLogo(page, 2);

      const beforeDelete = await snapshotCanvas(page);
      await deleteFirstUserLogo(page);
      await expect(page.getByTestId('logo-list-item')).toHaveCount(2);

      const afterDelete = await readLogoState(page);
      expect(afterDelete.logos).toHaveLength(2);

      await uploadLogo(page, 3);
      await expect(page.getByTestId('logo-list-item')).toHaveCount(3);

      const afterAdd = await readLogoState(page);
      expect(afterAdd.logos).toHaveLength(3);
      expectUniqueLogoPositions(afterAdd.logos);
      await expect.poll(async () => snapshotCanvas(page)).not.toBe(beforeDelete);
    });

    test('C2 deletes every logo then uploads one again', async ({ page }) => {
      await uploadLogo(page, 0);
      await uploadLogo(page, 1);
      await expect(page.getByTestId('logo-list-item')).toHaveCount(2);

      await deleteFirstUserLogo(page);
      await deleteFirstUserLogo(page);

      await expect(page.getByTestId('logo-list-item')).toHaveCount(0);
      expect((await readLogoState(page)).logos).toHaveLength(0);

      await uploadLogo(page, 2);
      await expect(page.getByTestId('logo-list-item')).toHaveCount(1);
      expect((await readLogoState(page)).logos).toHaveLength(1);
      await expect(page.getByTestId('configurator-canvas')).toBeVisible();
    });
  });

  test.describe('D — selection must not rebuild or erase stamps', () => {
    test('D1 bringing a logo to front keeps every stamp cell occupied', async ({ page }) => {
      for (let index = 0; index < 5; index += 1) {
        await uploadLogo(page, index);
      }

      const before = await readLogoState(page);
      expect(before.occupiedSlots).toBeGreaterThanOrEqual(5);
      expectPackedStampAtlas(before.stampMeta, 4);

      const firstId = before.logos[0]?.id;
      expect(firstId).toBeTruthy();
      await bringUserLogoToFront(page, firstId!);

      const after = await waitForLogoState(page, (current) => current.logos.length === 5 && current.occupiedSlots >= 5 && current.stampMeta?.grid === 4);

      expect(after.occupiedSlots).toBeGreaterThanOrEqual(5);
      expectPackedStampAtlas(after.stampMeta, 4);
      expectUniqueLogoPositions(after.logos);
    });
  });
});
