import type { uvPointType } from '@types';

type configuratorCameraFocusViewModeType = 'part' | 'surface';

interface configuratorCameraFocusTargetType {
  partId: string;
  uv: uvPointType;
  viewMode?: configuratorCameraFocusViewModeType;
}

interface configuratorCameraFocusStateType {
  requestId: number;
  target: configuratorCameraFocusTargetType | null;
}

let requestId = 0;
const focusListeners = new Set<() => void>();

const cameraFocusState: configuratorCameraFocusStateType = {
  requestId: 0,
  target: null,
};

const subscribeConfiguratorCameraFocus = (listener: () => void) => {
  focusListeners.add(listener);
  return () => {
    focusListeners.delete(listener);
  };
};

const requestConfiguratorCameraFocus = (target: configuratorCameraFocusTargetType) => {
  requestId += 1;
  cameraFocusState.requestId = requestId;
  cameraFocusState.target = target;
  focusListeners.forEach((listener) => listener());
};

const getConfiguratorCameraFocusState = () => cameraFocusState;

export type { configuratorCameraFocusTargetType, configuratorCameraFocusViewModeType };
export { getConfiguratorCameraFocusState, requestConfiguratorCameraFocus, subscribeConfiguratorCameraFocus };
