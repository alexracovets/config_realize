'use client';

import { createCheckoutConfigurationTableColumns } from '@molecules/CheckoutConfigurationTable/checkoutConfigurationTableColumns';
import { getCheckoutColumnStyle } from '@molecules/CheckoutConfigurationTable/getCheckoutColumnStyle';
import { CheckoutRowEditModal } from '@molecules/CheckoutRowEditModal';
import type { checkoutConfigurationTablePropsType } from '@types';
import { AtomTable, AtomTableBody, AtomTableCell, AtomTableHead, AtomTableHeader, AtomTableRow, Box, Button, ScrollArea, SvgIcon } from '@atoms';
import { CHECKOUT_TABLE_ADD_ROW_LABEL } from '@constants';
import { useCheckoutConfigurationTable } from '@hooks';
import { cn } from '@utils';
import { useMemo, useState } from 'react';
const CheckoutConfigurationTable = ({ cartItemId, rows, printAvailability }: checkoutConfigurationTablePropsType) => {
  const { handleAddRow, handleRemoveRow, handlePatchRow } = useCheckoutConfigurationTable(cartItemId);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      createCheckoutConfigurationTableColumns({
        onPatchRow: handlePatchRow,
        onRemoveRow: handleRemoveRow,
        onEditRow: setEditingRowId,
        printAvailability,
      }),
    [handlePatchRow, handleRemoveRow, printAvailability],
  );

  const editingRow = rows.find((row) => row.id === editingRowId) ?? null;

  const tableMinWidth = useMemo(() => columns.reduce((total, column) => total + column.minSize, 0), [columns]);

  return (
    <Box variant="checkout_table_root">
      <Box variant="checkout_table_shell">
        <ScrollArea orientation="horizontal" className="w-full pb-0">
          <AtomTable variant="checkout" className="table-fixed w-full" style={{ minWidth: tableMinWidth }}>
            <AtomTableHeader>
              <AtomTableRow>
                {columns.map((column) => (
                  <AtomTableHead
                    key={column.id}
                    className={cn('max-sm:first:border-l-0 max-sm:last:border-r-0', column.meta?.headClassName)}
                    style={getCheckoutColumnStyle(column)}
                  >
                    {column.header}
                  </AtomTableHead>
                ))}
              </AtomTableRow>
            </AtomTableHeader>
            <AtomTableBody>
              {rows.map((row, index) => (
                <AtomTableRow key={row.id}>
                  {columns.map((column) => (
                    <AtomTableCell
                      key={column.id}
                      className={cn('max-sm:first:border-l-0 max-sm:last:border-r-0', column.meta?.cellClassName)}
                      style={getCheckoutColumnStyle(column)}
                    >
                      {column.cell({ row, index })}
                    </AtomTableCell>
                  ))}
                </AtomTableRow>
              ))}
            </AtomTableBody>
          </AtomTable>
        </ScrollArea>
      </Box>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'mt-4 border border-gray-20 bg-white',
          'max-sm:mt-0 max-sm:w-full max-sm:justify-start max-sm:gap-2 max-sm:rounded-none max-sm:rounded-b-lg max-sm:border-t-0 max-sm:border-[#D4D4D4] max-sm:px-3 max-sm:py-2.5 max-sm:text-[14px] max-sm:font-normal',
        )}
        onClick={handleAddRow}
      >
        <SvgIcon name="plus" className="max-sm:size-4" />
        {CHECKOUT_TABLE_ADD_ROW_LABEL}
      </Button>

      <CheckoutRowEditModal
        open={editingRowId !== null}
        onOpenChange={(open) => !open && setEditingRowId(null)}
        row={editingRow}
        printAvailability={printAvailability}
        onPatchRow={handlePatchRow}
        onRemoveRow={handleRemoveRow}
      />
    </Box>
  );
};

export { CheckoutConfigurationTable };
