'use client';

import { Configurator } from '@organisms/Configurator';
import { ConfiguratorCanvasLoader } from '@organisms/ConfiguratorCanvasLoader';
import { useConfiguratorSceneLoad } from '@store';
import { useEffect, useState } from 'react';

const INITIAL_SCENE_WATCHDOG_MS = 8_000;

/** Let the initial loader paint before WebGL and GLTF parsing start. */
const useDeferredCanvasMount = (enabled: boolean) => {
  const [canMountCanvas, setCanMountCanvas] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let outerFrame = 0;
    let innerFrame = 0;

    outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (!cancelled) setCanMountCanvas(true);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [enabled]);

  return enabled && canMountCanvas;
};

const ConfiguratorView = () => {
  const isRouteHydrated = useConfiguratorSceneLoad((state) => state.isRouteHydrated);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const loaderSession = useConfiguratorSceneLoad((state) => state.loaderSession);
  const canMountCanvas = useDeferredCanvasMount(isRouteHydrated);

  useEffect(() => {
    if (!isRouteHydrated || !isInitialSceneLoading) return;

    const session = loaderSession;
    const timeoutId = window.setTimeout(() => {
      const state = useConfiguratorSceneLoad.getState();
      if (state.loaderSession !== session || !state.isInitialSceneLoading) return;
      state.markInitialSceneLoaded();
    }, INITIAL_SCENE_WATCHDOG_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isRouteHydrated, isInitialSceneLoading, loaderSession]);

  if (!isRouteHydrated) {
    return <div className="relative h-full min-h-0 min-w-0 w-full" />;
  }

  return (
    <div className="relative h-full min-h-0 min-w-0 w-full">
      {canMountCanvas ? <Configurator /> : null}
      <ConfiguratorCanvasLoader />
    </div>
  );
};

export { ConfiguratorView };
