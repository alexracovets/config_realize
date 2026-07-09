import type { createCheckoutPayloadType } from '@shopify';
import type { checkoutProductType } from '@types';

const joinTesto = (testoTexts: string[]): string =>
  testoTexts
    .map((text) => text.trim())
    .filter(Boolean)
    .join(' / ');

/**
 * Builds the `/api/checkout` payload from the checkout table state. Each table row becomes
 * one Shopify cart line carrying only human-readable line item properties (Taglia/Nome/Numero/
 * Testo). The full configuration snapshot no longer travels per-line as a raw `_config` JSON
 * (it overflows Shopify's 255-char attribute limit); instead it is uploaded once as a single
 * `config.json` for the whole order and referenced via a cart-level `_config_url` attribute.
 */
const buildOrderPreset = (products: checkoutProductType[]): createCheckoutPayloadType => {
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
