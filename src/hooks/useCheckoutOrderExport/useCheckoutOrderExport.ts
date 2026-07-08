'use client';

import { useCallback, useMemo, useRef } from 'react';

import { CHECKOUT_ORDER_EXPORT_FILENAME } from '@constants';
import { useCheckout, useConfigurationCart } from '@store';
import { buildCheckoutOrderExport, downloadCheckoutOrderExportPdf, resolveAbsoluteAssetUrl } from '@utils';

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

  const exportOrder = useCallback(async () => {
    const host = documentRef.current;
    if (!host) return;

    const documentElement = host.querySelector('[data-testid="checkout-order-export-document"]');
    if (!(documentElement instanceof HTMLElement)) return;

    const captureHost = document.createElement('div');
    captureHost.setAttribute('data-order-export-capture', '');
    captureHost.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;background:#fff;';
    const styleElement = host.querySelector('style');
    if (styleElement) {
      captureHost.appendChild(styleElement.cloneNode(true));
    }

    captureHost.appendChild(documentElement.cloneNode(true));
    document.body.appendChild(captureHost);

    const captureDocument = captureHost.querySelector('[data-testid="checkout-order-export-document"]');
    if (!(captureDocument instanceof HTMLElement)) {
      captureHost.remove();
      return;
    }

    captureDocument.querySelectorAll('img').forEach((image) => {
      if (!(image instanceof HTMLImageElement)) return;
      const src = image.getAttribute('src');
      if (!src || /^(?:https?:|blob:|data:)/.test(src)) return;
      image.src = resolveAbsoluteAssetUrl(src);
    });

    try {
      await downloadCheckoutOrderExportPdf(captureDocument, CHECKOUT_ORDER_EXPORT_FILENAME);
    } finally {
      captureHost.remove();
    }
  }, []);

  return { documentRef, exportData, exportOrder };
};

export { useCheckoutOrderExport };
