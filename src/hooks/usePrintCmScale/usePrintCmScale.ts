'use client';

import { useConfiguratorProduct } from '@store';
import { type printCmScaleType, resolvePrintCmScale } from '@utils';
import { useMemo } from 'react';

/**
 * Returns the cm-per-pixel conversion factors for the active product's print atlas,
 * or `null` when the product has no Shopify size chart — callers then keep showing pixels.
 */
const usePrintCmScale = (): printCmScaleType | null => {
  const product = useConfiguratorProduct((state) => state.product);
  const printReferenceCm = useConfiguratorProduct((state) => state.business.printReferenceCm);

  return useMemo(() => resolvePrintCmScale(product, printReferenceCm), [product, printReferenceCm]);
};

export { usePrintCmScale };
