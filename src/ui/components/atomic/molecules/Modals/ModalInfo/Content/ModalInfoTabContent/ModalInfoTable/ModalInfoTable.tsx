'use client';

import { MdDoubleArrow } from 'react-icons/md';

import { AtomTable, AtomTableBody, AtomTableCell, AtomTableHead, AtomTableHeader, AtomTableRow } from '@atoms';
import type { modalInfoTableColumnType, modalInfoTablePropsType } from '@types';
import { cn } from '@utils';

const headerBaseClassName = 'bg-gray-100 font-medium text-[16px] leading-none';
const sizeHeaderClassName = cn(headerBaseClassName, 'text-center');
const discountsHeaderClassName = cn(headerBaseClassName, 'w-1/2 text-left');
const subHeaderClassName = cn(headerBaseClassName, 'px-3 py-1 text-center font-normal text-[14px] leading-none');
const rowLabelClassName = 'bg-white text-center font-normal';
const sizeDataCellClassName = 'bg-white text-center font-normal';
const discountsDataCellClassName = 'w-1/2 bg-white text-left font-normal whitespace-normal';

const renderCellContent = ({
  rowIcon,
  variant,
  value,
}: {
  rowIcon?: modalInfoTablePropsType['part']['rowIcon'];
  variant: modalInfoTablePropsType['part']['variant'];
  value: string | number;
}) => {
  if (variant === 'discounts' && rowIcon === 'doubleArrow') {
    return (
      <span className="flex items-center gap-2">
        <MdDoubleArrow aria-hidden size={20} className="shrink-0 text-default" />
        {value}
      </span>
    );
  }

  return value;
};

const ModalInfoTable = ({ part }: modalInfoTablePropsType) => {
  const { columns, data, variant = 'default', rowIcon } = part;
  const isSizeChart = variant === 'size_chart';
  const [labelColumn, ...sizeColumns] = columns;
  const hasSubHeaders = isSizeChart && sizeColumns.some((column) => column.subHeader);

  return (
    <div className="w-full min-w-0 self-stretch overflow-x-auto">
      <AtomTable variant={variant}>
        <AtomTableHeader>
          {hasSubHeaders ? (
            <>
              <AtomTableRow>
                <AtomTableHead rowSpan={2} className={sizeHeaderClassName}>
                  {labelColumn.header}
                </AtomTableHead>
                {sizeColumns.map((column) =>
                  column.subHeader ? (
                    <AtomTableHead key={column.id} className={sizeHeaderClassName}>
                      {column.header}
                    </AtomTableHead>
                  ) : (
                    <AtomTableHead key={column.id} rowSpan={2} className={sizeHeaderClassName}>
                      {column.header}
                    </AtomTableHead>
                  ),
                )}
              </AtomTableRow>
              <AtomTableRow>
                {sizeColumns
                  .filter((column) => column.subHeader)
                  .map((column) => (
                    <AtomTableHead key={column.id} className={subHeaderClassName}>
                      {column.subHeader}
                    </AtomTableHead>
                  ))}
              </AtomTableRow>
            </>
          ) : (
            <AtomTableRow>
              {columns.map((column: modalInfoTableColumnType) => (
                <AtomTableHead key={column.id} className={variant === 'discounts' ? discountsHeaderClassName : sizeHeaderClassName}>
                  {column.header}
                </AtomTableHead>
              ))}
            </AtomTableRow>
          )}
        </AtomTableHeader>
        <AtomTableBody>
          {data.map((row, rowIndex) => (
            <AtomTableRow key={rowIndex}>
              {columns.map((column) => (
                <AtomTableCell
                  key={column.id}
                  className={
                    isSizeChart && column.accessorKey === 'label'
                      ? rowLabelClassName
                      : variant === 'discounts'
                        ? discountsDataCellClassName
                        : sizeDataCellClassName
                  }
                >
                  {renderCellContent({ rowIcon, variant, value: row[column.accessorKey] })}
                </AtomTableCell>
              ))}
            </AtomTableRow>
          ))}
        </AtomTableBody>
      </AtomTable>
    </div>
  );
};

export { ModalInfoTable };
