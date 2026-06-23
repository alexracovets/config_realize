'use client';

import { Configurator } from '../Configurator';
import { ConfiguratorCanvasLoader } from '../ConfiguratorCanvasLoader';

const ConfiguratorView = () => {
  return (
    <div className="relative h-full min-h-0 min-w-0 w-full">
      <Configurator />
      <ConfiguratorCanvasLoader />
    </div>
  );
};

export { ConfiguratorView };
