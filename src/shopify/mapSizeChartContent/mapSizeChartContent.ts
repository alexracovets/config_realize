import type { modalInfoPartType, modalInfoTableColumnType, modalInfoTablePartType, modalInfoTableRowType, modalInfoTabType } from '@types';

import { metafieldValueToParagraphs } from '@shopify/mapSizeChartContent/richTextToParagraphs';

const LABEL_COLUMN_HEADER = 'Misure in cm';

type sizeChartTableColumnJsonType = {
  id: string;
  header: string;
  subHeader?: string;
};

type sizeChartTableRowJsonType = {
  label: string;
  values: Record<string, string | number>;
};

type sizeChartTableJsonType = {
  columns: sizeChartTableColumnJsonType[];
  rows: sizeChartTableRowJsonType[];
};

type sizeChartMetafieldsNodeType = {
  headingMetafield?: { value: string } | null;
  descriptionMetafield?: { value: string; type?: string | null } | null;
  imageMetafield?: { reference?: { image?: { url: string; altText?: string | null } | null } | null } | null;
  tableMetafield?: { value: string } | null;
  noteMetafield?: { value: string; type?: string | null } | null;
};

const parseSizeChartTable = (json: string): modalInfoTablePartType | null => {
  try {
    const parsed = JSON.parse(json) as sizeChartTableJsonType;
    if (!Array.isArray(parsed.columns) || !Array.isArray(parsed.rows)) return null;

    const columns: modalInfoTableColumnType[] = [
      { id: 'label', accessorKey: 'label', header: LABEL_COLUMN_HEADER },
      ...parsed.columns.map((column) => ({
        id: column.id,
        accessorKey: column.id,
        header: column.header,
        subHeader: column.subHeader,
      })),
    ];

    const data: modalInfoTableRowType[] = parsed.rows.map((row) => ({ label: row.label, ...row.values }));

    return { type: 'table', variant: 'size_chart', columns, data };
  } catch {
    return null;
  }
};

const mapSizeChartContent = (node: sizeChartMetafieldsNodeType): modalInfoTabType | null => {
  const tableValue = node.tableMetafield?.value;
  if (!tableValue) return null;

  const table = parseSizeChartTable(tableValue);
  if (!table) return null;

  const parts: modalInfoPartType[] = [];

  if (node.descriptionMetafield?.value) {
    parts.push({
      type: 'text',
      content: metafieldValueToParagraphs(node.descriptionMetafield.value, node.descriptionMetafield.type),
    });
  }

  const image = node.imageMetafield?.reference?.image;
  if (image?.url) {
    parts.push({ type: 'image', src: image.url, alt: image.altText ?? '' });
  }

  parts.push(table);

  if (node.noteMetafield?.value) {
    parts.push({
      type: 'text',
      content: metafieldValueToParagraphs(node.noteMetafield.value, node.noteMetafield.type),
    });
  }

  return {
    sections: [
      {
        id: 'size-chart',
        heading: node.headingMetafield?.value,
        headingClassName: 'italic uppercase',
        parts,
      },
    ],
  };
};

export { mapSizeChartContent };
export type { sizeChartMetafieldsNodeType };
