'use client';

import { useEffect, useRef } from 'react';

import type { configuratorProductHydrationType } from '@configurator/types';
import { applyConfiguratorRouteProduct } from '@utils';

type configuratorRouteShellPropsType = {
  collectionHandle: string;
  slug: string;
  product: configuratorProductHydrationType | null;
  children?: React.ReactNode;
};

/**
 * Stamps slug/product onto zustand after first paint so the initial loader can render
 * before route activation and asset preloads run.
 */
const ConfiguratorRouteShell = ({ collectionHandle, slug, product, children }: configuratorRouteShellPropsType) => {
  const appliedRouteKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const routeKey = `${collectionHandle}:${slug}:${product?.modelId ?? 'local'}`;
    if (appliedRouteKeyRef.current === routeKey) return;

    appliedRouteKeyRef.current = routeKey;
    applyConfiguratorRouteProduct(collectionHandle, slug, product);
  }, [collectionHandle, slug, product]);

  return children ?? null;
};

export { ConfiguratorRouteShell };
