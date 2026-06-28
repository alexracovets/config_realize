import type { checkoutLineRowPatchType, checkoutLineRowType, checkoutPrintAvailabilityType, checkoutProductType } from '@types';
import type { ReactNode } from 'react';
interface checkoutProductCardPropsType {
  product: checkoutProductType;
}

interface checkoutConfigurationTablePropsType {
  cartItemId: string;
  rows: checkoutProductType['rows'];
  testoMaxLength?: number;
  printAvailability?: checkoutPrintAvailabilityType;
}

interface checkoutConfigurationTableColumnHandlersType {
  onPatchRow: (rowId: string, patch: checkoutLineRowPatchType) => void;
  onRemoveRow: (rowId: string) => void;
  testoMaxLength?: number;
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
    grow?: boolean;
  };
  cell: (context: checkoutConfigurationTableCellContextType) => ReactNode;
}

interface checkoutQuantityStepperPropsType {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
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

interface checkoutTestoEditableCellPropsType {
  texts: string[];
  maxLength?: number;
  canEdit?: boolean;
  onChangeText: (index: number, value: string) => void;
}

interface checkoutTablePlaceholderPropsType {
  className?: string;
}

export type {
  checkoutConfigurationTableCellContextType,
  checkoutConfigurationTableColumnHandlersType,
  checkoutConfigurationTableColumnType,
  checkoutConfigurationTablePropsType,
  checkoutProductCardPropsType,
  checkoutQuantityStepperPropsType,
  checkoutSizePopoverPropsType,
  checkoutTableEditableCellPropsType,
  checkoutTablePlaceholderPropsType,
  checkoutTestoEditableCellPropsType,
};
