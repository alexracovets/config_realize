'use client';

import { CheckoutQuantityStepper } from '@molecules/CheckoutQuantityStepper';
import { CheckoutSizePopover } from '@molecules/CheckoutSizePopover';
import { CheckoutTableEditableCell } from '@molecules/CheckoutTableEditableCell';
import { CheckoutTestoEditableCell } from '@molecules/CheckoutTestoEditableCell';
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
  meta: { grow: true },
  cell: ({ row }) => <CheckoutTableEditableCell value={row.name} placeholder="Nome" canEdit onChange={(name) => onPatchRow(row.id, { name })} />,
});

const createNumberColumn = (onPatchRow: checkoutConfigurationTableColumnHandlersType['onPatchRow']): checkoutConfigurationTableColumnType => ({
  id: 'number',
  header: 'Numero',
  ...getColumnSizing('number'),
  cell: ({ row }) => (
    <CheckoutTableEditableCell
      value={row.number}
      placeholder="00"
      inputMode="numeric"
      maxLength={NUMBER_MAX_LENGTH}
      formatValue={sanitizeNumberText}
      canEdit
      onChange={(number) => onPatchRow(row.id, { number })}
    />
  ),
});

const createTestoColumn = (
  onPatchRow: checkoutConfigurationTableColumnHandlersType['onPatchRow'],
  testoMaxLength?: number,
  canEdit = false,
): checkoutConfigurationTableColumnType => ({
  id: 'testo',
  header: 'Testo',
  ...getColumnSizing('testo'),
  meta: { grow: true },
  cell: ({ row }) => (
    <CheckoutTestoEditableCell
      texts={row.testoTexts}
      maxLength={testoMaxLength}
      canEdit={canEdit}
      onChangeText={(index: number, testoText: string) => onPatchRow(row.id, { testoTextIndex: index, testoText })}
    />
  ),
});

const createCheckoutConfigurationTableColumns = ({
  onPatchRow,
  onRemoveRow,
  testoMaxLength,
  printAvailability,
}: checkoutConfigurationTableColumnHandlersType): checkoutConfigurationTableColumnType[] => {
  const showName = printAvailability?.hasName ?? false;
  const showNumber = printAvailability?.hasNumber ?? false;
  const showTesto = printAvailability?.hasTesto ?? false;

  return [
    {
      id: 'row',
      header: 'Riga',
      ...getColumnSizing('row'),
      cell: ({ index }) => <span className="text-[16px]">{index + 1}</span>,
    },
    {
      id: 'size',
      header: 'Taglia',
      ...getColumnSizing('size'),
      meta: { cellClassName: 'p-0' },
      cell: ({ row }) => <CheckoutSizePopover value={row.size} onChange={(size) => onPatchRow(row.id, { size })} />,
    },
    ...(showName ? [createNameColumn(onPatchRow)] : []),
    ...(showNumber ? [createNumberColumn(onPatchRow)] : []),
    ...(showTesto ? [createTestoColumn(onPatchRow, testoMaxLength, true)] : []),
    {
      id: 'quantity',
      header: 'Quantità',
      ...getColumnSizing('quantity'),
      cell: ({ row }) => (
        <CheckoutQuantityStepper
          quantity={row.quantity}
          onDecrease={() => onPatchRow(row.id, { quantity: row.quantity - 1 })}
          onIncrease={() => onPatchRow(row.id, { quantity: row.quantity + 1 })}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Modifica',
      ...getColumnSizing('actions'),
      cell: ({ row }) => (
        <Button type="button" variant="delete" size="delete" className="mx-auto" onClick={() => onRemoveRow(row.id)}>
          <SvgIcon name="delete" className="w-[14px] h-[15.75px]" />
          Eliminare
        </Button>
      ),
    },
  ];
};

export { createCheckoutConfigurationTableColumns };
