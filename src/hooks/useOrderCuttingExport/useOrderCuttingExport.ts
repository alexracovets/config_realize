'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { CHECKOUT_CUTTING_EXPORT_FILENAME } from '@constants';
import { useCheckout, useConfigurationCart } from '@store';
import { buildOrderCuttingExport, downloadOrderCuttingExportPdf, formatCheckoutOrderDate, resolveAbsoluteAssetUrl } from '@utils';

const createCheckoutOrderNumber = () => `#${Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)}`;

const useOrderCuttingExport = () => {
  const products = useCheckout((state) => state.products);
  const configurations = useConfigurationCart((state) => state.configurations);
  const documentRef = useRef<HTMLDivElement>(null);
  const isExportingRef = useRef(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useMemo(() => {
    const orderMeta = typeof window !== 'undefined' ? window.__checkoutE2e?.orderMeta : undefined;

    return buildOrderCuttingExport({
      products,
      configurations,
      orderNumber: orderMeta?.orderNumber ?? createCheckoutOrderNumber(),
      orderDate: orderMeta?.orderDate ?? formatCheckoutOrderDate(),
    });
  }, [configurations, products]);

  const exportCuttingOrder = useCallback(async () => {
    if (isExportingRef.current) return;

    const host = documentRef.current;
    if (!host) return;

    const documentElement = host.querySelector('[data-testid="order-cutting-export-document"]');
    if (!(documentElement instanceof HTMLElement)) return;

    isExportingRef.current = true;
    setIsExporting(true);

    const captureHost = document.createElement('div');
    captureHost.setAttribute('data-order-cutting-export-capture', '');
    captureHost.style.cssText = `position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;background:#fff;width:${documentElement.scrollWidth}px;`;
    const styleElement = host.querySelector('style');
    if (styleElement) {
      captureHost.appendChild(styleElement.cloneNode(true));
    }

    captureHost.appendChild(documentElement.cloneNode(true));
    document.body.appendChild(captureHost);

    const captureDocument = captureHost.querySelector('[data-testid="order-cutting-export-document"]');
    if (!(captureDocument instanceof HTMLElement)) {
      captureHost.remove();
      isExportingRef.current = false;
      setIsExporting(false);
      return;
    }

    captureDocument.querySelectorAll('img').forEach((image) => {
      if (!(image instanceof HTMLImageElement)) return;
      const src = image.getAttribute('src');
      if (!src || /^(?:https?:|blob:|data:)/.test(src)) return;
      image.src = resolveAbsoluteAssetUrl(src);
    });

    try {
      await downloadOrderCuttingExportPdf(captureDocument, CHECKOUT_CUTTING_EXPORT_FILENAME);
    } catch (error) {
      console.error('Order cutting export failed', error);
    } finally {
      captureHost.remove();
      isExportingRef.current = false;
      setIsExporting(false);
    }
  }, []);

  return { documentRef, exportData, exportCuttingOrder, isExporting };
};

export { useOrderCuttingExport };
