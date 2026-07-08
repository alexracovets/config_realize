'use client';

import { useEffect } from 'react';

import { useCheckoutOrderExport } from '@hooks';
import { registerCheckoutE2eDebug } from '@store/useCheckout/registerCheckoutE2eDebug';
import { CheckoutOrderExportDocument } from '@molecules/CheckoutOrderExport/CheckoutOrderExportDocument';

/** Offscreen order-confirmation document captured by `useSubmitCheckout` when the customer clicks Prosegui. */
const CheckoutOrderExport = () => {
  const { documentRef, exportData } = useCheckoutOrderExport();

  useEffect(() => registerCheckoutE2eDebug(), []);

  return (
    <div
      ref={documentRef}
      data-testid="checkout-order-export-host"
      aria-hidden
      className="pointer-events-none fixed top-0 left-[-9999px] w-[794px] overflow-hidden opacity-0"
    >
      <CheckoutOrderExportDocument exportData={exportData} />
    </div>
  );
};

export { CheckoutOrderExport };
