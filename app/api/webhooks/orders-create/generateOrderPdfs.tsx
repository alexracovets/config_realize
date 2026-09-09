import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { renderToBuffer } from '@react-pdf/renderer';
import sharp from 'sharp';

import { CHECKOUT_CUTTING_EXPORT_FILENAME, CHECKOUT_ORDER_EXPORT_FILENAME } from '@constants';
import { uploadShopifyFile } from '@shopify';
import type { cartItemConfigurationType, cartItemType, checkoutProductType } from '@types';
import { buildCheckoutOrderExport } from '@utils/buildCheckoutOrderExport';
import { CheckoutOrderExportPdfDocument } from '@utils/buildCheckoutOrderExportPdf/CheckoutOrderExportPdfDocument';
import { buildOrderCuttingExport } from '@utils/buildOrderCuttingExport';
import { buildDownloadPreviewKey, OrderCuttingExportPdfDocument } from '@utils/buildOrderCuttingExportPdf/OrderCuttingExportPdfDocument';
import { COMPLEX_PREVIEW_LABEL, fillMissingComplexUvPreviews, pngBufferFromDataUrl } from '@utils/composeComplexUvAtlasFromPreviews';
import { buildPublicAssetDownloadUrl } from '@utils/resolvePublicAppOrigin';
import type { checkoutConfigExportType } from '@utils/buildCheckoutConfigExport';

type orderPdfContextType = {
  configUrl: string;
  appOrigin: string | null;
  orderNumber: string;
  orderDate: string;
  recipient: { name: string; email: string; phone: string };
  shippingAddress: { company: string; street: string; postalCode: string; city: string; province: string; country: string };
  billingNote: string;
  money: { subtotal: number; discountAmount: number; shippingCost: number; grandTotal: number };
};

type orderPdfUrlsType = {
  orderPdfUrl: string;
  cuttingPdfUrl: string;
  orderPdfBuffer: Buffer;
  cuttingPdfBuffer: Buffer;
};

const isHttpUrl = (value: string | null | undefined): value is string => !!value && /^https?:/i.test(value);

const isPdfEmbeddableMime = (mime: string) => /image\/(?:png|jpe?g)/i.test(mime);

const fetchImageAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = response.headers.get('content-type')?.split(';')[0].trim() || 'image/png';

    if (isPdfEmbeddableMime(mime)) {
      return `data:${mime};base64,${buffer.toString('base64')}`;
    }

    const png = await sharp(buffer).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
};

const resolveDownloadFilenameExtension = (url: string): string => {
  const pathname = url.split('?')[0] ?? url;
  const match = /\.([a-z0-9]+)$/i.exec(pathname);
  return match ? match[1].toLowerCase() : 'png';
};

const renderLogoDataUrl = async (): Promise<string | null> => {
  try {
    const svg = await readFile(path.join(process.cwd(), 'public', 'svg', 'logo_you.svg'));
    const png = await sharp(svg).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
};

const fetchConfigExport = async (configUrl: string): Promise<checkoutConfigExportType> => {
  const response = await fetch(configUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch config.json (${response.status}) from ${configUrl}`);
  }
  return (await response.json()) as checkoutConfigExportType;
};

const reconstructCheckoutState = (config: checkoutConfigExportType) => {
  const products: checkoutProductType[] = config.products.map((product) => ({
    cartItemId: product.cartItemId,
    modelId: product.modelId,
    business: product.business,
    rowPreset: { size: product.lines[0]?.size ?? 'M', name: '', number: '', testoTexts: [] },
    rows: product.lines.map((line, index) => ({
      id: `${product.cartItemId}:${index}`,
      size: line.size,
      name: line.name,
      number: line.number,
      testoTexts: line.testoTexts,
      quantity: line.quantity,
    })),
  }));

  const configurations: Record<string, cartItemConfigurationType> = {};
  const previews: Record<string, string> = {};

  config.products.forEach((product) => {
    if (product.configuration) configurations[product.cartItemId] = product.configuration;
    if (product.previewUrl) previews[product.cartItemId] = product.previewUrl;
  });

  const cartItems = config.products.map((product) => ({ id: product.cartItemId, modelId: product.modelId }) as cartItemType);

  return { products, configurations, previews, cartItems };
};

const generateOrderPdfs = async (context: orderPdfContextType): Promise<orderPdfUrlsType> => {
  const config = await fetchConfigExport(context.configUrl);
  const { products, configurations, previews, cartItems } = reconstructCheckoutState(config);

  const orderExportBase = buildCheckoutOrderExport({
    products,
    cartItems,
    previews,
    subtotal: context.money.subtotal,
    discountAmount: context.money.discountAmount,
    shippingCost: context.money.shippingCost,
    grandTotal: context.money.grandTotal,
    orderMeta: { orderNumber: context.orderNumber, orderDate: context.orderDate },
  });

  const orderExport = {
    ...orderExportBase,
    recipient: context.recipient,
    shippingAddress: context.shippingAddress,
    billingNote: context.billingNote,
  };

  const logoSrc = await renderLogoDataUrl();
  const previewBySrc = new Map<string, string | null>();
  const previewSrcs = [...new Set(orderExport.lines.map((line) => line.previewSrc).filter(isHttpUrl))];
  await Promise.all(previewSrcs.map(async (src) => previewBySrc.set(src, await fetchImageAsDataUrl(src))));

  const [firstName, ...lastNameParts] = context.recipient.name.split(' ');
  const cuttingExport = buildOrderCuttingExport({
    products,
    configurations,
    orderNumber: context.orderNumber,
    orderDate: context.orderDate,
    customer: {
      firstName: firstName ?? '',
      lastName: lastNameParts.join(' '),
      company: context.shippingAddress.company,
      address: context.shippingAddress.street,
      city: context.shippingAddress.city,
      province: context.shippingAddress.province,
      postalCode: context.shippingAddress.postalCode,
      email: context.recipient.email,
    },
  });

  const downloadPreviewByKey = new Map<string, string | null>();
  const downloadLinkByKey = new Map<string, string>();
  const previewEntries = config.products.flatMap((product) => product.uvImages.filter((uv) => isHttpUrl(uv.url)).map((uv) => ({ product, uv })));
  const previewLayers = (
    await Promise.all(
      previewEntries.map(async ({ product, uv }) => {
        const dataUrl = await fetchImageAsDataUrl(uv.url);
        if (!dataUrl) return null;

        const key = buildDownloadPreviewKey(product.cartItemId, uv.label);
        downloadPreviewByKey.set(key, dataUrl);
        downloadLinkByKey.set(key, buildPublicAssetDownloadUrl(context.appOrigin, uv.url, `${uv.label}.${resolveDownloadFilenameExtension(uv.url)}`));
        return { cartItemId: product.cartItemId, label: uv.label, dataUrl };
      }),
    )
  ).filter((layer): layer is { cartItemId: string; label: string; dataUrl: string } => layer !== null);

  await fillMissingComplexUvPreviews({
    products: cuttingExport.products,
    layers: previewLayers,
    downloadPreviewByKey,
  });

  for (const product of cuttingExport.products) {
    const complexKey = buildDownloadPreviewKey(product.cartItemId, COMPLEX_PREVIEW_LABEL);
    if (downloadLinkByKey.has(complexKey)) continue;

    const dataUrl = downloadPreviewByKey.get(complexKey);
    if (!dataUrl) continue;

    const fileUrl = await uploadShopifyFile(
      new Blob([Uint8Array.from(pngBufferFromDataUrl(dataUrl))], { type: 'image/png' }),
      'complex_uv_atlas.png',
      'image/png',
    );
    downloadLinkByKey.set(complexKey, buildPublicAssetDownloadUrl(context.appOrigin, fileUrl, 'complex_uv_atlas.png'));
  }

  const [orderPdfBuffer, cuttingPdfBuffer] = await Promise.all([
    renderToBuffer(<CheckoutOrderExportPdfDocument exportData={orderExport} images={{ logoSrc, previewBySrc }} />),
    renderToBuffer(<OrderCuttingExportPdfDocument exportData={cuttingExport} images={{ downloadPreviewByKey, downloadLinkByKey }} />),
  ]);

  const [orderPdfUrl, cuttingPdfUrl] = await Promise.all([
    uploadShopifyFile(new Blob([Uint8Array.from(orderPdfBuffer)], { type: 'application/pdf' }), CHECKOUT_ORDER_EXPORT_FILENAME, 'application/pdf'),
    uploadShopifyFile(new Blob([Uint8Array.from(cuttingPdfBuffer)], { type: 'application/pdf' }), CHECKOUT_CUTTING_EXPORT_FILENAME, 'application/pdf'),
  ]);

  return { orderPdfUrl, cuttingPdfUrl, orderPdfBuffer, cuttingPdfBuffer };
};

export { generateOrderPdfs };
export type { orderPdfContextType, orderPdfUrlsType };
