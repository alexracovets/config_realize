'use client';

import { useConfiguratorProduct } from '@store';
import { type printCmScaleType, resolvePrintCmScale } from '@utils';
import { useMemo } from 'react';

const usePrintCmScale = (): printCmScaleType | null => {
  const product = useConfiguratorProduct((state) => state.product);
  const printReferenceCm = useConfiguratorProduct((state) => state.business.printReferenceCm);

  return useMemo(() => resolvePrintCmScale(product, printReferenceCm), [product, printReferenceCm]);
};

export { usePrintCmScale };
