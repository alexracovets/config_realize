interface configuratorCameraDebugStateType {
  azimuth: number;
  polar: number;
  radius: number;
  requestId: number;
  targetPartId: string | null;
  isAnimating: boolean;
}

declare global {
  interface Window {
    __configuratorCameraDebug?: {
      getOrbitState: () => configuratorCameraDebugStateType | null;
    };
  }
}

const registerConfiguratorCameraDebug = (readOrbitState: () => configuratorCameraDebugStateType | null) => {
  if (process.env.NODE_ENV === 'production') {
    return () => undefined;
  }

  window.__configuratorCameraDebug = { getOrbitState: readOrbitState };

  return () => {
    delete window.__configuratorCameraDebug;
  };
};

export type { configuratorCameraDebugStateType };
export { registerConfiguratorCameraDebug };
