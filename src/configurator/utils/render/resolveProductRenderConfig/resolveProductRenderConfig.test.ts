import type { garmentPartConfigType } from '@types';
import { clampUvToPartBounds, repairPrintInstancePlacement } from '@configurator/utils';
import { describe, expect, it } from 'vitest';
const frontPart = {
  id: 'front',
  meshNames: ['front_mesh'],
  uvBounds: { minX: 0.1, minY: 0.1, maxX: 0.4, maxY: 0.4 },
} as garmentPartConfigType;

const backPart = {
  id: 'back',
  meshNames: ['back_mesh'],
  uvBounds: { minX: 0.6, minY: 0.6, maxX: 0.9, maxY: 0.9 },
} as garmentPartConfigType;

describe('resolveProductRenderConfig', () => {
  it('clampUvToPartBounds keeps UV inside bounds', () => {
    expect(clampUvToPartBounds({ x: 2, y: -1 }, frontPart.uvBounds!)).toEqual({ x: 0.4, y: 0.1 });
  });

  it('repairPrintInstancePlacement reassigns part when UV belongs elsewhere', () => {
    const repaired = repairPrintInstancePlacement({ partId: 'front', uv: { x: 0.75, y: 0.75 } }, [frontPart, backPart]);
    expect(repaired.partId).toBe('back');
  });

  it('repairPrintInstancePlacement clamps UV when still inside assigned part', () => {
    const repaired = repairPrintInstancePlacement({ partId: 'front', uv: { x: 0.05, y: 0.05 } }, [frontPart, backPart]);
    expect(repaired.partId).toBe('front');
    expect(repaired.uv).toEqual({ x: 0.1, y: 0.1 });
  });
});
