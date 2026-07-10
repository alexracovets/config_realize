'use client';

import { useEffect } from 'react';

import { warmProductGltfCache } from '@configurator';
import { useConfiguratorSceneLoad } from '@store';

const useConfiguratorInitialSceneLoad = () => {
  useEffect(() => {
    useConfiguratorSceneLoad.getState().beginInitialSceneLoad();
    warmProductGltfCache();
  }, []);
};

export { useConfiguratorInitialSceneLoad };
