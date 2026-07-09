import type { printReferenceCmType } from '@types';

import type { sizeChartMetafieldsNodeType } from './mapSizeChartContent';

/** Size chart column whose header (or id) marks the reference L size. */
const REFERENCE_SIZE = 'L';
/** Size chart row that provides the body height. */
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

/**
 * Extracts the L-size body height (ALTEZZA) and width (TORACE/VITA) in cm from the raw
 * `custom.tabella_taglie_table` metafield, used to convert print-atlas pixels into centimetres.
 * Returns `null` when the table is missing, malformed, or lacks the L column / required rows.
 */
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
