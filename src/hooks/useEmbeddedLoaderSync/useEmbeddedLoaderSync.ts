'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useEmbedded } from '@providers';
import { useConfiguratorSceneLoad } from '@store';
import { isConfiguratorPath } from '@utils';
import { postEmbeddedLoadingToParent, postEmbeddedReadyToParent } from '@utils/embeddedUrlSync';

const useEmbeddedLoaderSync = (): void => {
  const { embedded } = useEmbedded();
  const pathname = usePathname();
  const isConfiguratorRoute = isConfiguratorPath(pathname);
  const isRouteHydrated = useConfiguratorSceneLoad((state) => state.isRouteHydrated);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const isLoading = isInitialSceneLoading || isSceneTransitionLoading;
  const wasLoadingRef = useRef(false);
  const catalogReadySentRef = useRef(false);

  useEffect(() => {
    if (!embedded) {
      return;
    }

    if (!isConfiguratorRoute) {
      if (catalogReadySentRef.current) {
        return;
      }

      catalogReadySentRef.current = true;
      postEmbeddedReadyToParent();
      return;
    }

    catalogReadySentRef.current = false;

    if (!isRouteHydrated) {
      return;
    }

    if (isLoading) {
      wasLoadingRef.current = true;
      postEmbeddedLoadingToParent();
      return;
    }

    if (wasLoadingRef.current) {
      postEmbeddedReadyToParent();
    }

    wasLoadingRef.current = false;
  }, [embedded, isConfiguratorRoute, isRouteHydrated, isLoading, pathname]);
};

export { useEmbeddedLoaderSync };
