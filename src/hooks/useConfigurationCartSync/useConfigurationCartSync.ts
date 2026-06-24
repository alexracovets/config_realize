'use client';

import { useLayoutEffect, useRef } from 'react';

import { activateCartItem, areGarmentPrintStoresSynced, useConfigurationCart, useConfiguratorProduct, useGarmentDesign } from '@store';

const useConfigurationCartSync = () => {
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    const syncActiveCartItem = () => {
      const { activeItemId } = useConfigurationCart.getState();
      activateCartItem(() => useConfigurationCart.getState(), activeItemId);
    };

    const { product } = useConfiguratorProduct.getState();
    const isGarmentStoresEmpty = useGarmentDesign.getState().productPath == null;

    if (!initializedRef.current) {
      initializedRef.current = true;

      // Route shell stamps the product during render; skip default-model activation on first paint.
      if (isGarmentStoresEmpty) {
        return;
      }

      if (!areGarmentPrintStoresSynced(product.path)) {
        syncActiveCartItem();
      }

      return;
    }

    if (!areGarmentPrintStoresSynced(product.path)) {
      syncActiveCartItem();
    }
  }, []);
};

export { useConfigurationCartSync };
