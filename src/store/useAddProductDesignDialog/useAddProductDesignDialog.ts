'use client';

import { create } from 'zustand';

import { useConfigurationCart } from '@store/useConfigurationCart';
import type { configuratorCatalogProductPickType } from '@types';

interface AddProductDesignDialogState {
  isOpen: boolean;
  pendingProduct: configuratorCatalogProductPickType | null;
  openWithProduct: (product: configuratorCatalogProductPickType) => void;
  close: () => void;
  confirm: (inheritDesign: boolean) => void;
}

const useAddProductDesignDialog = create<AddProductDesignDialogState>((set, get) => ({
  isOpen: false,
  pendingProduct: null,
  openWithProduct: (product) => {
    useConfigurationCart.getState().persistActiveItemSnapshot();
    set({ isOpen: true, pendingProduct: product });
  },
  close: () => set({ isOpen: false, pendingProduct: null }),
  confirm: (inheritDesign) => {
    const { pendingProduct } = get();
    if (!pendingProduct) return;

    useConfigurationCart.getState().addItem(pendingProduct, { inheritDesign });
    set({ isOpen: false, pendingProduct: null });
  },
}));

export { useAddProductDesignDialog };
