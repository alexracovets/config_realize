'use client';

import { getStrictContext } from '@providers/getStrictContext';
import type { homePageCollectionType } from '@types';

type configuratorCatalogContextType = {
  collections: homePageCollectionType[];
};

const [ConfiguratorCatalogProvider, useConfiguratorCatalog] = getStrictContext<configuratorCatalogContextType>('ConfiguratorCatalogProvider');

export { ConfiguratorCatalogProvider, useConfiguratorCatalog };
