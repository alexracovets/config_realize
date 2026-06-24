'use client';

import type { configuratorSlugHydrationPropsType } from '@types';

import { ConfiguratorRouteShell } from '../ConfiguratorRouteShell';

/** @deprecated Layout uses `ConfiguratorRouteShell` directly. */
const ConfiguratorSlugHydration = ({ slug, product }: configuratorSlugHydrationPropsType) => {
  return <ConfiguratorRouteShell slug={slug} product={product} />;
};

export { ConfiguratorSlugHydration };
