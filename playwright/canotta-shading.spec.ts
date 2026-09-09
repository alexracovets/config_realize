import { expect, test } from '@playwright/test';

import { openShadingStep, waitForConfigurator } from './helpers/garmentGradientPage';
import { attachShaderErrorGuard } from './helpers/shaderErrorGuard';

test('canotta shading has no sleeve gradient controls', async ({ page }) => {
  const guard = await attachShaderErrorGuard(page);
  await waitForConfigurator(page, '/completo-gara-basket/canotta_magik_basket');
  await openShadingStep(page);

  await expect(page.locator('[data-slot="accordion-item"]').filter({ hasText: 'Davanti' })).toBeVisible();
  await expect(page.locator('[data-slot="accordion-item"]').filter({ hasText: 'Retro' })).toBeVisible();
  await expect(page.locator('[data-slot="accordion-item"]').filter({ hasText: 'Manica 1' })).toHaveCount(0);
  await expect(page.locator('[data-slot="accordion-item"]').filter({ hasText: 'Manica 2' })).toHaveCount(0);

  guard.assertClean();
});
