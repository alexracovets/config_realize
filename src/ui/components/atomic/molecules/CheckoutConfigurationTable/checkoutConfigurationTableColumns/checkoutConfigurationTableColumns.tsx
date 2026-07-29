'use client';

import { FiEdit2 } from 'react-icons/fi';

import { CheckoutQuantityStepper } from '@molecules/CheckoutQuantityStepper';
import { CheckoutSizePopover } from '@molecules/CheckoutSizePopover';
import { CheckoutTableEditableCell } from '@molecules/CheckoutTableEditableCell';
import type { checkoutConfigurationTableColumnHandlersType, checkoutConfigurationTableColumnType } from '@types';
import { Button, SvgIcon } from '@atoms';
import { CHECKOUT_CONFIGURATION_TABLE_COLUMNS } from '@constants';
import { NUMBER_MAX_LENGTH, sanitizeNumberText } from '@store';

const getColumnSizing = (id: (typeof CHECKOUT_CONFIGURATION_TABLE_COLUMNS)[number]['id']) => {
  const column = CHECKOUT_CONFIGURATION_TABLE_COLUMNS.find((item) => item.id === id);

  if (!column) {
    throw new Error(`Unknown checkout configuration table column: ${id}`);
  }

  const { size, minSize } = column;

  return {
    size,
    minSize,
    ...('maxSize' in column ? { maxSize: column.maxSize } : {}),
  };
};

const createNameColumn = (onPatchRow: checkoutConfigurationTableColumnHandlersType['onPatchRow']): checkoutConfigurationTableColumnType => ({
  id: 'name',
  header: 'Nome',
  ...getColumnSizing('name'),
  cell: ({ row }) => (
    <>
      <span className="hidden max-sm:block text-[14px] text-default truncate">{row.name || '-'}</span>
      <div className="max-sm:hidden">
        <CheckoutTableEditableCell value={row.name} placeholder="Nome" canEdit onChange={(name) => onPatchRow(row.id, { name })} />
      </div>
    </>
  ),
});

const createNumberColumn = (onPatchRow: checkoutConfigurationTableColumnHandlersType['onPatchRow']): checkoutConfigurationTableColumnType => ({
  id: 'number',
  header: 'Numero',
  ...getColumnSizing('number'),
  cell: ({ row }) => (
    <>
      <span className="hidden max-sm:block text-[14px] text-default">{row.number || '-'}</span>
      <div className="max-sm:hidden">
        <CheckoutTableEditableCell
          value={row.number}
          placeholder="00"
          inputMode="numeric"
          maxLength={NUMBER_MAX_LENGTH}
          formatValue={sanitizeNumberText}
          canEdit
          onChange={(number) => onPatchRow(row.id, { number })}
        />
      </div>
    </>
  ),
});

const createCheckoutConfigurationTableColumns = ({
  onPatchRow,
  onRemoveRow,
  onEditRow,
  printAvailability,
}: checkoutConfigurationTableColumnHandlersType): checkoutConfigurationTableColumnType[] => {
  const showName = printAvailability?.hasName ?? false;
  const showNumber = printAvailability?.hasNumber ?? false;

  return [
    {
      id: 'row',
      header: 'Riga',
      ...getColumnSizing('row'),
      cell: ({ index }) => <span className="text-[16px] max-sm:text-[14px]">{index + 1}</span>,
    },
    {
      id: 'size',
      header: 'Taglia',
      ...getColumnSizing('size'),
      meta: { cellClassName: 'p-0 max-sm:p-2' },
      cell: ({ row }) => (
        <>
          <span className="hidden max-sm:block text-[14px] text-default">{row.size}</span>
          <div className="max-sm:hidden">
            <CheckoutSizePopover value={row.size} onChange={(size) => onPatchRow(row.id, { size })} />
          </div>
        </>
      ),
    },
    ...(showName ? [createNameColumn(onPatchRow)] : []),
    ...(showNumber ? [createNumberColumn(onPatchRow)] : []),
    {
      id: 'quantity',
      header: 'Quantità',
      ...getColumnSizing('quantity'),
      cell: ({ row }) => (
        <>
          <span className="hidden max-sm:block text-[14px] text-default">{row.quantity}</span>
          <div className="max-sm:hidden">
            <CheckoutQuantityStepper
              quantity={row.quantity}
              onDecrease={() => onPatchRow(row.id, { quantity: row.quantity - 1 })}
              onIncrease={() => onPatchRow(row.id, { quantity: row.quantity + 1 })}
            />
          </div>
        </>
      ),
    },
    {
      id: 'actions',
      header: 'Modifica',
      ...getColumnSizing('actions'),
      cell: ({ row }) => (
        <>
          <Button type="button" variant="delete" size="delete" className="mx-auto max-sm:hidden" onClick={() => onRemoveRow(row.id)}>
            <SvgIcon name="delete" className="w-3.5 h-[15.75px]" />
            Eliminare
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mx-auto hidden max-sm:flex size-8"
            onClick={() => onEditRow(row.id)}
            aria-label="Modifica riga"
          >
            <FiEdit2 className="size-4" />
          </Button>
        </>
      ),
    },
  ];
};

export { createCheckoutConfigurationTableColumns };
