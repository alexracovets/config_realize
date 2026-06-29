'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useConfiguratorSceneLoad } from '@store';
import { isConfiguratorPath } from '@utils';

/** Unmount WebGL while browsing catalog routes so R3F hooks never run outside Canvas. */
const useConfiguratorRouteReset = (): void => {
  const pathname = usePathname();

  useEffect(() => {
    if (!isConfiguratorPath(pathname)) {
      useConfiguratorSceneLoad.getState().resetForCatalogLeave();
    }
  }, [pathname]);
};

export { useConfiguratorRouteReset };
