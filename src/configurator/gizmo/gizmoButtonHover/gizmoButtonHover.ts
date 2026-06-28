import type { gizmoButtonHoverTargetType } from '@configurator/types';

const HOVER_SCALE_TARGET = 1.1;
const HOVER_SCALE_DEFAULT = 1;
const HOVER_LERP = 0.22;

let hoverTarget: gizmoButtonHoverTargetType | null = null;
let dragTarget: gizmoButtonHoverTargetType | null = null;
let hoverScale = HOVER_SCALE_DEFAULT;
let rafId: number | null = null;
const listeners = new Set<() => void>();

const getEffectiveHoverTarget = () => dragTarget ?? hoverTarget;

const notify = () => {
  listeners.forEach((listener) => listener());
};

const stepHoverAnimation = () => {
  const target = getEffectiveHoverTarget() ? HOVER_SCALE_TARGET : HOVER_SCALE_DEFAULT;
  const prev = hoverScale;
  hoverScale += (target - hoverScale) * HOVER_LERP;

  if (Math.abs(hoverScale - target) > 0.001) {
    notify();
    rafId = requestAnimationFrame(stepHoverAnimation);
    return;
  }

  hoverScale = target;
  if (Math.abs(prev - hoverScale) > 0.0001) notify();
  rafId = null;
};

const ensureHoverAnimation = () => {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(stepHoverAnimation);
};

const setGizmoButtonHover = (target: gizmoButtonHoverTargetType | null) => {
  const unchanged =
    hoverTarget?.slotIndex === target?.slotIndex && hoverTarget?.cornerIndex === target?.cornerIndex && (target !== null) === (hoverTarget !== null);

  if (unchanged) return;

  hoverTarget = target;
  ensureHoverAnimation();
};

const setGizmoButtonDragActive = (target: gizmoButtonHoverTargetType | null) => {
  const unchanged =
    dragTarget?.slotIndex === target?.slotIndex && dragTarget?.cornerIndex === target?.cornerIndex && (target !== null) === (dragTarget !== null);

  if (unchanged) return;

  dragTarget = target;
  ensureHoverAnimation();
};

const isGizmoButtonDragActive = () => dragTarget !== null;

const clearGizmoButtonHover = () => {
  if (dragTarget) return;
  setGizmoButtonHover(null);
};

const getGizmoHoverUniforms = () => {
  const target = getEffectiveHoverTarget();

  return {
    slot: target?.slotIndex ?? -1,
    corner: target?.cornerIndex ?? -1,
    scale: hoverScale,
  };
};

const subscribeGizmoButtonHover = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export { clearGizmoButtonHover, getGizmoHoverUniforms, isGizmoButtonDragActive, setGizmoButtonDragActive, setGizmoButtonHover, subscribeGizmoButtonHover };
