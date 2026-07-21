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

  business: garmentBusinessType;

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

  uvImages: Array<{ cartItemId: string; label: string; url: string }>;

  previewUrls: Record<string, string>;
  orderNumber: string;
  orderDate: string;
};

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
