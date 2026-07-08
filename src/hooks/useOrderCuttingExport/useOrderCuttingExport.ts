'use client';

import { useMemo, useRef } from 'react';

import { useCheckout, useConfigurationCart } from '@store';
import { buildOrderCuttingExport, formatCheckoutOrderDate } from '@utils';

const createCheckoutOrderNumber = () => `#${Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)}`;

/** Keeps the hidden cutting-export document in sync with checkout state for PDF capture on submit. */
const useOrderCuttingExport = () => {
  const products = useCheckout((state) => state.products);
  const configurations = useConfigurationCart((state) => state.configurations);
  const documentRef = useRef<HTMLDivElement>(null);

  const exportData = useMemo(() => {
    const orderMeta = typeof window !== 'undefined' ? window.__checkoutE2e?.orderMeta : undefined;

    return buildOrderCuttingExport({
      products,
      configurations,
      orderNumber: orderMeta?.orderNumber ?? createCheckoutOrderNumber(),
      orderDate: orderMeta?.orderDate ?? formatCheckoutOrderDate(),
    });
  }, [configurations, products]);

  return { documentRef, exportData };
};

export { useOrderCuttingExport };
