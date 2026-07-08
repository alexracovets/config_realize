'use client';

import { useEffect, useMemo } from 'react';

import { buildOrderCuttingExport } from '@utils/buildOrderCuttingExport';
import { buildOrderCuttingExportPreview } from '@utils/buildOrderCuttingExportPreview';
import { useCheckout } from '@store/useCheckout/useCheckout';
import { useConfigurationCart } from '@store/useConfigurationCart/useConfigurationCart';
import { OrderCuttingExportDocument } from '@molecules/OrderCuttingExportPreview/OrderCuttingExportDocument';

const OrderCuttingExportPreview = () => {
  const checkoutProducts = useCheckout((state) => state.products);
  const cartConfigurations = useConfigurationCart((state) => state.configurations);
  const initializeFromCart = useCheckout((state) => state.initializeFromCart);

  useEffect(() => {
    if (checkoutProducts.length === 0) {
      initializeFromCart();
    }
  }, [checkoutProducts.length, initializeFromCart]);

  const exportData = useMemo(() => {
    if (checkoutProducts.length === 0) {
      return buildOrderCuttingExportPreview();
    }

    return buildOrderCuttingExport({
      products: checkoutProducts,
      configurations: cartConfigurations,
      orderNumber: '#PREVIEW',
      orderDate: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }, [cartConfigurations, checkoutProducts]);

  return (
    <div className="bg-[#ececec] py-10">
      <div className="mx-auto w-fit max-w-full shadow-lg">
        <OrderCuttingExportDocument exportData={exportData} />
      </div>
    </div>
  );
};

export { OrderCuttingExportPreview };
