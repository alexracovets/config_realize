'use client';

import { createContext, useContext } from 'react';

import { cva } from 'class-variance-authority';

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@shared';
import type {
  atomTableBodyPropsType,
  atomTableCaptionPropsType,
  atomTableCellPropsType,
  atomTableFooterPropsType,
  atomTableHeadPropsType,
  atomTablePropsType,
  atomTableRowPropsType,
  atomTableSectionPropsType,
  atomTableVariantType,
} from '@types';
import { cn } from '@utils';

const AtomTableVariantContext = createContext<atomTableVariantType>('default');

const useAtomTableVariant = () => useContext(AtomTableVariantContext);

const atomTableVariants = cva('w-full caption-bottom', {
  variants: {
    variant: {
      default: 'text-sm',
      size_chart: 'w-full border-collapse border border-gray-20 text-center font-inter text-[14px] leading-none text-default',
      discounts: 'w-full table-fixed border-collapse border border-gray-20 text-left font-inter text-[14px] leading-none text-default',
      checkout: 'w-full border-collapse font-inter text-[14px] leading-none text-default',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTableHeaderVariants = cva('', {
  variants: {
    variant: {
      default: '',
      size_chart: '[&_tr]:border-b-0',
      discounts: '[&_tr]:border-b-0',
      checkout: '[&_tr]:border-b-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTableBodyVariants = cva('', {
  variants: {
    variant: {
      default: '',
      size_chart: '[&_tr:last-child]:border-0',
      discounts: '[&_tr:last-child]:border-0',
      checkout: '[&_tr:last-child]:border-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTableRowVariants = cva('transition-colors', {
  variants: {
    variant: {
      default: 'border-b hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
      size_chart: 'border-b-0 hover:bg-transparent',
      discounts: 'border-b-0 hover:bg-transparent',
      checkout: 'border-b-0 hover:bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTableHeadVariants = cva('align-middle font-medium whitespace-nowrap text-foreground', {
  variants: {
    variant: {
      default: 'h-10 px-2 text-left [&:has([role=checkbox])]:pr-0',
      size_chart:
        'h-auto border border-gray-20 bg-gray-100 px-3 py-4 text-center align-middle font-medium text-[16px] leading-none text-default whitespace-normal',
      discounts:
        'h-auto border border-gray-20 bg-gray-100 px-3 py-4 text-left align-middle font-medium text-[16px] leading-none text-default whitespace-normal',
      checkout:
        'h-auto border border-gray-20 bg-gray-100 px-3 py-3 text-center align-middle font-medium text-[16px] leading-none text-default whitespace-normal',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTableCellVariants = cva('align-middle', {
  variants: {
    variant: {
      default: 'p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0',
      size_chart: 'border border-gray-20 bg-white px-3 py-4 text-center align-middle font-normal text-[14px] leading-none text-default whitespace-normal',
      discounts: 'border border-gray-20 bg-white px-3 py-4 text-left align-middle font-normal text-[14px] leading-none text-default whitespace-normal',
      checkout: 'border border-gray-20 bg-white px-2 py-2 text-center align-middle font-normal text-[14px] leading-none text-default whitespace-normal',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTableCaptionVariants = cva('mt-4 text-sm', {
  variants: {
    variant: {
      default: 'text-muted-foreground',
      size_chart: 'text-gray text-left',
      discounts: 'text-gray text-left',
      checkout: 'text-gray text-left',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const AtomTable = ({ className, variant = 'default', children, ...props }: atomTablePropsType) => {
  return (
    <AtomTableVariantContext.Provider value={variant ?? 'default'}>
      <Table className={cn(atomTableVariants({ variant }), className)} {...props}>
        {children}
      </Table>
    </AtomTableVariantContext.Provider>
  );
};

const AtomTableHeader = ({ className, variant: variantProp, ...props }: atomTableSectionPropsType) => {
  const contextVariant = useAtomTableVariant();
  const variant = variantProp ?? contextVariant;

  return <TableHeader className={cn(atomTableHeaderVariants({ variant }), className)} {...props} />;
};

const AtomTableBody = ({ className, variant: variantProp, ...props }: atomTableBodyPropsType) => {
  const contextVariant = useAtomTableVariant();
  const variant = variantProp ?? contextVariant;

  return <TableBody className={cn(atomTableBodyVariants({ variant }), className)} {...props} />;
};

const AtomTableFooter = ({ className, variant: variantProp, ...props }: atomTableFooterPropsType) => {
  const contextVariant = useAtomTableVariant();
  const variant = variantProp ?? contextVariant;

  return <TableFooter className={cn(atomTableBodyVariants({ variant }), className)} {...props} />;
};

const AtomTableRow = ({ className, variant: variantProp, ...props }: atomTableRowPropsType) => {
  const contextVariant = useAtomTableVariant();
  const variant = variantProp ?? contextVariant;

  return <TableRow className={cn(atomTableRowVariants({ variant }), className)} {...props} />;
};

const AtomTableHead = ({ className, variant: variantProp, ...props }: atomTableHeadPropsType) => {
  const contextVariant = useAtomTableVariant();
  const variant = variantProp ?? contextVariant;

  return <TableHead className={cn(atomTableHeadVariants({ variant }), className)} {...props} />;
};

const AtomTableCell = ({ className, variant: variantProp, ...props }: atomTableCellPropsType) => {
  const contextVariant = useAtomTableVariant();
  const variant = variantProp ?? contextVariant;

  return <TableCell className={cn(atomTableCellVariants({ variant }), className)} {...props} />;
};

const AtomTableCaption = ({ className, variant: variantProp, ...props }: atomTableCaptionPropsType) => {
  const contextVariant = useAtomTableVariant();
  const variant = variantProp ?? contextVariant;

  return <TableCaption className={cn(atomTableCaptionVariants({ variant }), className)} {...props} />;
};

export {
  AtomTable,
  AtomTableHeader,
  AtomTableBody,
  AtomTableFooter,
  AtomTableHead,
  AtomTableRow,
  AtomTableCell,
  AtomTableCaption,
  atomTableVariants,
  atomTableHeaderVariants,
  atomTableBodyVariants,
  atomTableRowVariants,
  atomTableHeadVariants,
  atomTableCellVariants,
  atomTableCaptionVariants,
};
