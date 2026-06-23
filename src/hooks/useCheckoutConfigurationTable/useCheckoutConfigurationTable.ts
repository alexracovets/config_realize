'use client';

import { useCallback } from 'react';

import type { checkoutLineRowPatchType } from '@types';
import { useCheckout } from '@store';

const useCheckoutConfigurationTable = (cartItemId: string) => {
  const addRow = useCheckout((state) => state.addRow);
  const removeRow = useCheckout((state) => state.removeRow);
  const updateRow = useCheckout((state) => state.updateRow);

  const handleAddRow = useCallback(() => {
    addRow(cartItemId);
  }, [addRow, cartItemId]);

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      removeRow(cartItemId, rowId);
    },
    [cartItemId, removeRow],
  );

  const handlePatchRow = useCallback(
    (rowId: string, patch: checkoutLineRowPatchType) => {
      updateRow(cartItemId, rowId, patch);
    },
    [cartItemId, updateRow],
  );

  return {
    handleAddRow,
    handleRemoveRow,
    handlePatchRow,
  };
};

export { useCheckoutConfigurationTable };
