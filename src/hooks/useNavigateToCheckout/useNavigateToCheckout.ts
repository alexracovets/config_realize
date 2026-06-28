'use client';

import { useAppNavigate } from '@hooks/useAppNavigate';
import { useCheckout, useConfigurationCart } from '@store';
import { useCallback } from 'react';
const useNavigateToCheckout = () => {
  const { navigateToAppPath } = useAppNavigate();
  const persistActiveItemSnapshot = useConfigurationCart((state) => state.persistActiveItemSnapshot);
  const initializeFromCart = useCheckout((state) => state.initializeFromCart);

  const navigateToCheckout = useCallback(() => {
    persistActiveItemSnapshot();
    initializeFromCart();
    navigateToAppPath('/checkout');
  }, [initializeFromCart, navigateToAppPath, persistActiveItemSnapshot]);

  return { navigateToCheckout };
};

export { useNavigateToCheckout };
