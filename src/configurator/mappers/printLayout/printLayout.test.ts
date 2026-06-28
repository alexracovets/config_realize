import type { garmentPartConfigType } from '@types';
import { FULL_UV_BOUNDS } from '@configurator/constants';
import { resolvePartUvBounds, resolvePrintLocalUvToAtlas } from '@configurator/mappers';
import { describe, expect, it } from 'vitest';
const frontPart = {
  id: 'front',
  meshNames: ['front_mesh'],
  uvBounds: { minX: 0.1, minY: 0.2, maxX: 0.5, maxY: 0.8 },
} as garmentPartConfigType;

describe('printLayout', () => {
  it('resolvePartUvBounds falls back to FULL_UV_BOUNDS', () => {
    expect(resolvePartUvBounds({ id: 'x', name: 'x', label: 'x', meshNames: [] } as garmentPartConfigType)).toEqual(FULL_UV_BOUNDS);
  });

  it('resolvePrintLocalUvToAtlas maps local 0..1 into part bounds', () => {
    expect(resolvePrintLocalUvToAtlas(frontPart, { x: 0, y: 0 })).toEqual({ x: 0.1, y: 0.2 });
    expect(resolvePrintLocalUvToAtlas(frontPart, { x: 1, y: 1 })).toEqual({ x: 0.5, y: 0.8 });
    const mid = resolvePrintLocalUvToAtlas(frontPart, { x: 0.5, y: 0.5 });
    expect(mid.x).toBeCloseTo(0.3);
    expect(mid.y).toBeCloseTo(0.5);
  });
});
