import type { checkoutLineRowPatchType, checkoutLineRowType, checkoutPrintAvailabilityType, checkoutProductType } from '@types';
import type { ReactNode } from 'react';
interface checkoutProductCardPropsType {
  product: checkoutProductType;
}

interface checkoutConfigurationTablePropsType {
  cartItemId: string;
  rows: checkoutProductType['rows'];
  printAvailability?: checkoutPrintAvailabilityType;
}

interface checkoutConfigurationTableColumnHandlersType {
  onPatchRow: (rowId: string, patch: checkoutLineRowPatchType) => void;
  onRemoveRow: (rowId: string) => void;
  onEditRow: (rowId: string) => void;
  printAvailability?: checkoutPrintAvailabilityType;
}

interface checkoutConfigurationTableCellContextType {
  row: checkoutLineRowType;
  index: number;
}

interface checkoutConfigurationTableColumnType {
  id: string;
  header: string;
  size: number;
  minSize: number;
  maxSize?: number;
  meta?: {
    cellClassName?: string;
    headClassName?: string;
    grow?: boolean;
  };
  cell: (context: checkoutConfigurationTableCellContextType) => ReactNode;
}

interface checkoutQuantityStepperPropsType {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseIconClassName?: string;
  increaseIconClassName?: string;
}

interface checkoutSizePopoverPropsType {
  value: string;
  onChange: (size: string) => void;
}

interface checkoutTableEditableCellPropsType {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  formatValue?: (value: string) => string;
  inputMode?: 'text' | 'numeric';
  maxLength?: number;
  layout?: 'centered' | 'spread';
  canEdit?: boolean;
}

interface checkoutTablePlaceholderPropsType {
  className?: string;
}

interface checkoutRowEditModalPropsType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: checkoutLineRowType | null;
  printAvailability?: checkoutPrintAvailabilityType;
  onPatchRow: (rowId: string, patch: checkoutLineRowPatchType) => void;
  onRemoveRow: (rowId: string) => void;
}

export type {
  checkoutConfigurationTableCellContextType,
  checkoutConfigurationTableColumnHandlersType,
  checkoutConfigurationTableColumnType,
  checkoutConfigurationTablePropsType,
  checkoutProductCardPropsType,
  checkoutQuantityStepperPropsType,
  checkoutRowEditModalPropsType,
  checkoutSizePopoverPropsType,
  checkoutTableEditableCellPropsType,
  checkoutTablePlaceholderPropsType,
};
