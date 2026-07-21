import type { createCheckoutPayloadType } from '@shopify';
import type { checkoutProductType } from '@types';

const joinTesto = (testoTexts: string[]): string =>
  testoTexts
    .map((text) => text.trim())
    .filter(Boolean)
    .join(' / ');

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
