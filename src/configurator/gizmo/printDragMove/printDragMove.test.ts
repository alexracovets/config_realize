import type { printablePartMeshesType } from '@configurator/types';
import { resolvePrintDragMove } from '@configurator/gizmo';
import { describe, expect, it } from 'vitest';
const printableParts: printablePartMeshesType[] = [
  {
    partId: 'front',
    meshNames: ['front_mesh'],
    uvBounds: { minX: 0.1, minY: 0.1, maxX: 0.4, maxY: 0.4 },
    printRotation: 0,
  },
];

describe('resolvePrintDragMove', () => {
  it('applies drag offset and clamps to part bounds', () => {
    const result = resolvePrintDragMove({ partId: 'front', uv: { x: 0.2, y: 0.2 } }, { offset: { x: 0.5, y: 0.5 }, activePartId: 'front' }, printableParts);

    expect(result).toEqual({
      uv: { x: 0.4, y: 0.4 },
      partId: 'front',
      state: { offset: { x: 0.5, y: 0.5 }, activePartId: 'front' },
    });
  });

  it('resets offset when dragging onto a different part', () => {
    const parts: printablePartMeshesType[] = [
      ...printableParts,
      {
        partId: 'back',
        meshNames: ['back_mesh'],
        uvBounds: { minX: 0.6, minY: 0.6, maxX: 0.9, maxY: 0.9 },
        printRotation: 0,
      },
    ];

    const result = resolvePrintDragMove({ partId: 'back', uv: { x: 0.7, y: 0.7 } }, { offset: { x: 0.2, y: 0.2 }, activePartId: 'front' }, parts);

    expect(result?.partId).toBe('back');
    expect(result?.state.activePartId).toBe('back');
    expect(result?.state.offset).toEqual({ x: 0, y: 0 });
  });
});
