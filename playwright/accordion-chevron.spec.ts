import { expect, test } from '@playwright/test';

import { openShadingStep, waitForConfigurator } from './helpers/garmentGradientPage';
import { attachShaderErrorGuard } from './helpers/shaderErrorGuard';

test('accordion chevron toggles the shading part', async ({ page }) => {
  const guard = await attachShaderErrorGuard(page);
  await waitForConfigurator(page, '/completo-gara-calcio/bernardi_calcio');
  await openShadingStep(page);

  const item = page.locator('[data-slot="accordion-item"]').filter({ hasText: 'Manica 1' }).first();
  const trigger = item.locator('[data-slot="accordion-trigger"]');
  const chevron = trigger.locator('[data-slot="accordion-trigger-icon"]');

  await expect(chevron).toBeVisible();
  const expandedBefore = await trigger.getAttribute('aria-expanded');

  await chevron.click();
  await expect(trigger).not.toHaveAttribute('aria-expanded', expandedBefore ?? '');

  await chevron.click();
  await expect(trigger).toHaveAttribute('aria-expanded', expandedBefore ?? '');

  guard.assertClean();
});
