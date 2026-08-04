import { NAME_GIZMO_BTN_HALF_ATLAS, NAME_GIZMO_BTN_OUTSET_ATLAS } from '@configurator/constants';

import { getGizmoButtonScale } from '../gizmoButtonScale';

import type { gizmoButtonHitType, gizmoHandleKindType, printGizmoElementType } from '@configurator/types';

const GIZMO_CORNERS: ReadonlyArray<{ kind: gizmoHandleKindType; cornerIndex: number; sx: number; sy: number }> = [
  { kind: 'duplicate', cornerIndex: 0, sx: -1, sy: 1 },
  { kind: 'delete', cornerIndex: 1, sx: -1, sy: -1 },
  { kind: 'rotate', cornerIndex: 2, sx: 1, sy: 1 },
  { kind: 'scale', cornerIndex: 3, sx: 1, sy: -1 },
];

const hitTestGizmoButton = (world: { x: number; y: number }, element: printGizmoElementType): gizmoButtonHitType | null => {
  const halfWorld = { x: element.half.x * element.scale, y: element.half.y * element.scale };
  const btnScale = getGizmoButtonScale();
  const btnHalf = NAME_GIZMO_BTN_HALF_ATLAS * btnScale;
  const btnOutset = NAME_GIZMO_BTN_OUTSET_ATLAS * btnScale;

  const corner = GIZMO_CORNERS.find(({ sx, sy }) => {
    const cx = world.x - sx * (halfWorld.x + btnOutset);
    const cy = world.y - sy * (halfWorld.y + btnOutset);
    return Math.hypot(cx, cy) <= btnHalf;
  });

  if (!corner) return null;

  return { slotIndex: element.slotIndex, cornerIndex: corner.cornerIndex };
};

const hitTestGizmoFrame = (world: { x: number; y: number }, element: printGizmoElementType): boolean => {
  const halfWorld = { x: element.half.x * element.scale, y: element.half.y * element.scale };
  return Math.abs(world.x) <= halfWorld.x && Math.abs(world.y) <= halfWorld.y;
};

const GIZMO_HANDLE_CURSORS: Record<(typeof GIZMO_CORNERS)[number]['kind'], string> = {
  duplicate: 'copy',
  delete: 'pointer',
  rotate: 's-resize',
  scale: 'nwse-resize',
};

const getGizmoHoverCursor = (world: { x: number; y: number }, element: printGizmoElementType, buttonsVisible = true): string | null => {
  if (buttonsVisible) {
    const buttonHit = hitTestGizmoButton(world, element);
    if (buttonHit) {
      const corner = GIZMO_CORNERS.find((item) => item.cornerIndex === buttonHit.cornerIndex);
      return corner ? GIZMO_HANDLE_CURSORS[corner.kind] : null;
    }
  }

  return hitTestGizmoFrame(world, element) ? 'move' : null;
};

export { GIZMO_CORNERS, getGizmoHoverCursor, hitTestGizmoButton, hitTestGizmoFrame };
