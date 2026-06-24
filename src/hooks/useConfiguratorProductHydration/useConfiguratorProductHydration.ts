'use client';

import { useLayoutEffect, useRef } from 'react';

import type { configuratorProductHydrationType } from '@types';

import { applyConfiguratorRouteProduct } from '../../utils/configuratorRoute/applyConfiguratorRouteProduct';

const useConfiguratorProductHydration = (slug: string, product: configuratorProductHydrationType | null) => {
  const appliedRouteKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const routeKey = `${slug}:${product?.modelId ?? 'local'}`;
    if (appliedRouteKeyRef.current === routeKey) return;

    appliedRouteKeyRef.current = routeKey;
    applyConfiguratorRouteProduct(slug, product);
  }, [slug, product]);
};

export { useConfiguratorProductHydration };
