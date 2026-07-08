'use client';

import { useCallback } from 'react';

import { useAddProductDesignDialog } from '@store';
import type { configuratorCatalogProductPickType } from '@types';

const useRequestAddProduct = () => {
  const openWithProduct = useAddProductDesignDialog((state) => state.openWithProduct);

  const requestAddProduct = useCallback(
    (product: configuratorCatalogProductPickType) => {
      openWithProduct(product);
    },
    [openWithProduct],
  );

  return { requestAddProduct };
};

export { useRequestAddProduct };
