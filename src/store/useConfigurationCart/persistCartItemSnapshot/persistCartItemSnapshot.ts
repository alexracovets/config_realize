'use client';

import type { cartItemConfigurationType } from '@types';
import { captureConfiguratorPreviewSnapshot } from '@configurator';
import { captureGarmentConfiguration } from '@store/useConfigurationCart/cartItemConfiguration';

interface persistCartItemSnapshotGetState {
  saveConfiguration: (itemId: string, configuration: cartItemConfigurationType) => void;
  savePreview: (itemId: string, previewSrc: string) => void;
}

let pendingPreviewPersistGeneration = 0;

const cancelPendingPreviewPersist = () => {
  pendingPreviewPersistGeneration += 1;
};

const schedulePreviewPersist = (get: () => persistCartItemSnapshotGetState, itemId: string) => {
  const generation = ++pendingPreviewPersistGeneration;

  const work = () => {
    if (generation !== pendingPreviewPersistGeneration) return;
    persistCartItemPreview(get, itemId);
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(work, { timeout: 1_500 });
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(work);
  });
};

type persistCartItemPreviewModeType = 'sync' | 'async' | 'skip';

const persistCartItemConfiguration = (get: () => persistCartItemSnapshotGetState, itemId: string) => {
  get().saveConfiguration(itemId, captureGarmentConfiguration());
};

const persistCartItemPreview = (get: () => persistCartItemSnapshotGetState, itemId: string) => {
  const preview = captureConfiguratorPreviewSnapshot();
  if (preview) get().savePreview(itemId, preview);
};

const persistCartItemSnapshot = (
  get: () => persistCartItemSnapshotGetState,
  itemId: string,
  options?: { previewMode?: persistCartItemPreviewModeType },
) => {
  persistCartItemConfiguration(get, itemId);

  const previewMode = options?.previewMode ?? 'async';
  if (previewMode === 'skip') return;

  if (previewMode === 'sync') {
    cancelPendingPreviewPersist();
    persistCartItemPreview(get, itemId);
    return;
  }

  schedulePreviewPersist(get, itemId);
};

export {
  cancelPendingPreviewPersist,
  persistCartItemConfiguration,
  persistCartItemPreview,
  persistCartItemSnapshot,
};
