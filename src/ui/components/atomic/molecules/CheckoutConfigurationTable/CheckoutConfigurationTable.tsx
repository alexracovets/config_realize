'use client';

import { useMemo } from 'react';

import { AtomTable, AtomTableBody, AtomTableCell, AtomTableHead, AtomTableHeader, AtomTableRow, Button, SvgIcon } from '@atoms';

import { CHECKOUT_TABLE_ADD_ROW_LABEL } from '@constants';
import { useCheckoutConfigurationTable } from '@hooks';
import type { checkoutConfigurationTablePropsType } from '@types';
import { cn } from '@utils';

import { createCheckoutConfigurationTableColumns } from './checkoutConfigurationTableColumns';
import { getCheckoutColumnStyle } from './getCheckoutColumnStyle';

const CheckoutConfigurationTable = ({ cartItemId, rows, testoMaxLength, printAvailability }: checkoutConfigurationTablePropsType) => {
  const { handleAddRow, handleRemoveRow, handlePatchRow } = useCheckoutConfigurationTable(cartItemId);

  const columns = useMemo(
    () =>
      createCheckoutConfigurationTableColumns({
        onPatchRow: handlePatchRow,
        onRemoveRow: handleRemoveRow,
        testoMaxLength,
        printAvailability,
      }),
    [handlePatchRow, handleRemoveRow, testoMaxLength, printAvailability],
  );

  const tableMinWidth = useMemo(() => columns.reduce((total, column) => total + column.minSize, 0), [columns]);

  return (
    <div className="w-full min-w-0">
      <AtomTable variant="checkout" className="table-fixed w-full" style={{ minWidth: tableMinWidth }}>
        <AtomTableHeader>
          <AtomTableRow>
            {columns.map((column) => (
              <AtomTableHead key={column.id} style={getCheckoutColumnStyle(column)}>
                {column.header}
              </AtomTableHead>
            ))}
          </AtomTableRow>
        </AtomTableHeader>
        <AtomTableBody>
          {rows.map((row, index) => (
            <AtomTableRow key={row.id}>
              {columns.map((column) => (
                <AtomTableCell key={column.id} className={cn(column.meta?.cellClassName)} style={getCheckoutColumnStyle(column)}>
                  {column.cell({ row, index })}
                </AtomTableCell>
              ))}
            </AtomTableRow>
          ))}
        </AtomTableBody>
      </AtomTable>

      <Button type="button" variant="ghost" size="sm" className="mt-4 border border-gray-20 bg-white" onClick={handleAddRow}>
        <SvgIcon name="plus" />
        {CHECKOUT_TABLE_ADD_ROW_LABEL}
      </Button>
    </div>
  );
};

export { CheckoutConfigurationTable };
