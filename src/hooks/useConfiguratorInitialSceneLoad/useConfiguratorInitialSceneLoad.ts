'use client';

import { useEffect } from 'react';

import { useConfiguratorSceneLoad } from '@store';
import { preloadConfiguratorScene } from '../../ui/components/atomic/organisms/Configurator/preloadConfiguratorScene';

const useConfiguratorInitialSceneLoad = () => {
  useEffect(() => {
    useConfiguratorSceneLoad.getState().beginInitialSceneLoad();
    preloadConfiguratorScene();
  }, []);
};

export { useConfiguratorInitialSceneLoad };
