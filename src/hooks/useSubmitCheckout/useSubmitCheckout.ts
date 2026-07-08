'use client';

import { useCallback, useState } from 'react';

import { CHECKOUT_CUTTING_EXPORT_FILENAME, CHECKOUT_ORDER_EXPORT_FILENAME } from '@constants';
import { useCheckout, useConfigurationCart } from '@store';
import {
  buildAssetDownloadUrl,
  buildCheckoutOrderExport,
  buildCuttingExportDownloadUrlsFromUvBlobs,
  buildOrderCuttingExport,
  buildOrderPreset,
  collectOrderCuttingExportUvBlobs,
  formatCheckoutOrderDate,
  triggerPdfDownload,
  uploadCheckoutAssetsDirect,
  withTimeout,
} from '@utils';
import type { checkoutAssetUploadItemType } from '@utils';
import { redirectToShopifyCheckout } from '@utils/embeddedUrlSync';
import type { checkoutLineAttributeType, createCheckoutPayloadType, createCheckoutResultType } from '@shopify';

const CHECKOUT_ENDPOINT = '/api/checkout';
const CHECKOUT_ASSET_COLLECTION_TIMEOUT_MS = 120_000;

const createCheckoutOrderNumber = () => `#${Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)}`;

const collectCheckoutAssetAttributes = async (): Promise<checkoutLineAttributeType[]> => {
  try {
    const checkoutStore = useCheckout.getState();
    const cartStore = useConfigurationCart.getState();
    const { products } = checkoutStore;
    const { configurations } = cartStore;

    // Both PDFs must reference the same order number and date.
    const orderMeta = window.__checkoutE2e?.orderMeta ?? {
      orderNumber: createCheckoutOrderNumber(),
      orderDate: formatCheckoutOrderDate(),
    };

    const orderExportData = buildCheckoutOrderExport({
      products,
      cartItems: cartStore.items,
      previews: cartStore.previews,
      subtotal: checkoutStore.getSubtotal(),
      discountAmount: checkoutStore.getDiscountAmount(),
      shippingCost: checkoutStore.getShippingCost(),
      grandTotal: checkoutStore.getGrandTotal(),
      orderMeta,
    });

    const cuttingExportData = buildOrderCuttingExport({
      products,
      configurations,
      orderNumber: orderMeta.orderNumber,
      orderDate: orderMeta.orderDate,
    });

    // PDF renderer is heavy — load it only when the customer actually submits.
    const [{ buildCheckoutOrderExportPdfBlob }, { buildOrderCuttingExportPdfBlob }, uvBlobs] = await Promise.all([
      import('@utils/buildCheckoutOrderExportPdf'),
      import('@utils/buildOrderCuttingExportPdf'),
      collectOrderCuttingExportUvBlobs(cuttingExportData),
    ]);

    // Upload UV textures first: their public URLs become clickable links inside the cutting PDF.
    const uvUrlById = await uploadCheckoutAssetsDirect(
      uvBlobs.map((uv) => ({
        id: `uv:${uv.cartItemId}:${uv.label}`,
        blob: uv.blob,
        filename: uv.fileName,
        mimeType: uv.blob.type || 'image/png',
      })),
    );

    const uvImages = uvBlobs.flatMap((uv) => {
      const url = uvUrlById.get(`uv:${uv.cartItemId}:${uv.label}`);
      return url ? [{ cartItemId: uv.cartItemId, label: uv.label, url }] : [];
    });

    // PDF links go through the app's download route so a click downloads the file
    // instead of navigating the tab away from the open PDF.
    const linkUrls = uvBlobs.flatMap((uv) => {
      const url = uvUrlById.get(`uv:${uv.cartItemId}:${uv.label}`);
      return url ? [{ cartItemId: uv.cartItemId, label: uv.label, url: buildAssetDownloadUrl(url, uv.fileName) }] : [];
    });

    const downloadUrls = await buildCuttingExportDownloadUrlsFromUvBlobs(uvBlobs);

    const [orderPdfBlob, cuttingPdfBlob] = await Promise.all([
      buildCheckoutOrderExportPdfBlob(orderExportData).catch((error) => {
        console.error('Order PDF generation failed', error);
        return null;
      }),
      buildOrderCuttingExportPdfBlob(cuttingExportData, { downloadUrls, linkUrls }).catch((error) => {
        console.error('Cutting PDF generation failed', error);
        return null;
      }),
    ]);

    // Hand the generated PDFs to the customer immediately, before the upload starts.
    if (orderPdfBlob) triggerPdfDownload(orderPdfBlob, CHECKOUT_ORDER_EXPORT_FILENAME);
    if (cuttingPdfBlob) triggerPdfDownload(cuttingPdfBlob, CHECKOUT_CUTTING_EXPORT_FILENAME);

    const pdfUploadItems: checkoutAssetUploadItemType[] = [];

    if (orderPdfBlob) {
      pdfUploadItems.push({
        id: 'order-pdf',
        blob: orderPdfBlob,
        filename: CHECKOUT_ORDER_EXPORT_FILENAME,
        mimeType: 'application/pdf',
      });
    }

    if (cuttingPdfBlob) {
      pdfUploadItems.push({
        id: 'cutting-pdf',
        blob: cuttingPdfBlob,
        filename: CHECKOUT_CUTTING_EXPORT_FILENAME,
        mimeType: 'application/pdf',
      });
    }

    const pdfUrlById = pdfUploadItems.length ? await uploadCheckoutAssetsDirect(pdfUploadItems) : new Map<string, string>();
    const attributes: checkoutLineAttributeType[] = [];

    const orderPdfUrl = pdfUrlById.get('order-pdf');
    const cuttingPdfUrl = pdfUrlById.get('cutting-pdf');

    if (orderPdfUrl) attributes.push({ key: '_order_pdf_url', value: orderPdfUrl });
    if (cuttingPdfUrl) attributes.push({ key: '_cutting_pdf_url', value: cuttingPdfUrl });
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

      // Never let asset generation block the checkout indefinitely — proceed without attachments.
      payload.attributes = await withTimeout(
        collectCheckoutAssetAttributes(),
        CHECKOUT_ASSET_COLLECTION_TIMEOUT_MS,
        'Checkout asset collection',
      ).catch((assetError: unknown) => {
        console.error('Checkout asset collection failed', assetError);
        return [];
      });

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
