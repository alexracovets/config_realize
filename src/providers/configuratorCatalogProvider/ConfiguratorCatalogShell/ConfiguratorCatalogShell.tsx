import { ConfiguratorCatalogProvider } from '@providers/configuratorCatalogProvider/configuratorCatalogProvider';
import { resolveHomeCollections } from '@shopify';
import type { childrenType } from '@types';

const ConfiguratorCatalogShell = async ({ children }: childrenType) => {
  const collections = await resolveHomeCollections();

  return <ConfiguratorCatalogProvider value={{ collections }}>{children}</ConfiguratorCatalogProvider>;
};

export { ConfiguratorCatalogShell };
