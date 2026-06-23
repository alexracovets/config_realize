'use client';

import { useLayoutEffect, useRef } from 'react';

import { activateCartItem, areGarmentPrintStoresSynced, useConfigurationCart, useConfiguratorProduct } from '@store';

const useConfigurationCartSync = () => {
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    const syncActiveCartItem = () => {
      const { activeItemId } = useConfigurationCart.getState();
      activateCartItem(() => useConfigurationCart.getState(), activeItemId);
    };

    if (!initializedRef.current) {
      initializedRef.current = true;
      syncActiveCartItem();
      return;
    }

    // After HMR the zustand store may reset while this ref survives.
    const { product } = useConfiguratorProduct.getState();
    if (!areGarmentPrintStoresSynced(product.path)) {
      syncActiveCartItem();
    }
  }, []);
};

export { useConfigurationCartSync };
