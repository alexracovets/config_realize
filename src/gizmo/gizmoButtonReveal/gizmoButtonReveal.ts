import { NAME_SLOT_COUNT } from '@constants';

const REVEAL_LERP = 0.42;
const REVEAL_EPSILON = 0.001;

const revealTarget = Array.from({ length: NAME_SLOT_COUNT }, () => 0);
const revealCurrent = Array.from({ length: NAME_SLOT_COUNT }, () => 0);
let rafId: number | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const stepRevealAnimation = () => {
  let animating = false;

  for (let index = 0; index < NAME_SLOT_COUNT; index += 1) {
    const target = revealTarget[index];
    const prev = revealCurrent[index];
    revealCurrent[index] += (target - revealCurrent[index]) * REVEAL_LERP;

    if (Math.abs(revealCurrent[index] - target) > REVEAL_EPSILON) {
      animating = true;
      continue;
    }

    revealCurrent[index] = target;
    if (Math.abs(prev - revealCurrent[index]) > 0.0001) notify();
  }

  notify();

  if (animating) {
    rafId = requestAnimationFrame(stepRevealAnimation);
    return;
  }

  rafId = null;
};

const ensureRevealAnimation = () => {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(stepRevealAnimation);
};

const setGizmoButtonsRevealTarget = (slotIndex: number, snap = false) => {
  let changed = false;

  for (let index = 0; index < NAME_SLOT_COUNT; index += 1) {
    const next = index === slotIndex && slotIndex >= 0 ? 1 : 0;
    if (revealTarget[index] !== next) {
      revealTarget[index] = next;
      changed = true;
    }
    if (snap && revealCurrent[index] !== next) {
      revealCurrent[index] = next;
      changed = true;
    }
  }

  if (!changed) return;

  if (snap) {
    notify();
    return;
  }

  ensureRevealAnimation();
};

const getGizmoButtonReveal = (slotIndex: number) => revealCurrent[slotIndex] ?? 0;

const getGizmoButtonsRevealUniforms = () => [...revealCurrent];

const subscribeGizmoButtonReveal = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export { getGizmoButtonReveal, getGizmoButtonsRevealUniforms, setGizmoButtonsRevealTarget, subscribeGizmoButtonReveal };
