import { describe, expect, it } from 'vitest';

import { getCheckoutMinimumQuantity, isCheckoutMinimumQuantityMet } from '@store/useCheckout/checkoutPricing';
import type { checkoutProductType } from '@types';

const buildProduct = (cartItemId: string, quantities: number[], minimumCount?: number) =>
  ({
    cartItemId,
    business: { name: cartItemId, price: 10, minimumCount },
    rows: quantities.map((quantity, index) => ({ id: `${cartItemId}-${index}`, quantity })),
  }) as checkoutProductType;

describe('checkout minimum quantity', () => {
  it('blocks a single product below the default minimum', () => {
    expect(isCheckoutMinimumQuantityMet([buildProduct('a', [1])])).toBe(false);
  });

  it('allows a single product that reaches the minimum across its rows', () => {
    expect(isCheckoutMinimumQuantityMet([buildProduct('a', [2, 3])])).toBe(true);
  });

  it('allows a second product in any quantity once one product reaches its minimum', () => {
    // Product "a" carries the order, so the goalkeeper shirt "b" may be a single piece.
    expect(isCheckoutMinimumQuantityMet([buildProduct('a', [10]), buildProduct('b', [1])])).toBe(true);
  });

  it('blocks an order where no product reaches its own minimum', () => {
    // The combined quantity is 6, but neither product reaches 5 on its own.
    expect(isCheckoutMinimumQuantityMet([buildProduct('a', [3]), buildProduct('b', [3])])).toBe(false);
  });

  it('honours a per-product minimum override', () => {
    expect(isCheckoutMinimumQuantityMet([buildProduct('a', [8], 10)])).toBe(false);
    expect(isCheckoutMinimumQuantityMet([buildProduct('a', [10], 10)])).toBe(true);
  });

  it('reports the smallest minimum the order could reach', () => {
    expect(getCheckoutMinimumQuantity([buildProduct('a', [2], 20), buildProduct('b', [2], 12)])).toBe(12);
  });

  it('blocks an empty cart', () => {
    expect(isCheckoutMinimumQuantityMet([])).toBe(false);
  });
});
