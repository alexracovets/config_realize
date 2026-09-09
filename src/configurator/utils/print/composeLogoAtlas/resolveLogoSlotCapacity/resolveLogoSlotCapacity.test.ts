import { describe, expect, it } from 'vitest';

import { resolveLogoShaderSlotCount, resolveLogoSlotCapacity, resolveLogoStampAtlasGrid, resolveLogoStampGrid } from '@configurator/utils';

describe('resolveLogoSlotCapacity', () => {
  it('never drops below the baseline capacity', () => {
    expect(resolveLogoSlotCapacity(0)).toBe(4);
    expect(resolveLogoSlotCapacity(3)).toBe(4);
    expect(resolveLogoSlotCapacity(4)).toBe(4);
  });

  it('grows in steps so a new logo rarely forces a recompile', () => {
    expect(resolveLogoSlotCapacity(5)).toBe(9);
    expect(resolveLogoSlotCapacity(9)).toBe(9);
    expect(resolveLogoSlotCapacity(10)).toBe(16);
    expect(resolveLogoSlotCapacity(17)).toBe(25);
  });

  it('keeps growing past the largest step', () => {
    expect(resolveLogoSlotCapacity(40)).toBe(72);
    expect(resolveLogoSlotCapacity(100)).toBe(108);
  });

  it('produces a square grid that fits the capacity', () => {
    expect(resolveLogoStampGrid(4)).toBe(2);
    expect(resolveLogoStampGrid(9)).toBe(3);
    expect(resolveLogoStampGrid(16)).toBe(4);
    expect(resolveLogoStampGrid(25)).toBe(5);
  });

  it('never returns a grid smaller than one cell', () => {
    expect(resolveLogoStampGrid(0)).toBe(1);
    expect(resolveLogoStampGrid(1)).toBe(1);
  });

  it('sizes shader slots to the logos in use, capped at the max, to fit the mobile uniform budget', () => {
    expect(resolveLogoShaderSlotCount(0)).toBe(4);
    expect(resolveLogoShaderSlotCount(4)).toBe(4);
    expect(resolveLogoShaderSlotCount(5)).toBe(9);
    expect(resolveLogoShaderSlotCount(9)).toBe(9);
    expect(resolveLogoShaderSlotCount(10)).toBe(16);
    expect(resolveLogoShaderSlotCount(16)).toBe(16);
    // Above the hard cap the shader still only carries 16 slots.
    expect(resolveLogoShaderSlotCount(17)).toBe(16);
  });

  it('keeps the stamp atlas grid fixed so adding a logo never retiles existing cells', () => {
    expect(resolveLogoStampAtlasGrid()).toBe(4);
  });
});
