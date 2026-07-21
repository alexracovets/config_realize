import type { printReferenceCmType } from '@types';

import type { sizeChartMetafieldsNodeType } from '@shopify/mapSizeChartContent';

const REFERENCE_SIZE = 'L';

const HEIGHT_ROW_LABEL = 'ALTEZZA';

type sizeChartTableColumnJsonType = {
  id: string;
  header: string;
};

type sizeChartTableRowJsonType = {
  label: string;
  values: Record<string, string | number>;
};

type sizeChartTableJsonType = {
  columns: sizeChartTableColumnJsonType[];
  rows: sizeChartTableRowJsonType[];
};

const toNumber = (value: string | number | undefined): number | null => {
  if (value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalize = (value: string): string => value.trim().toUpperCase();

const resolveSizeReferenceCm = (node: sizeChartMetafieldsNodeType): printReferenceCmType | null => {
  const raw = node.tableMetafield?.value;
  if (!raw) return null;

  let parsed: sizeChartTableJsonType;
  try {
    parsed = JSON.parse(raw) as sizeChartTableJsonType;
  } catch {
    return null;
  }
  if (!Array.isArray(parsed.columns) || !Array.isArray(parsed.rows)) return null;

  const referenceColumn = parsed.columns.find((column) => normalize(column.header) === REFERENCE_SIZE || normalize(column.id) === REFERENCE_SIZE);
  if (!referenceColumn) return null;

  const heightRow = parsed.rows.find((row) => normalize(row.label) === HEIGHT_ROW_LABEL);
  const widthRow = parsed.rows.find((row) => normalize(row.label) !== HEIGHT_ROW_LABEL);
  if (!heightRow || !widthRow) return null;

  const heightCm = toNumber(heightRow.values?.[referenceColumn.id]);
  const widthCm = toNumber(widthRow.values?.[referenceColumn.id]);
  if (heightCm === null || widthCm === null) return null;

  return { heightCm, widthCm };
};

export { resolveSizeReferenceCm };
