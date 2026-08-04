const GIZMO_BTN_MOBILE_MEDIA_QUERY = '(max-width: 639px)';
const GIZMO_BTN_MOBILE_SCALE = 2;
const GIZMO_BTN_DESKTOP_SCALE = 1;

let gizmoButtonScale = GIZMO_BTN_DESKTOP_SCALE;

const listeners = new Set<(scale: number) => void>();

const setGizmoButtonScale = (scale: number) => {
  if (scale === gizmoButtonScale) return;
  gizmoButtonScale = scale;
  listeners.forEach((listener) => listener(scale));
};

const getGizmoButtonScale = () => gizmoButtonScale;

const subscribeGizmoButtonScale = (listener: (scale: number) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const syncGizmoButtonScaleFromViewport = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};

  const mediaQuery = window.matchMedia(GIZMO_BTN_MOBILE_MEDIA_QUERY);
  const sync = () => {
    setGizmoButtonScale(mediaQuery.matches ? GIZMO_BTN_MOBILE_SCALE : GIZMO_BTN_DESKTOP_SCALE);
  };

  sync();
  mediaQuery.addEventListener('change', sync);
  return () => {
    mediaQuery.removeEventListener('change', sync);
  };
};

export {
  GIZMO_BTN_DESKTOP_SCALE,
  GIZMO_BTN_MOBILE_MEDIA_QUERY,
  GIZMO_BTN_MOBILE_SCALE,
  getGizmoButtonScale,
  setGizmoButtonScale,
  subscribeGizmoButtonScale,
  syncGizmoButtonScaleFromViewport,
};
