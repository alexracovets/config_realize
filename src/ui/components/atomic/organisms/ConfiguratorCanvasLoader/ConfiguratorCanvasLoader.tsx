'use client';

import { useCallback } from 'react';

import { motion } from 'motion/react';

import { CanvasLoaderBackground, MainLoader } from '@molecules';
import { useSceneTransitionTrigger } from '@hooks';
import { useConfiguratorProduct, useConfiguratorSceneLoad, useGarmentDesign } from '@store';

const ConfiguratorCanvasLoader = () => {
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const beginSceneTransitionLoad = useConfiguratorSceneLoad((state) => state.beginSceneTransitionLoad);

  const productPath = useConfiguratorProduct((state) => state.product.path);
  const activePatternKey = useGarmentDesign((state) => state.activePattern?.key ?? null);

  const beginProductTransition = useCallback(() => {
    beginSceneTransitionLoad({ affectsConfigurationPanel: true });
  }, [beginSceneTransitionLoad]);

  const beginPatternTransition = useCallback(() => {
    beginSceneTransitionLoad({ affectsConfigurationPanel: false });
  }, [beginSceneTransitionLoad]);

  useSceneTransitionTrigger(productPath, beginProductTransition, isInitialSceneLoading);
  useSceneTransitionTrigger(activePatternKey, beginPatternTransition, isInitialSceneLoading);

  const isVisible = isSceneTransitionLoading && !isInitialSceneLoading;

  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={isVisible ? { duration: 0 } : { duration: 0.45, ease: 'easeInOut' }}
      style={{ pointerEvents: 'none' }}
      aria-busy={isVisible}
      aria-hidden={!isVisible}
    >
      <CanvasLoaderBackground />
      <div className="relative z-10">
        <MainLoader />
      </div>
    </motion.div>
  );
};

export { ConfiguratorCanvasLoader };
