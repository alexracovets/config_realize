'use client';

import { useEffect } from 'react';

import { useConfiguratorSceneLoad } from '@store';
import { preloadGarmentScene } from '@features/garment-scene';

const useConfiguratorInitialSceneLoad = () => {
  useEffect(() => {
    useConfiguratorSceneLoad.getState().beginInitialSceneLoad();
    preloadGarmentScene();
  }, []);
};

export { useConfiguratorInitialSceneLoad };
