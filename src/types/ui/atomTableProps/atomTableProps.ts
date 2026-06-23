import type { ComponentProps } from 'react';

import type { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@shared';

import type { atomTableVariantType } from '@types';

type atomTablePropsType = ComponentProps<typeof Table> & {
  variant?: atomTableVariantType;
};

type atomTableSectionPropsType = ComponentProps<typeof TableHeader> & {
  variant?: atomTableVariantType;
};

type atomTableBodyPropsType = ComponentProps<typeof TableBody> & {
  variant?: atomTableVariantType;
};

type atomTableFooterPropsType = ComponentProps<typeof TableFooter> & {
  variant?: atomTableVariantType;
};

type atomTableRowPropsType = ComponentProps<typeof TableRow> & {
  variant?: atomTableVariantType;
};

type atomTableHeadPropsType = ComponentProps<typeof TableHead> & {
  variant?: atomTableVariantType;
};

type atomTableCellPropsType = ComponentProps<typeof TableCell> & {
  variant?: atomTableVariantType;
};

type atomTableCaptionPropsType = ComponentProps<typeof TableCaption> & {
  variant?: atomTableVariantType;
};

export type {
  atomTableBodyPropsType,
  atomTableCaptionPropsType,
  atomTableCellPropsType,
  atomTableFooterPropsType,
  atomTableHeadPropsType,
  atomTablePropsType,
  atomTableRowPropsType,
  atomTableSectionPropsType,
};
