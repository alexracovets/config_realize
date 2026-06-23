'use client';

import type { cartItemConfigurationType } from '@types';
import { captureConfiguratorPreviewSnapshot } from '@utils';

import { captureGarmentConfiguration } from './cartItemConfiguration';

interface persistCartItemSnapshotGetState {
  saveConfiguration: (itemId: string, configuration: cartItemConfigurationType) => void;
  savePreview: (itemId: string, previewSrc: string) => void;
}

const persistCartItemSnapshot = (get: () => persistCartItemSnapshotGetState, itemId: string) => {
  get().saveConfiguration(itemId, captureGarmentConfiguration());

  const preview = captureConfiguratorPreviewSnapshot();
  if (preview) get().savePreview(itemId, preview);
};

export { persistCartItemSnapshot };
