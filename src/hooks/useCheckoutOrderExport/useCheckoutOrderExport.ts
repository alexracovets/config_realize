'use client';

import { useMemo, useRef } from 'react';

import { useCheckout, useConfigurationCart } from '@store';
import { buildCheckoutOrderExport } from '@utils';

const useCheckoutOrderExport = () => {
  const products = useCheckout((state) => state.products);
  const cartItems = useConfigurationCart((state) => state.items);
  const previews = useConfigurationCart((state) => state.previews);
  const documentRef = useRef<HTMLDivElement>(null);

  const exportData = useMemo(() => {
    const store = useCheckout.getState();
    const orderMeta = typeof window !== 'undefined' ? window.__checkoutE2e?.orderMeta : undefined;

    return buildCheckoutOrderExport({
      products,
      cartItems,
      previews,
      subtotal: store.getSubtotal(),
      discountAmount: store.getDiscountAmount(),
      shippingCost: store.getShippingCost(),
      grandTotal: store.getGrandTotal(),
      orderMeta,
    });
  }, [products, cartItems, previews]);

  return { documentRef, exportData };
};

export { useCheckoutOrderExport };
