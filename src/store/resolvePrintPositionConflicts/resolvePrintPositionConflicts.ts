import { useGarmentName } from '@store/useGarmentName';
import { useGarmentNumber } from '@store/useGarmentNumber';
import { useGarmentTesto } from '@store/useGarmentTesto';
import {
  normalizePrintPositionConflicts,
  type printPositionWithConflictsType,
  removeInstancesByPositionIdsFromStore,
} from '@store/resolvePrintPositionConflicts/printPositionConflictUtils';

type printPositionConflictKindType = 'name' | 'number' | 'testo';

const removeInstancesByPositionIds = (kind: printPositionConflictKindType, positionIds: string[]) => {
  if (positionIds.length === 0) return;

  if (kind === 'name') {
    removeInstancesByPositionIdsFromStore(useGarmentName.getState(), positionIds);
    return;
  }

  if (kind === 'number') {
    removeInstancesByPositionIdsFromStore(useGarmentNumber.getState(), positionIds);
    return;
  }

  removeInstancesByPositionIdsFromStore(useGarmentTesto.getState(), positionIds);
};

const resolvePrintPositionConflicts = (position: printPositionWithConflictsType) => {
  const conflicts = normalizePrintPositionConflicts(position.conflicts);

  removeInstancesByPositionIds('name', conflicts.name);
  removeInstancesByPositionIds('number', conflicts.number);
  removeInstancesByPositionIds('testo', conflicts.testo);
};

export { resolvePrintPositionConflicts };
