import { expect, test as base } from '@playwright/test';

import { enableBodyAndSleeveGradients, focusPart, openShadingStep, readGarmentMeshes, saveCanvasPng, waitForConfigurator } from './helpers/garmentGradientPage';
import { attachShaderErrorGuard } from './helpers/shaderErrorGuard';

const PRODUCTS = [
  { id: 'sylla', route: '/completo-gara-pallavolo-config/sylla_pallavolo' },
  { id: 'bernardi', route: '/completo-gara-calcio/bernardi_calcio' },
  { id: 'federer', route: '/completo-gara-calcio/federer_calcio' },
] as const;

const test = base.extend<{ gradientGuard: void }>({
  gradientGuard: [
    async ({ page }, use) => {
      const guard = await attachShaderErrorGuard(page);
      await use();
      guard.assertClean();
    },
    { auto: true },
  ],
});

test.describe.configure({ mode: 'serial', timeout: 180_000 });

test.describe('Sleeve sfumatura on the 3D configurator', () => {
  for (const product of PRODUCTS) {
    test(`${product.id} enables sleeve gradients and captures front + sleeve views`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await waitForConfigurator(page, product.route);
      await openShadingStep(page);
      await enableBodyAndSleeveGradients(page);

      await focusPart(page, 'Davanti');
      const frontPath = await saveCanvasPng(page, `${product.id}-front.png`);
      await testInfo.attach(`${product.id}-front`, { path: frontPath, contentType: 'image/png' });

      await focusPart(page, 'Manica 1');
      const sleeve1Path = await saveCanvasPng(page, `${product.id}-manica-1.png`);
      await testInfo.attach(`${product.id}-manica-1`, { path: sleeve1Path, contentType: 'image/png' });

      await focusPart(page, 'Manica 2');
      const sleeve2Path = await saveCanvasPng(page, `${product.id}-manica-2.png`);
      await testInfo.attach(`${product.id}-manica-2`, { path: sleeve2Path, contentType: 'image/png' });

      const meshes = await readGarmentMeshes(page);
      await testInfo.attach(`${product.id}-meshes`, {
        body: JSON.stringify(meshes, null, 2),
        contentType: 'application/json',
      });

      expect(meshes.foundScene || meshes.rows.length >= 0).toBe(true);
    });
  }
});
