'use client';

import { captureGarmentConfiguration, useConfigurationCart } from '@store/useConfigurationCart';
import { sanitizeNumberText } from '@store/useGarmentNumber';
import { buildCheckoutRows, createCheckoutRowFromPreset, extractCheckoutRowPreset } from '@store/useCheckout/buildCheckoutRows';
import { scheduleCheckoutPreviewCapture } from '@configurator';
import { applyCheckoutFirstRowToConfiguration } from '@store/useCheckout/applyCheckoutFirstRowToConfiguration';
import { isNonemptyPrintText } from '@store/useCheckout/extractUniqueTestoTexts';
import { getCheckoutDiscountPercent, getProductRowQuantity, getProductsSubtotal, getProductUnitPrice } from '@store/useCheckout/checkoutPricing';
import { resolveCheckoutPrintAvailability } from '@store/useCheckout/resolveCheckoutPrintAvailability';
import type { checkoutLineRowPatchType, checkoutLineRowType, checkoutProductType } from '@types';
import { clampCheckoutRowQuantity } from '@constants';
import { getModel } from '@utils';
import { create } from 'zustand';
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

const maybeSyncFirstRowPreview = (cartItemId: string, rowId: string, rows: checkoutLineRowType[]) => {
  const firstRow = rows[0];
  if (!firstRow || firstRow.id !== rowId) return;

  const cart = useConfigurationCart.getState();
  const configuration = cart.getConfiguration(cartItemId);
  if (!configuration) return;

  cart.saveConfiguration(cartItemId, applyCheckoutFirstRowToConfiguration(configuration, firstRow));
  scheduleCheckoutPreviewCapture(cartItemId);
};

const useCheckout = create<CheckoutState>((set, get) => ({
  products: [],

  initializeFromCart: () => {
    const cartState = useConfigurationCart.getState();
    const activeConfiguration = captureGarmentConfiguration();
    const configurations = {
      ...cartState.configurations,
      [cartState.activeItemId]: activeConfiguration,
    };

    const products = cartState.items
      .filter((item) => !item.isPlaceholder)
      .map((item) => {
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
    const garment = cartItem ? getModel(cartItem.modelId) : undefined;
    const printAvailability = resolveCheckoutPrintAvailability(garment);

    if (isTestoTextPatch) {
      if (!printAvailability.hasTesto) return;

      set((state) => ({
        products: state.products.map((product) => {
          if (product.cartItemId !== cartItemId) return product;

          const rows = product.rows.map((row) => {
            if (row.id !== rowId) return row;

            const testoTexts = [...row.testoTexts];
            const trimmedText = patch.testoText!.trim();
            const textIndex = patch.testoTextIndex!;

            if (!isNonemptyPrintText(trimmedText)) {
              if (textIndex < testoTexts.length) {
                testoTexts.splice(textIndex, 1);
              }
            } else {
              testoTexts[textIndex] = trimmedText;
            }

            return { ...row, testoTexts };
          });

          return { ...product, rows };
        }),
      }));

      const checkoutProduct = get().products.find((entry) => entry.cartItemId === cartItemId);
      if (checkoutProduct) maybeSyncFirstRowPreview(cartItemId, rowId, checkoutProduct.rows);
      return;
    }

    if (patch.name !== undefined) {
      normalizedPatch.name = patch.name.trim();
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

    const checkoutProduct = get().products.find((entry) => entry.cartItemId === cartItemId);
    if (checkoutProduct) maybeSyncFirstRowPreview(cartItemId, rowId, checkoutProduct.rows);
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
