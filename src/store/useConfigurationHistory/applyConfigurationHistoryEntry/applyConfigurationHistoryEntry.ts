'use client';

import { useConfigurationCart } from '@store/useConfigurationCart';
import { applyGarmentConfiguration } from '@store/useConfigurationCart/cartItemConfiguration';
import { useConfigurationControl } from '@store/useConfigurationControl';
import { configurationHistoryRestoreGuard } from '@store/useConfigurationHistory/configurationHistoryRestoreGuard';
import { useConfigurationHistory } from '@store/useConfigurationHistory/useConfigurationHistory';
import type { configurationHistoryEntryType } from '@store/useConfigurationHistory/useConfigurationHistory';
import { useConfiguratorProduct } from '@store/useConfiguratorProduct';

const applyConfigurationHistoryEntry = (entry: configurationHistoryEntryType) => {
  const { product } = useConfiguratorProduct.getState();
  if (!product) return;

  configurationHistoryRestoreGuard.run(() => {
    applyGarmentConfiguration(product, entry.configuration);
  });

  const { activeItemId, saveConfiguration } = useConfigurationCart.getState();
  if (activeItemId) saveConfiguration(activeItemId, entry.configuration);

  useConfigurationControl.getState().setActiveStep(entry.activeStep);
};

const travelConfigurationHistory = (direction: 'undo' | 'redo') => {
  const { activeItemId } = useConfigurationCart.getState();
  if (!activeItemId) return;

  const entry = useConfigurationHistory.getState()[direction](activeItemId);
  if (entry) applyConfigurationHistoryEntry(entry);
};

const undoConfiguration = () => travelConfigurationHistory('undo');

const redoConfiguration = () => travelConfigurationHistory('redo');

export { applyConfigurationHistoryEntry, redoConfiguration, undoConfiguration };
