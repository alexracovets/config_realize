import type { printPositionConflictsConfigType } from '@types';

interface printPositionWithConflictsType {
  conflicts?: printPositionConflictsConfigType;
}

interface printConflictStoreLike {
  instances: Array<{ id: string; positionKey: string }>;
  positions: Array<{ key: string; positionId?: string }>;
  removeInstance: (id: string) => void;
}

const normalizePrintPositionConflicts = (conflicts?: printPositionConflictsConfigType) => ({
  name: conflicts?.name ?? [],
  number: conflicts?.number ?? [],
  testo: [...(conflicts?.testo ?? []), ...(conflicts?.text ?? [])],
});

const removeInstancesByPositionIdsFromStore = (store: printConflictStoreLike, positionIds: string[]) => {
  if (positionIds.length === 0) return;

  const targetIds = new Set(positionIds);

  for (const instance of store.instances) {
    const position = store.positions.find((item) => item.key === instance.positionKey);
    if (position?.positionId && targetIds.has(position.positionId)) {
      store.removeInstance(instance.id);
    }
  }
};

export { normalizePrintPositionConflicts, removeInstancesByPositionIdsFromStore, type printConflictStoreLike, type printPositionWithConflictsType };
