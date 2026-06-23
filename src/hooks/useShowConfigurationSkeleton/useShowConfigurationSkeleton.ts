'use client';

import { useConfiguratorSceneLoad } from '@store';

const useShowConfigurationSkeleton = () => {
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const transitionAffectsConfigurationPanel = useConfiguratorSceneLoad((state) => state.transitionAffectsConfigurationPanel);

  return isSceneTransitionLoading && !isInitialSceneLoading && transitionAffectsConfigurationPanel;
};

export { useShowConfigurationSkeleton };
