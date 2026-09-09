'use client';

import { motion } from 'motion/react';

import { Box } from '@atoms';
import { MainLoader, MainLoaderBackground } from '@molecules';
import { useConfiguratorSceneLoad } from '@store';

const ConfiguratorInitialLoader = () => {
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={false}
      animate={{ opacity: isInitialSceneLoading ? 1 : 0 }}
      transition={isInitialSceneLoading ? { duration: 0 } : { duration: 0.45, ease: 'easeInOut' }}
      style={{ pointerEvents: isInitialSceneLoading ? 'auto' : 'none' }}
      aria-busy={isInitialSceneLoading}
      aria-hidden={!isInitialSceneLoading}
    >
      <MainLoaderBackground />
      <Box variant="loader_content_layer">
        <MainLoader />
      </Box>
    </motion.div>
  );
};

export { ConfiguratorInitialLoader };
