'use client';

import { useConfiguratorProductHydration } from '@hooks';
import type { configuratorSlugHydrationPropsType } from '@types';
import { resolveConfiguratorProductBySlug } from '@utils';

const ConfiguratorSlugHydration = ({ slug }: configuratorSlugHydrationPropsType) => {
  const product = resolveConfiguratorProductBySlug(slug);

  useConfiguratorProductHydration(slug, product);

  return null;
};

export { ConfiguratorSlugHydration };
