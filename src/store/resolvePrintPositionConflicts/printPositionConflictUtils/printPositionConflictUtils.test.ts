import { describe, expect, it, vi } from 'vitest';

import { normalizePrintPositionConflicts, removeInstancesByPositionIdsFromStore } from '@store/resolvePrintPositionConflicts/printPositionConflictUtils';

describe('normalizePrintPositionConflicts', () => {
  it('merges legacy text ids into testo', () => {
    expect(normalizePrintPositionConflicts({ text: ['right'], number: ['front_center'] })).toEqual({
      name: [],
      number: ['front_center'],
      testo: ['right'],
    });
  });
});

describe('removeInstancesByPositionIdsFromStore', () => {
  it('removes instances whose positionId matches conflict ids', () => {
    const removeInstance = vi.fn();
    const store = {
      positions: [
        { key: 'testo-pos-0', positionId: 'right' },
        { key: 'testo-pos-1', positionId: 'left' },
      ],
      instances: [
        { id: 'testo-pos-0_1', positionKey: 'testo-pos-0' },
        { id: 'testo-pos-1_1', positionKey: 'testo-pos-1' },
      ],
      removeInstance,
    };

    removeInstancesByPositionIdsFromStore(store, ['right']);

    expect(removeInstance).toHaveBeenCalledTimes(1);
    expect(removeInstance).toHaveBeenCalledWith('testo-pos-0_1');
  });
});
