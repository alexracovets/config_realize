import type { createCheckoutPayloadType } from '@shopify/checkoutPayload';
import type { cartItemConfigurationType, checkoutProductType } from '@types';

const CONFIG_PRESET_VERSION = 1;

const joinTesto = (testoTexts: string[]): string => testoTexts.map((text) => text.trim()).filter(Boolean).join(' / ');

/**
 * Builds the `/api/checkout` payload from the checkout table state. Each table row becomes
 * one Shopify cart line: human-readable line item properties (Taglia/Nome/Numero/Testo) for
 * the merchant/customer, plus a hidden `_config` JSON snapshot of the full configuration.
 */
const buildOrderPreset = (products: checkoutProductType[], configurations: Record<string, cartItemConfigurationType>): createCheckoutPayloadType => {
  const lines = products.flatMap((product) =>
    product.rows.map((row) => {
      const attributes: { key: string; value: string }[] = [{ key: 'Taglia', value: row.size }];

      if (row.name.trim()) {
        attributes.push({ key: 'Nome', value: row.name.trim() });
      }

      if (row.number.trim()) {
        attributes.push({ key: 'Numero', value: row.number.trim() });
      }

      const testo = joinTesto(row.testoTexts);
      if (testo) {
        attributes.push({ key: 'Testo', value: testo });
      }

      const preset = {
        version: CONFIG_PRESET_VERSION,
        handle: product.business.handle,
        modelId: product.modelId,
        size: row.size,
        name: row.name,
        number: row.number,
        testoTexts: row.testoTexts,
        quantity: row.quantity,
        configuration: configurations[product.cartItemId] ?? null,
      };

      attributes.push({ key: '_config', value: JSON.stringify(preset) });

      return {
        handle: product.business.handle,
        quantity: row.quantity,
        attributes,
      };
    }),
  );

  return { lines };
};

export { buildOrderPreset };
