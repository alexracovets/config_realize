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
  uploadCheckoutAssetsDirect,
  waitAndCloneDocumentForCapture,
} from '@utils';
import type { checkoutAssetUploadItemType } from '@utils';
import { redirectToShopifyCheckout } from '@utils/embeddedUrlSync';
import type { checkoutLineAttributeType, createCheckoutPayloadType, createCheckoutResultType } from '@shopify';

const CHECKOUT_ENDPOINT = '/api/checkout';

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

    const uploadItems: checkoutAssetUploadItemType[] = [];

    if (orderPdfBlob) {
      uploadItems.push({
        id: 'order-pdf',
        blob: orderPdfBlob,
        filename: CHECKOUT_ORDER_EXPORT_FILENAME,
        mimeType: 'application/pdf',
      });
    }

    if (cuttingPdfBlob) {
      uploadItems.push({
        id: 'cutting-pdf',
        blob: cuttingPdfBlob,
        filename: CHECKOUT_CUTTING_EXPORT_FILENAME,
        mimeType: 'application/pdf',
      });
    }

    uvBlobs.forEach((uv) => {
      uploadItems.push({
        id: `uv:${uv.cartItemId}:${uv.label}`,
        blob: uv.blob,
        filename: uv.fileName,
        mimeType: uv.blob.type || 'image/png',
      });
    });

    if (!uploadItems.length) return [];

    const urlById = await uploadCheckoutAssetsDirect(uploadItems);
    const attributes: checkoutLineAttributeType[] = [];

    const orderPdfUrl = urlById.get('order-pdf');
    const cuttingPdfUrl = urlById.get('cutting-pdf');

    if (orderPdfUrl) attributes.push({ key: '_order_pdf_url', value: orderPdfUrl });
    if (cuttingPdfUrl) attributes.push({ key: '_cutting_pdf_url', value: cuttingPdfUrl });

    const uvImages = uvBlobs.flatMap((uv) => {
      const url = urlById.get(`uv:${uv.cartItemId}:${uv.label}`);
      return url ? [{ cartItemId: uv.cartItemId, label: uv.label, url }] : [];
    });

    if (uvImages.length) attributes.push({ key: '_uv_image_urls', value: JSON.stringify(uvImages) });

    return attributes;
  } catch (error) {
    console.error('Checkout asset upload failed', error);
    return [];
  }
};

const useSubmitCheckout = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null as string | null);

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

      redirectToShopifyCheckout(data.checkoutUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Errore sconosciuto.');
      setIsSubmitting(false);
    }
  }, []);

  return { submitCheckout, isSubmitting, error };
};

export { useSubmitCheckout };
