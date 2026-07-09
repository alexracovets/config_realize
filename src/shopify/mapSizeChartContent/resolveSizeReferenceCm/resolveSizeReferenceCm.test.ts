import { describe, expect, it } from 'vitest';

import { resolveSizeReferenceCm } from '@shopify/mapSizeChartContent';

const buildTableNode = (columns: unknown, rows: unknown) => ({ tableMetafield: { value: JSON.stringify({ columns, rows }) } });

const columns = [
  { id: 's', header: 'S' },
  { id: 'l', header: 'L' },
  { id: 'xl', header: 'XL' },
];

describe('resolveSizeReferenceCm', () => {
  it('extracts ALTEZZA/TORACE at the L column', () => {
    const node = buildTableNode(columns, [
      { label: 'ALTEZZA', values: { s: 70, l: 73, xl: 74 } },
      { label: 'TORACE', values: { s: 47.5, l: 53.5, xl: 55.5 } },
    ]);
    expect(resolveSizeReferenceCm(node)).toEqual({ heightCm: 73, widthCm: 53.5 });
  });

  it('uses VITA as the width row for bottoms and parses comma decimals', () => {
    const node = buildTableNode(columns, [
      { label: 'ALTEZZA', values: { l: '51' } },
      { label: 'VITA', values: { l: '37,5' } },
    ]);
    expect(resolveSizeReferenceCm(node)).toEqual({ heightCm: 51, widthCm: 37.5 });
  });

  it('returns null when the table, L column, or rows are missing', () => {
    expect(resolveSizeReferenceCm({ tableMetafield: null })).toBeNull();
    expect(resolveSizeReferenceCm({ tableMetafield: { value: 'not json' } })).toBeNull();
    expect(resolveSizeReferenceCm(buildTableNode([{ id: 's', header: 'S' }], [{ label: 'ALTEZZA', values: { s: 70 } }]))).toBeNull();
    expect(resolveSizeReferenceCm(buildTableNode(columns, [{ label: 'ALTEZZA', values: { l: 73 } }]))).toBeNull();
  });
});
