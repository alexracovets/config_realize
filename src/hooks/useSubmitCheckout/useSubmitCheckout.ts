'use client';

import { useCallback, useState } from 'react';

import { CHECKOUT_CUTTING_EXPORT_FILENAME, CHECKOUT_ORDER_EXPORT_FILENAME } from '@constants';
import { useCheckout, useConfigurationCart } from '@store';
import {
  buildCheckoutOrderExportPdfBlob,
  buildCuttingExportDownloadUrlsFromUvBlobs,
  buildOrderCuttingExport,
  buildOrderCuttingExportPdfBlob,
  buildOrderPreset,
  collectOrderCuttingExportUvBlobs,
  waitAndCloneDocumentForCapture,
} from '@utils';
import { openPendingCheckoutWindow, redirectToShopifyCheckout } from '@utils/embeddedUrlSync';
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

    const [orderCapture, cuttingCapture, uvBlobs] = await Promise.all([
      waitAndCloneDocumentForCapture('checkout-order-export-document'),
      waitAndCloneDocumentForCapture('order-cutting-export-document'),
      collectOrderCuttingExportUvBlobs(cuttingExportData),
    ]);

    const downloadUrls = await buildCuttingExportDownloadUrlsFromUvBlobs(uvBlobs);

    const [orderPdfBlob, cuttingPdfBlob] = await Promise.all([
      orderCapture
        ? buildCheckoutOrderExportPdfBlob(orderCapture.element).catch((error) => {
            console.error('Order PDF generation failed', error);
            return null;
          })
        : Promise.resolve(null),
      cuttingCapture
        ? buildOrderCuttingExportPdfBlob(cuttingCapture.element, { downloadUrls }).catch((error) => {
            console.error('Cutting PDF generation failed', error);
            return null;
          })
        : Promise.resolve(null),
    ]);

    orderCapture?.dispose();
    cuttingCapture?.dispose();

    if (!orderPdfBlob && !cuttingPdfBlob && !uvBlobs.length) return [];

    const uploadResponse = await fetch(CHECKOUT_ASSETS_ENDPOINT, {
      method: 'POST',
      body: buildAssetsFormData(orderPdfBlob, cuttingPdfBlob, uvBlobs),
    });

    if (!uploadResponse.ok) return [];

    const uploadData = (await uploadResponse.json()) as checkoutAssetsResponseType;
    const attributes: checkoutLineAttributeType[] = [];

    if (uploadData.orderPdfUrl) attributes.push({ key: '_order_pdf_url', value: uploadData.orderPdfUrl });
    if (uploadData.cuttingPdfUrl) attributes.push({ key: '_cutting_pdf_url', value: uploadData.cuttingPdfUrl });
    if (uploadData.uvImages?.length) attributes.push({ key: '_uv_image_urls', value: JSON.stringify(uploadData.uvImages) });

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

    const pendingCheckoutWindow = openPendingCheckoutWindow();

    try {
      const { products } = useCheckout.getState();
      const { configurations } = useConfigurationCart.getState();
      const payload: createCheckoutPayloadType = buildOrderPreset(products, configurations);

      if (!payload.lines.length) {
        pendingCheckoutWindow?.close();
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
        pendingCheckoutWindow?.close();
        throw new Error(data.error ?? 'Impossibile creare il checkout.');
      }

      redirectToShopifyCheckout(data.checkoutUrl, pendingCheckoutWindow);

      if (pendingCheckoutWindow) {
        setIsSubmitting(false);
      }
    } catch (submitError) {
      pendingCheckoutWindow?.close();
      setError(submitError instanceof Error ? submitError.message : 'Errore sconosciuto.');
      setIsSubmitting(false);
    }
  }, []);

  return { submitCheckout, isSubmitting, error };
};

export { useSubmitCheckout };
