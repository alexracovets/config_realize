import type { cartItemConfigurationType, checkoutProductType, garmentBusinessType, modelIdType } from '@types';

const CHECKOUT_CONFIG_EXPORT_VERSION = 1;

type checkoutConfigUvImageType = {
  label: string;
  url: string;
};

type checkoutConfigLineType = {
  size: string;
  name: string;
  number: string;
  testoTexts: string[];
  quantity: number;
};

type checkoutConfigProductExportType = {
  cartItemId: string;
  handle: string;
  modelId: modelIdType;
  /** Business snapshot (name/price/currency) needed to rebuild the PDFs server-side. */
  business: garmentBusinessType;
  /** Public Shopify CDN URL of the captured product preview, or null when none was captured. */
  previewUrl: string | null;
  configuration: cartItemConfigurationType | null;
  uvImages: checkoutConfigUvImageType[];
  lines: checkoutConfigLineType[];
};

type checkoutConfigExportType = {
  version: number;
  orderNumber: string;
  orderDate: string;
  products: checkoutConfigProductExportType[];
};

type buildCheckoutConfigExportArgsType = {
  products: checkoutProductType[];
  configurations: Record<string, cartItemConfigurationType>;
  /** UV texture URLs already uploaded to Shopify Files, tagged by the product they belong to. */
  uvImages: Array<{ cartItemId: string; label: string; url: string }>;
  /** Uploaded product preview URLs keyed by cartItemId. */
  previewUrls: Record<string, string>;
  orderNumber: string;
  orderDate: string;
};

/**
 * Builds a single JSON snapshot for the whole order: every configured product with its full
 * configuration, business snapshot, uploaded UV texture URLs and preview URL, plus the per-size
 * lines. This file is uploaded to Shopify Files and referenced from a single `_config_url` cart
 * attribute, so the raw (and oversized) `_config` JSON no longer needs to travel through line
 * item properties — and the webhook can rebuild both PDFs server-side from it.
 */
const buildCheckoutConfigExport = ({
  products,
  configurations,
  uvImages,
  previewUrls,
  orderNumber,
  orderDate,
}: buildCheckoutConfigExportArgsType): checkoutConfigExportType => ({
  version: CHECKOUT_CONFIG_EXPORT_VERSION,
  orderNumber,
  orderDate,
  products: products.map((product) => ({
    cartItemId: product.cartItemId,
    handle: product.business.handle,
    modelId: product.modelId,
    business: product.business,
    previewUrl: previewUrls[product.cartItemId] ?? null,
    configuration: configurations[product.cartItemId] ?? null,
    uvImages: uvImages.filter((uv) => uv.cartItemId === product.cartItemId).map((uv) => ({ label: uv.label, url: uv.url })),
    lines: product.rows.map((row) => ({
      size: row.size,
      name: row.name.trim(),
      number: row.number.trim(),
      testoTexts: row.testoTexts.map((text) => text.trim()).filter(Boolean),
      quantity: row.quantity,
    })),
  })),
});

export { buildCheckoutConfigExport, CHECKOUT_CONFIG_EXPORT_VERSION };
export type { checkoutConfigExportType, checkoutConfigProductExportType };
