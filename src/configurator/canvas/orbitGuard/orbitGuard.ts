import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const orbitGuardState = {
  asideHover: false,
};

const orbitControlsRef: { current: OrbitControlsImpl | null } = { current: null };

let gizmoDragging = false;

const syncOrbitControlsEnabled = () => {
  const controls = orbitControlsRef.current;
  if (!controls) return;

  controls.enabled = !orbitGuardState.asideHover && !gizmoDragging;
};

const isOrbitControlsEnabled = () => !orbitGuardState.asideHover && !gizmoDragging;

const setGizmoDragging = (value: boolean) => {
  if (gizmoDragging === value) return;
  gizmoDragging = value;
  syncOrbitControlsEnabled();
};

const setAsidePointerOver = (over: boolean) => {
  if (orbitGuardState.asideHover === over) return;
  orbitGuardState.asideHover = over;
  syncOrbitControlsEnabled();
};

const registerAsideOrbitGuard = (element: HTMLElement | null): (() => void) => {
  if (!element || typeof window === 'undefined') return () => {};

  const onPointerMove = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      setAsidePointerOver(false);
      return;
    }

    setAsidePointerOver(element.contains(target));
  };

  const onPointerLeave = () => setAsidePointerOver(false);

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  element.addEventListener('pointerleave', onPointerLeave, { passive: true });

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerleave', onPointerLeave);
    setAsidePointerOver(false);
  };
};

export { isOrbitControlsEnabled, orbitControlsRef, registerAsideOrbitGuard, setAsidePointerOver, setGizmoDragging, syncOrbitControlsEnabled };
