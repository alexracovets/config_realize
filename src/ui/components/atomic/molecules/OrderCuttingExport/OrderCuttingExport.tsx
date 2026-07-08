'use client';

import { useEffect, useState } from 'react';

import { CHECKOUT_CUTTING_EXPORT_LABEL, CHECKOUT_CUTTING_EXPORT_LOADING_LABEL } from '@constants';
import { useOrderCuttingExport } from '@hooks';
import { Button } from '@atoms';
import { OrderCuttingExportDocument } from '@molecules/OrderCuttingExportPreview/OrderCuttingExportDocument';

const OrderCuttingExport = () => {
  const { documentRef, exportData, exportCuttingOrder, isExporting } = useOrderCuttingExport();
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsDocumentReady(true);
    }, 100);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={() => void exportCuttingOrder()}
        disabled={isExporting || !isDocumentReady}
        aria-busy={isExporting}
        data-testid="checkout-cutting-export-button"
        className="inline-flex h-12 items-center gap-2 rounded-[8px] border border-gray-20 bg-white px-8 text-[16px] font-semibold text-default hover:bg-gray-100"
      >
        {isExporting ? (
          <>
            <span
              aria-hidden
              className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            {CHECKOUT_CUTTING_EXPORT_LOADING_LABEL}
          </>
        ) : (
          CHECKOUT_CUTTING_EXPORT_LABEL
        )}
      </Button>

      {isDocumentReady ? (
        <div
          ref={documentRef}
          data-testid="order-cutting-export-host"
          aria-hidden
          className="pointer-events-none fixed top-0 left-[-9999px] w-[794px] opacity-0"
        >
          <OrderCuttingExportDocument exportData={exportData} variant="pdf" />
        </div>
      ) : null}
    </>
  );
};

export { OrderCuttingExport };
