'use client';

import { useOrderCuttingExport } from '@hooks';
import { OrderCuttingExportDocument } from '@molecules/OrderCuttingExportPreview/OrderCuttingExportDocument';

/** Offscreen cutting-pattern document captured by `useSubmitCheckout` when the customer clicks Prosegui. */
const OrderCuttingExport = () => {
  const { documentRef, exportData } = useOrderCuttingExport();

  return (
    <div ref={documentRef} data-testid="order-cutting-export-host" aria-hidden className="pointer-events-none fixed top-0 left-[-9999px] w-[794px] opacity-0">
      <OrderCuttingExportDocument exportData={exportData} variant="pdf" />
    </div>
  );
};

export { OrderCuttingExport };
