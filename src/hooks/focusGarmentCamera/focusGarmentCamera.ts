import type { configuratorCameraFocusViewModeType } from '@configurator';
import { requestConfiguratorCameraFocus } from '@configurator';
import type { uvPointType } from '@types';

const focusGarmentCamera = (target: { partId: string; uv: uvPointType }, viewMode?: configuratorCameraFocusViewModeType) => {
  requestConfiguratorCameraFocus({ partId: target.partId, uv: target.uv, viewMode });
};

export { focusGarmentCamera };
