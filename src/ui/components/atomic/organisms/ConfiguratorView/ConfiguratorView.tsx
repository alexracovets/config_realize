'use client';

import { Configurator } from '../Configurator';
import { ConfiguratorCanvasLoader } from '../ConfiguratorCanvasLoader';
import { useConfiguratorSceneLoad } from '@store';

const ConfiguratorView = () => {
  const isRouteHydrated = useConfiguratorSceneLoad((state) => state.isRouteHydrated);

  if (!isRouteHydrated) {
    return <div className="relative h-full min-h-0 min-w-0 w-full" />;
  }

  return (
    <div className="relative h-full min-h-0 min-w-0 w-full">
      <Configurator />
      <ConfiguratorCanvasLoader />
    </div>
  );
};

export { ConfiguratorView };
