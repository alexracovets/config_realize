import { expect, test } from '@playwright/test';

const CONFIGURATOR_ROUTE = '/completo-gara-calcio/baggio_calcio';

const PARTS = [
  { label: 'Retro', partId: 'baggio_calcio_back' },
  { label: 'Davanti', partId: 'baggio_calcio_front' },
  { label: 'Manica 1', partId: 'baggio_calcio_sleeve_left' },
  { label: 'Manica 2', partId: 'baggio_calcio_sleeve_right' },
  { label: 'Collo', partId: 'baggio_calcio_collar' },
] as const;

const MIN_ORBIT_DELTA = 0.12;
const SETTLE_TIMEOUT_MS = 1_500;

interface orbitStateType {
  azimuth: number;
  polar: number;
  radius: number;
  requestId: number;
  targetPartId: string | null;
  isAnimating: boolean;
}

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

  await page.waitForFunction(() => Boolean(window.__configuratorCameraDebug?.getOrbitState()), undefined, {
    timeout: 60_000,
  });

  await page.waitForTimeout(2_000);
};

const readOrbitState = async (page: import('@playwright/test').Page): Promise<orbitStateType> => {
  const state = await page.evaluate(() => window.__configuratorCameraDebug?.getOrbitState() ?? null);
  expect(state).not.toBeNull();
  return state as orbitStateType;
};

const orbitAngularDelta = (from: orbitStateType, to: orbitStateType) => {
  let deltaAzimuth = Math.abs(to.azimuth - from.azimuth);
  if (deltaAzimuth > Math.PI) deltaAzimuth = 2 * Math.PI - deltaAzimuth;
  const deltaPolar = Math.abs(to.polar - from.polar);
  return Math.hypot(deltaAzimuth, deltaPolar);
};

const clickPartAccordion = async (page: import('@playwright/test').Page, label: string) => {
  const trigger = page.getByRole('button', { name: new RegExp(label, 'i') }).first();
  await expect(trigger).toBeVisible({ timeout: 10_000 });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
};

const SHADING_PARTS = PARTS.filter((part) => part.partId !== 'baggio_calcio_collar');

const clickConfigurationStep = async (page: import('@playwright/test').Page, label: string) => {
  const tab = page.getByRole('tab', { name: new RegExp(label, 'i') }).first();
  await expect(tab).toBeVisible({ timeout: 10_000 });
  await tab.click();
  await page.waitForTimeout(400);
};

const clickPartAccordionContent = async (page: import('@playwright/test').Page, label: string) => {
  const item = page.locator('[data-slot="accordion-item"]').filter({ hasText: new RegExp(label, 'i') });
  const paletteButton = item.locator('[data-slot="accordion-content"] button[style*="background"]').first();
  await expect(paletteButton).toBeVisible({ timeout: 10_000 });
  await paletteButton.scrollIntoViewIfNeeded();
  await paletteButton.click();
};

test.describe('part accordion camera focus', () => {
  test('does not rotate orbit camera for any garment part in COLORE', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    let previousState = await readOrbitState(page);

    for (const part of PARTS) {
      const stateBeforeClick = previousState;
      await clickPartAccordion(page, part.label);
      await page.waitForTimeout(SETTLE_TIMEOUT_MS);

      const nextState = await readOrbitState(page);
      const delta = orbitAngularDelta(stateBeforeClick, nextState);

      expect(delta, `camera should not rotate when opening ${part.label} in COLORE`).toBeLessThan(MIN_ORBIT_DELTA);

      previousState = nextState;
    }
  });

  test('does not rotate orbit camera for any garment part in SFUMATURA', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);
    await clickConfigurationStep(page, 'Sfumatura');

    let previousState = await readOrbitState(page);

    for (const part of SHADING_PARTS) {
      const stateBeforeClick = previousState;
      await clickPartAccordion(page, part.label);
      await page.waitForTimeout(SETTLE_TIMEOUT_MS);

      const nextState = await readOrbitState(page);
      const delta = orbitAngularDelta(stateBeforeClick, nextState);

      expect(delta, `camera should not rotate when opening ${part.label} in SFUMATURA`).toBeLessThan(MIN_ORBIT_DELTA);

      previousState = nextState;
    }
  });

  test('does not rotate camera when clicking accordion content in COLORE', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    await clickPartAccordion(page, 'Manica 2');
    await page.waitForTimeout(SETTLE_TIMEOUT_MS);

    const afterManicaOpen = await readOrbitState(page);
    await clickPartAccordion(page, 'Retro');
    await page.waitForTimeout(SETTLE_TIMEOUT_MS);

    const beforeContentClick = await readOrbitState(page);
    expect(orbitAngularDelta(afterManicaOpen, beforeContentClick)).toBeLessThan(MIN_ORBIT_DELTA);

    await clickPartAccordionContent(page, 'Manica 2');
    await page.waitForTimeout(SETTLE_TIMEOUT_MS);

    const afterContentClick = await readOrbitState(page);
    expect(orbitAngularDelta(beforeContentClick, afterContentClick)).toBeLessThan(MIN_ORBIT_DELTA);
  });

  test('does not rotate camera when switching configuration steps', async ({ page }) => {
    await page.goto(CONFIGURATOR_ROUTE, { waitUntil: 'networkidle' });
    await waitForConfiguratorScene(page);

    const beforeStepSwitch = await readOrbitState(page);

    await clickConfigurationStep(page, 'Design');
    await page.waitForTimeout(800);

    const afterStepSwitch = await readOrbitState(page);
    const delta = orbitAngularDelta(beforeStepSwitch, afterStepSwitch);

    expect(delta, 'step switch should not move orbit camera').toBeLessThan(0.02);
  });
});
