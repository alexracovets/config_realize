'use client';

import type { checkoutLineRowPatchType, checkoutProductType } from '@types';

import { clampCheckoutRowQuantity } from '@constants';
import { getModel } from '@utils';
import { create } from 'zustand';

import { captureGarmentConfiguration, useConfigurationCart } from '../useConfigurationCart';
import { sanitizeNumberText } from '../useGarmentNumber';

import { buildCheckoutRows, createCheckoutRowFromPreset, extractCheckoutRowPreset } from './buildCheckoutRows';
import { getCheckoutDiscountPercent, getProductRowQuantity, getProductsSubtotal, getProductUnitPrice } from './checkoutPricing';
import { resolveCheckoutPrintAvailability } from './resolveCheckoutPrintAvailability';

interface CheckoutState {
  products: checkoutProductType[];
  initializeFromCart: () => void;
  addRow: (cartItemId: string) => void;
  removeRow: (cartItemId: string, rowId: string) => void;
  updateRow: (cartItemId: string, rowId: string, patch: checkoutLineRowPatchType) => void;
  getProductQuantity: (cartItemId: string) => number;
  getGrandTotalQuantity: () => number;
  getProductSubtotal: (cartItemId: string) => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getDiscountPercent: () => number;
  getDiscountAmount: () => number;
  getGrandTotal: () => number;
}

const useCheckout = create<CheckoutState>((set, get) => ({
  products: [],

  initializeFromCart: () => {
    const cartState = useConfigurationCart.getState();
    const activeConfiguration = captureGarmentConfiguration();
    const configurations = {
      ...cartState.configurations,
      [cartState.activeItemId]: activeConfiguration,
    };

    const products = cartState.items.map((item) => {
      const rowPreset = extractCheckoutRowPreset(configurations[item.id]);

      return {
        cartItemId: item.id,
        modelId: item.modelId,
        business: item.business,
        rowPreset,
        rows: buildCheckoutRows(configurations[item.id]),
      };
    });

    set({ products });
  },

  addRow: (cartItemId) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.cartItemId === cartItemId
          ? {
              ...product,
              rows: [...product.rows, createCheckoutRowFromPreset(product.rowPreset)],
            }
          : product,
      ),
    }));
  },

  removeRow: (cartItemId, rowId) => {
    set((state) => ({
      products: state.products.map((product) => {
        if (product.cartItemId !== cartItemId || product.rows.length <= 1) return product;
        return {
          ...product,
          rows: product.rows.filter((row) => row.id !== rowId),
        };
      }),
    }));
  },

  updateRow: (cartItemId, rowId, patch) => {
    const normalizedPatch: checkoutLineRowPatchType = { ...patch };

    if (patch.quantity !== undefined) {
      normalizedPatch.quantity = clampCheckoutRowQuantity(patch.quantity);
    }

    if (patch.number !== undefined) {
      normalizedPatch.number = sanitizeNumberText(patch.number);
    }

    const isTestoTextPatch = patch.testoTextIndex !== undefined && patch.testoText !== undefined;
    const cartState = useConfigurationCart.getState();
    const cartItem = cartState.items.find((item) => item.id === cartItemId);
    const product = cartItem ? getModel(cartItem.modelId) : undefined;
    const printAvailability = resolveCheckoutPrintAvailability(product);

    if (isTestoTextPatch) {
      if (!printAvailability.hasTesto) return;

      set((state) => ({
        products: state.products.map((product) => {
          if (product.cartItemId !== cartItemId) return product;

          const rows = product.rows.map((row) => {
            if (row.id !== rowId) return row;

            const testoTexts = [...row.testoTexts];
            testoTexts[patch.testoTextIndex!] = patch.testoText!;

            return { ...row, testoTexts };
          });

          return { ...product, rows };
        }),
      }));
      return;
    }

    if (patch.name !== undefined && !printAvailability.hasName) {
      delete normalizedPatch.name;
    }

    if (patch.number !== undefined && !printAvailability.hasNumber) {
      delete normalizedPatch.number;
    }

    if (Object.keys(normalizedPatch).length === 0) return;

    set((state) => ({
      products: state.products.map((product) => {
        if (product.cartItemId !== cartItemId) return product;

        const rows = product.rows.map((row) => (row.id === rowId ? { ...row, ...normalizedPatch } : row));

        return { ...product, rows };
      }),
    }));
  },

  getProductQuantity: (cartItemId) => {
    const product = get().products.find((item) => item.cartItemId === cartItemId);
    if (!product) return 0;
    return getProductRowQuantity(product);
  },

  getGrandTotalQuantity: () => get().products.reduce((sum, product) => sum + getProductRowQuantity(product), 0),

  getProductSubtotal: (cartItemId) => {
    const product = get().products.find((item) => item.cartItemId === cartItemId);
    if (!product) return 0;
    return getProductUnitPrice(product) * getProductRowQuantity(product);
  },

  getSubtotal: () => getProductsSubtotal(get().products),

  getShippingCost: () => 0,

  getDiscountPercent: () => getCheckoutDiscountPercent(get().getGrandTotalQuantity()),

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    const discountPercent = get().getDiscountPercent();
    return subtotal * (discountPercent / 100);
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingCost();
    return Math.max(subtotal - discount + shipping, 0);
  },
}));

export { useCheckout };
