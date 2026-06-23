'use client';

import { useEffect } from 'react';

import { useCheckout } from '@store';

const useCheckoutInit = () => {
  const initializeFromCart = useCheckout((state) => state.initializeFromCart);

  useEffect(() => {
    initializeFromCart();
  }, [initializeFromCart]);
};

export { useCheckoutInit };
