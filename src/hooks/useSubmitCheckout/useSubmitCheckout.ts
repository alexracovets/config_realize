'use client';

import { useCallback, useState } from 'react';

import { CHECKOUT_CUTTING_EXPORT_FILENAME, CHECKOUT_ORDER_EXPORT_FILENAME } from '@constants';
import { useCheckout, useConfigurationCart } from '@store';
import {
  buildCheckoutOrderExportPdfBlob,
  buildOrderCuttingExport,
  buildOrderCuttingExportPdfBlob,
  buildOrderPreset,
  collectOrderCuttingExportUvBlobs,
  isEmbeddedSession,
  resolveAbsoluteAssetUrl,
} from '@utils';
import { postEmbeddedCheckoutRedirect } from '@utils/embeddedUrlSync';
import type { checkoutLineAttributeType, createCheckoutPayloadType, createCheckoutResultType } from '@shopify';
import type { uvExportBlobType } from '@utils';

const CHECKOUT_ENDPOINT = '/api/checkout';
const CHECKOUT_ASSETS_ENDPOINT = '/api/checkout/assets';

type checkoutAssetsResponseType = {
  orderPdfUrl: string | null;
  cuttingPdfUrl: string | null;
  uvImages: { cartItemId: string; label: string; url: string }[];
  error?: string;
};

/** Clones an already-mounted hidden export document into an offscreen capture host, resolving relative image URLs. */
const cloneDocumentForCapture = (testId: string): { element: HTMLElement; dispose: () => void } | null => {
  const source = document.querySelector(`[data-testid="${testId}"]`);
  if (!(source instanceof HTMLElement)) return null;

  const styleElement = source.parentElement?.querySelector('style') ?? null;

  const captureHost = document.createElement('div');
  captureHost.style.cssText = `position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;background:#fff;width:${source.scrollWidth}px;`;
  if (styleElement) captureHost.appendChild(styleElement.cloneNode(true));
  captureHost.appendChild(source.cloneNode(true));
  document.body.appendChild(captureHost);

  const cloned = captureHost.querySelector(`[data-testid="${testId}"]`);
  if (!(cloned instanceof HTMLElement)) {
    captureHost.remove();
    return null;
  }

  cloned.querySelectorAll('img').forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;
    const src = image.getAttribute('src');
    if (!src || /^(?:https?:|blob:|data:)/.test(src)) return;
    image.src = resolveAbsoluteAssetUrl(src);
  });

  return { element: cloned, dispose: () => captureHost.remove() };
};

const buildAssetsFormData = (orderPdfBlob: Blob | null, cuttingPdfBlob: Blob | null, uvBlobs: uvExportBlobType[]): FormData => {
  const formData = new FormData();

  if (orderPdfBlob) formData.append('orderPdf', orderPdfBlob, CHECKOUT_ORDER_EXPORT_FILENAME);
  if (cuttingPdfBlob) formData.append('cuttingPdf', cuttingPdfBlob, CHECKOUT_CUTTING_EXPORT_FILENAME);

  uvBlobs.forEach((uv) => {
    formData.append('uvImage', uv.blob, uv.fileName);
    formData.append('uvImageCartItemId', uv.cartItemId);
    formData.append('uvImageLabel', uv.label);
  });

  return formData;
};

/** Renders/captures the order + cutting PDFs and UV textures, uploads them to Shopify Files, and returns cart attributes carrying their URLs. Never throws: a failed upload must not block checkout. */
const collectCheckoutAssetAttributes = async (): Promise<checkoutLineAttributeType[]> => {
  try {
    const { products } = useCheckout.getState();
    const { configurations } = useConfigurationCart.getState();

    const cuttingExportData = buildOrderCuttingExport({ products, configurations });

    const orderCapture = cloneDocumentForCapture('checkout-order-export-document');
    const cuttingCapture = cloneDocumentForCapture('order-cutting-export-document');

    const [orderPdfBlob, cuttingPdfBlob, uvBlobs] = await Promise.all([
      orderCapture ? buildCheckoutOrderExportPdfBlob(orderCapture.element).finally(orderCapture.dispose) : Promise.resolve(null),
      cuttingCapture ? buildOrderCuttingExportPdfBlob(cuttingCapture.element).finally(cuttingCapture.dispose) : Promise.resolve(null),
      collectOrderCuttingExportUvBlobs(cuttingExportData),
    ]);

    if (!orderPdfBlob && !cuttingPdfBlob && !uvBlobs.length) return [];

    const response = await fetch(CHECKOUT_ASSETS_ENDPOINT, {
      method: 'POST',
      body: buildAssetsFormData(orderPdfBlob, cuttingPdfBlob, uvBlobs),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as checkoutAssetsResponseType;
    const attributes: checkoutLineAttributeType[] = [];

    if (data.orderPdfUrl) attributes.push({ key: '_order_pdf_url', value: data.orderPdfUrl });
    if (data.cuttingPdfUrl) attributes.push({ key: '_cutting_pdf_url', value: data.cuttingPdfUrl });
    if (data.uvImages?.length) attributes.push({ key: '_uv_image_urls', value: JSON.stringify(data.uvImages) });

    return attributes;
  } catch (error) {
    console.error('Checkout asset upload failed', error);
    return [];
  }
};

/**
 * Submits the configured session as a Shopify cart and redirects to checkout. The cart is
 * created server-side (`/api/checkout`) to keep Storefront tokens off the client; when
 * embedded the redirect is delegated to the theme (cross-origin top-window navigation).
 */
const useSubmitCheckout = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCheckout = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { products } = useCheckout.getState();
      const { configurations } = useConfigurationCart.getState();
      const payload: createCheckoutPayloadType = buildOrderPreset(products, configurations);

      if (!payload.lines.length) {
        throw new Error('Nessun prodotto da ordinare.');
      }

      payload.attributes = await collectCheckoutAssetAttributes();

      const response = await fetch(CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as createCheckoutResultType & { error?: string };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? 'Impossibile creare il checkout.');
      }

      if (isEmbeddedSession()) {
        postEmbeddedCheckoutRedirect(data.checkoutUrl);
      } else {
        window.location.assign(data.checkoutUrl);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Errore sconosciuto.');
      setIsSubmitting(false);
    }
  }, []);

  return { submitCheckout, isSubmitting, error };
};

export { useSubmitCheckout };
