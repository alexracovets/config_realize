'use client';

import type { checkoutProductType } from '@types';

const getProductRowQuantity = (product: checkoutProductType) => product.rows.reduce((sum, row) => sum + row.quantity, 0);

const getCheckoutDiscountPercent = (totalQuantity: number): number => {
  if (totalQuantity >= 110) return 10;
  if (totalQuantity >= 81) return 7;
  if (totalQuantity >= 51) return 5;
  if (totalQuantity >= 26) return 3;
  return 0;
};

const getProductUnitPrice = (product: checkoutProductType) => product.business.price;

const getProductsSubtotal = (products: checkoutProductType[]) =>
  products.reduce((sum, product) => {
    const unitPrice = getProductUnitPrice(product);
    const quantity = getProductRowQuantity(product);
    return sum + unitPrice * quantity;
  }, 0);

export { getCheckoutDiscountPercent, getProductRowQuantity, getProductUnitPrice, getProductsSubtotal };
