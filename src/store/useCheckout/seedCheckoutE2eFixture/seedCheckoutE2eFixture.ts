'use client';

import { createCheckoutRow } from '@store/useCheckout/buildCheckoutRows';
import type { checkoutE2eFixtureType } from '@store/useCheckout/checkoutE2eTypes';
import { useCheckout } from '@store/useCheckout/useCheckout';
import { createCartItem } from '@store/useConfigurationCart/mapCartItems';
import { useConfigurationCart } from '@store/useConfigurationCart/useConfigurationCart';
import type { checkoutProductType, garmentBusinessType } from '@types';

const E2E_CART_ITEM_ID = 'e2e-checkout-cart-item';

const buildBusiness = (fixture: checkoutE2eFixtureType): garmentBusinessType => ({
  shopifyProductId: '',
  handle: fixture.product.slug,
  name: fixture.product.name,
  price: fixture.product.price,
  currencyCode: 'EUR',
  minimumCount: 26,
  bonusCount: 0,
  bonusDiscount: 0,
});

const seedCheckoutE2eFixture = (fixture: checkoutE2eFixtureType) => {
  const business = buildBusiness(fixture);
  const firstRow = fixture.rows[0];

  const rowPreset = {
    size: firstRow?.size ?? 'M',
    name: firstRow?.name ?? '',
    number: firstRow?.number ?? '',
    testoTexts: firstRow?.testoTexts ?? [],
  };

  const products: checkoutProductType[] = [
    {
      cartItemId: E2E_CART_ITEM_ID,
      modelId: fixture.product.modelId,
      business,
      rowPreset,
      rows: fixture.rows.map((row) => createCheckoutRow(row.size, row.name, row.number, row.testoTexts, row.quantity)),
    },
  ];

  useConfigurationCart.setState({
    items: [
      {
        ...createCartItem({
          collectionHandle: fixture.product.collectionHandle,
          slug: fixture.product.slug,
          modelId: fixture.product.modelId,
          business,
        }),
        id: E2E_CART_ITEM_ID,
      },
    ],
    activeItemId: E2E_CART_ITEM_ID,
    configurations: {},
    previews: fixture.previewSrc ? { [E2E_CART_ITEM_ID]: fixture.previewSrc } : {},
  });

  useCheckout.setState({ products });

  if (typeof window !== 'undefined' && window.__checkoutE2e) {
    window.__checkoutE2e.orderMeta = fixture.orderMeta;
  }
};

export { E2E_CART_ITEM_ID, seedCheckoutE2eFixture };
