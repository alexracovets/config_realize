import type { printablePartMeshesType, printDragMoveResultType, printDragMoveStateType, printUvHitType } from '@types';
import { clampUvToPartBounds } from '@utils';

const resolvePrintablePart = (printableParts: printablePartMeshesType[], partId: string) => printableParts.find((part) => part.partId === partId) ?? null;

const resolvePrintDragMove = (
  hit: printUvHitType,
  state: printDragMoveStateType,
  printableParts: printablePartMeshesType[],
): printDragMoveResultType | null => {
  const targetPart = resolvePrintablePart(printableParts, hit.partId);
  if (!targetPart) return null;

  let offset = state.offset;
  let activePartId = state.activePartId;

  if (hit.partId !== activePartId) {
    offset = { x: 0, y: 0 };
    activePartId = hit.partId;
  }

  const uv = clampUvToPartBounds({ x: hit.uv.x + offset.x, y: hit.uv.y + offset.y }, targetPart.uvBounds);

  return {
    uv,
    partId: hit.partId,
    state: { offset, activePartId },
  };
};

export { resolvePrintDragMove };
