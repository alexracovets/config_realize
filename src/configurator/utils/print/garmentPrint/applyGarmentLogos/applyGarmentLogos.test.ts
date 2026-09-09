import { describe, expect, it } from 'vitest';
import { type MeshStandardMaterial, type Texture, Vector2, Vector4 } from 'three';

import { hydrateGarmentLogoUniforms } from '@configurator/utils';

const createStyleState = (scale: number[]) => ({
  stampCellSize: { width: 849, height: 477 },
  anchorUv: scale.map(() => ({ x: 0.4, y: 0.45 })),
  rotation: scale.map(() => 0),
  uploadRotation: scale.map(() => Math.PI / 2),
  partRotation: scale.map(() => 0),
  scale,
  stampSlot: scale.map((_, index) => index),
  slotActive: scale.map((value) => (value < 1 ? 1 : 0)),
  partBounds: scale.map(() => ({ minX: 0, minY: 0, maxX: 1, maxY: 1 })),
});

describe('hydrateGarmentLogoUniforms', () => {
  it('writes style into the packed program arrays', () => {
    const material = {
      userData: {
        garmentLogoStyleState: createStyleState([0.22, 0.22, 0.22, 0.22, 0.22, 1, 1, 1, 1]),
        garmentLogoStampState: {
          stamp: {} as Texture,
          cellSize: { width: 849, height: 477 },
          grid: 2,
        },
      },
    } as unknown as MeshStandardMaterial;

    const uLogoA = { value: Array.from({ length: 9 }, () => new Vector4(0, 0, 1, 0)) };
    const uLogoB = { value: Array.from({ length: 9 }, () => new Vector4()) };
    const uniforms = {
      uLogoStamp: { value: {} as Texture },
      uLogoStampCellSize: { value: new Vector2(1, 1) },
      uLogoStampGrid: { value: 3 },
      uLogoA,
      uLogoB,
      uLogoPartBounds: { value: Array.from({ length: 9 }, () => new Vector4()) },
      uLogoGizmoEnabled: { value: 0 },
      uLogoG: { value: Array.from({ length: 9 }, () => new Vector4()) },
      uLogoGizmoHalf: { value: Array.from({ length: 9 }, () => new Vector2()) },
    };

    hydrateGarmentLogoUniforms(material, uniforms);

    // uLogoA = (anchor.x, anchor.y, scale, stampSlot)
    expect(uLogoA.value[0].z).toBeCloseTo(0.22);
    expect(uLogoA.value[4].z).toBeCloseTo(0.22);
    expect(uLogoA.value[5].z).toBeCloseTo(1);
    expect(uLogoA.value[0].x).toBeCloseTo(0.4);
    expect(uLogoA.value[3].w).toBe(3);
    // uLogoB = (rotation, uploadRotation, partRotation, slotActive)
    expect(uLogoB.value[0].y).toBeCloseTo(Math.PI / 2);
    expect(uLogoB.value[0].w).toBe(1);
    expect(uLogoB.value[5].w).toBe(0);
    expect(uniforms.uLogoStampGrid.value).toBe(2);
    expect(uniforms.uLogoStampCellSize.value.x).toBe(849);
  });
});
