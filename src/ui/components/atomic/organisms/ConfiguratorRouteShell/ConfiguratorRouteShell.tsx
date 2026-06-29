'use client';

import { useLayoutEffect, useRef } from 'react';

import type { configuratorProductHydrationType } from '@configurator/types';
import { applyConfiguratorRouteProduct } from '@utils';

type configuratorRouteShellPropsType = {
  collectionHandle: string;
  slug: string;
  product: configuratorProductHydrationType | null;
  children?: React.ReactNode;
};

/**
 * Stamps slug/product onto zustand before paint so WebGL mounts with the active route product.
 */
const ConfiguratorRouteShell = ({ collectionHandle, slug, product, children }: configuratorRouteShellPropsType) => {
  const appliedRouteKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const routeKey = `${collectionHandle}:${slug}:${product?.modelId ?? 'local'}`;
    if (appliedRouteKeyRef.current === routeKey) return;

    appliedRouteKeyRef.current = routeKey;
    applyConfiguratorRouteProduct(collectionHandle, slug, product);
  }, [collectionHandle, slug, product]);

  return children ?? null;
};

export { ConfiguratorRouteShell };
