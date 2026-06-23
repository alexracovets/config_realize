'use client';

import type { ReactNode } from 'react';

import { useAsyncGarmentPbrMaps } from '@hooks';
import { PbrMapsProvider } from '@providers';
import type { pbrMapsLoaderPropsType, pbrTexturePathsType } from '@types';

const PbrMapsLoader = ({ paths, children }: pbrMapsLoaderPropsType) => {
  if (!paths) {
    return <PbrMapsProvider maps={null}>{children}</PbrMapsProvider>;
  }

  return <PbrMapsLoaderWithMaps paths={paths}>{children}</PbrMapsLoaderWithMaps>;
};

const PbrMapsLoaderWithMaps = ({ paths, children }: { paths: pbrTexturePathsType; children: ReactNode }) => {
  const maps = useAsyncGarmentPbrMaps(paths);

  return <PbrMapsProvider maps={maps}>{children}</PbrMapsProvider>;
};

export { PbrMapsLoader };
