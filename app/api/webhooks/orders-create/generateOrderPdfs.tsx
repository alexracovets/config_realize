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
import type { checkoutConfigExportType } from '@utils/buildCheckoutConfigExport';

type orderPdfContextType = {
  /** `_config_url` note attribute pointing at the order's config.json on Shopify Files. */
  configUrl: string;
  /** The app's own origin (from the webhook request) — used to build in-PDF download links. */
  appOrigin: string;
  orderNumber: string;
  orderDate: string;
  recipient: { name: string; email: string; phone: string };
  shippingAddress: { street: string; postalCode: string; city: string; country: string };
  billingNote: string;
  money: { subtotal: number; discountAmount: number; shippingCost: number; grandTotal: number };
};

type orderPdfUrlsType = {
  orderPdfUrl: string;
  cuttingPdfUrl: string;
};

const isHttpUrl = (value: string | null | undefined): value is string => !!value && /^https?:/i.test(value);

/** Server-side twin of `buildAssetDownloadUrl` (which relies on `window.location.origin`). */
const buildDownloadUrl = (origin: string, fileUrl: string, filename: string): string => {
  const url = new URL('/api/download', origin);
  url.searchParams.set('url', fileUrl);
  url.searchParams.set('filename', filename);
  return url.toString();
};

/** The only formats react-pdf's <Image> can embed natively — anything else must be rasterized to PNG first. */
const isPdfEmbeddableMime = (mime: string) => /image\/(?:png|jpe?g)/i.test(mime);

/**
 * Fetches a hosted image and returns it as a data URL. react-pdf's remote <Image> loader detects
 * the format from the URL extension, which our Shopify CDN URLs break with their `?v=` suffix — so
 * we embed the bytes directly instead. react-pdf only renders PNG/JPEG, while the configurator's
 * logo step accepts SVG/WebP/etc — those get rasterized to PNG via sharp before embedding.
 */
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

/** Extracts the real file extension from a hosted asset URL (stripping Shopify's `?v=` query), for building an accurate download filename. */
const resolveDownloadFilenameExtension = (url: string): string => {
  const pathname = url.split('?')[0] ?? url;
  const match = /\.([a-z0-9]+)$/i.exec(pathname);
  return match ? match[1].toLowerCase() : 'png';
};

/** Rasterizes the SVG shop logo to a PNG data URL — react-pdf's <Image> cannot render SVG. */
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

/** Rebuilds the checkout-table shapes the export builders expect from the flat config snapshot. */
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

/**
 * Generates both order PDFs server-side from the uploaded config.json plus the real order data
 * (number, date, recipient, address, totals) and uploads them to Shopify Files. Reuses the exact
 * same react-pdf document components as the client, embedding the already-hosted preview/UV image
 * URLs directly (no canvas rasterization needed on the server).
 */
const generateOrderPdfs = async (context: orderPdfContextType): Promise<orderPdfUrlsType> => {
  const config = await fetchConfigExport(context.configUrl);
  const { products, configurations, previews, cartItems } = reconstructCheckoutState(config);

  // --- Order confirmation PDF ---
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
  // Only hosted URLs can be embedded server-side; static fallbacks render as an empty cell.
  const previewSrcs = [...new Set(orderExport.lines.map((line) => line.previewSrc).filter(isHttpUrl))];
  await Promise.all(previewSrcs.map(async (src) => previewBySrc.set(src, await fetchImageAsDataUrl(src))));

  // --- Cutting (tessitura) PDF ---
  const [firstName, ...lastNameParts] = context.recipient.name.split(' ');
  const cuttingExport = buildOrderCuttingExport({
    products,
    configurations,
    orderNumber: context.orderNumber,
    orderDate: context.orderDate,
    customer: {
      firstName: firstName ?? '',
      lastName: lastNameParts.join(' '),
      address: context.shippingAddress.street,
      city: context.shippingAddress.city,
      postalCode: context.shippingAddress.postalCode,
      email: context.recipient.email,
    },
  });

  const downloadPreviewByKey = new Map<string, string | null>();
  const downloadLinkByKey = new Map<string, string>();
  await Promise.all(
    config.products.flatMap((product) =>
      product.uvImages
        .filter((uv) => isHttpUrl(uv.url))
        .map(async (uv) => {
          const key = buildDownloadPreviewKey(product.cartItemId, uv.label);
          downloadPreviewByKey.set(key, await fetchImageAsDataUrl(uv.url));
          downloadLinkByKey.set(key, buildDownloadUrl(context.appOrigin, uv.url, `${uv.label}.${resolveDownloadFilenameExtension(uv.url)}`));
        }),
    ),
  );

  const [orderPdfBuffer, cuttingPdfBuffer] = await Promise.all([
    renderToBuffer(<CheckoutOrderExportPdfDocument exportData={orderExport} images={{ logoSrc, previewBySrc }} />),
    renderToBuffer(<OrderCuttingExportPdfDocument exportData={cuttingExport} images={{ downloadPreviewByKey, downloadLinkByKey }} />),
  ]);

  const [orderPdfUrl, cuttingPdfUrl] = await Promise.all([
    uploadShopifyFile(new Blob([Uint8Array.from(orderPdfBuffer)], { type: 'application/pdf' }), CHECKOUT_ORDER_EXPORT_FILENAME, 'application/pdf'),
    uploadShopifyFile(new Blob([Uint8Array.from(cuttingPdfBuffer)], { type: 'application/pdf' }), CHECKOUT_CUTTING_EXPORT_FILENAME, 'application/pdf'),
  ]);

  return { orderPdfUrl, cuttingPdfUrl };
};

export { generateOrderPdfs };
export type { orderPdfContextType, orderPdfUrlsType };
