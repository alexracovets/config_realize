import { describe, expect, it } from 'vitest';

import { LOGO_STAMP_ATLAS_MAX_PX } from '@configurator/constants';
import { fitCellSizeToAtlasLimit } from '@configurator/utils';

const atlasSideOf = (cell: { width: number; height: number }, grid: number) => Math.max(cell.width, cell.height) * grid;

describe('fitCellSizeToAtlasLimit', () => {
  it('leaves the cell untouched while the atlas fits the texture limit', () => {
    const cell = { width: 849, height: 849 };

    expect(fitCellSizeToAtlasLimit(cell, 2)).toEqual(cell);
  });

  it('shrinks the cell once the grid would exceed the texture limit', () => {
    const fitted = fitCellSizeToAtlasLimit({ width: 849, height: 849 }, 3);

    expect(atlasSideOf(fitted, 3)).toBeLessThanOrEqual(LOGO_STAMP_ATLAS_MAX_PX);
    expect(fitted.width).toBeLessThan(849);
  });

  it('keeps the aspect ratio of a non-square cell', () => {
    const fitted = fitCellSizeToAtlasLimit({ width: 400, height: 800 }, 4);

    expect(fitted.height / fitted.width).toBeCloseTo(2, 1);
    expect(atlasSideOf(fitted, 4)).toBeLessThanOrEqual(LOGO_STAMP_ATLAS_MAX_PX);
  });

  it('stays within the limit for a large grid', () => {
    const fitted = fitCellSizeToAtlasLimit({ width: 849, height: 849 }, 6);

    expect(atlasSideOf(fitted, 6)).toBeLessThanOrEqual(LOGO_STAMP_ATLAS_MAX_PX);
  });

  it('scales the cell so logo content still fits it exactly', () => {
    const reference = { width: 849, height: 849 };
    const fitted = fitCellSizeToAtlasLimit(reference, 3);
    const ratio = Math.min(fitted.width / reference.width, fitted.height / reference.height);

    expect((reference.width * ratio) / fitted.width).toBeLessThanOrEqual(1);
    expect((reference.height * ratio) / fitted.height).toBeLessThanOrEqual(1);
  });

  it('never collapses a cell to zero', () => {
    const fitted = fitCellSizeToAtlasLimit({ width: 2, height: 1 }, 4096);

    expect(fitted.width).toBeGreaterThanOrEqual(1);
    expect(fitted.height).toBeGreaterThanOrEqual(1);
  });
});
