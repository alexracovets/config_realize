'use client';

import { useEffect } from 'react';

import {
  areGarmentPrintStoresSynced,
  captureGarmentConfiguration,
  useConfigurationCart,
  useConfigurationControl,
  useConfiguratorProduct,
  useGarmentColor,
  useGarmentDesign,
  useGarmentLogo,
  useGarmentName,
  useGarmentNumber,
  useGarmentTesto,
} from '@store';
import { buildConfigurationSignature, configurationHistoryRestoreGuard, useConfigurationHistory } from '@store/useConfigurationHistory';

const COMMIT_DEBOUNCE_MS = 400;

const isConfigurationReady = () => {
  const { product } = useConfiguratorProduct.getState();
  return Boolean(product) && areGarmentPrintStoresSynced(product.path);
};

const useConfigurationHistoryTracker = () => {
  useEffect(() => {
    let lastSignature: string | null = null;
    let lastItemId: string | null = null;
    let commitTimer: ReturnType<typeof setTimeout> | null = null;
    let isRestoring = false;

    const clearTimer = () => {
      if (commitTimer === null) return;
      clearTimeout(commitTimer);
      commitTimer = null;
    };

    const rebaseline = (itemId: string) => {
      const configuration = captureGarmentConfiguration();
      lastItemId = itemId;
      lastSignature = buildConfigurationSignature(configuration);

      const history = useConfigurationHistory.getState();
      if (!history.stacks[itemId]) {
        history.resetItem(itemId, { configuration, activeStep: useConfigurationControl.getState().activeStep });
      }
      history.setActiveItem(itemId);
    };

    const handleStoreChange = () => {
      if (isRestoring) return;

      const { activeItemId } = useConfigurationCart.getState();
      if (!activeItemId) return;

      if (activeItemId !== lastItemId || !isConfigurationReady()) {
        clearTimer();
        rebaseline(activeItemId);
        return;
      }

      const configuration = captureGarmentConfiguration();
      const signature = buildConfigurationSignature(configuration);
      if (signature === lastSignature) return;
      lastSignature = signature;

      clearTimer();
      commitTimer = setTimeout(() => {
        commitTimer = null;
        useConfigurationHistory.getState().commit(activeItemId, { configuration, activeStep: useConfigurationControl.getState().activeStep });
      }, COMMIT_DEBOUNCE_MS);
    };

    configurationHistoryRestoreGuard.set((value) => {
      isRestoring = value;
      clearTimer();
      if (!value) lastSignature = buildConfigurationSignature(captureGarmentConfiguration());
    });

    rebaseline(useConfigurationCart.getState().activeItemId);

    const unsubscribes = [
      useGarmentColor.subscribe(handleStoreChange),
      useGarmentDesign.subscribe(handleStoreChange),
      useGarmentName.subscribe(handleStoreChange),
      useGarmentNumber.subscribe(handleStoreChange),
      useGarmentTesto.subscribe(handleStoreChange),
      useGarmentLogo.subscribe(handleStoreChange),
      useConfigurationCart.subscribe((state, previous) => {
        const history = useConfigurationHistory.getState();

        previous.items.forEach(({ id }) => {
          if (!state.items.some((item) => item.id === id)) history.removeItem(id);
        });

        if (state.activeItemId === previous.activeItemId) return;
        clearTimer();
        history.setActiveItem(state.activeItemId);
      }),
    ];

    return () => {
      clearTimer();
      configurationHistoryRestoreGuard.clear();
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
};

export { useConfigurationHistoryTracker };
