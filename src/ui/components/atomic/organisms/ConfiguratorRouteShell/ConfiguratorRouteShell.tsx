'use client';

import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';

import type { configuratorProductHydrationType } from '@types';
import { applyConfiguratorRouteProduct } from '../../../../../utils/configuratorRoute/applyConfiguratorRouteProduct';

type configuratorRouteShellPropsType = {
  slug: string;
  product: configuratorProductHydrationType | null;
  children?: ReactNode;
};

/**
 * Stamps slug/product onto zustand before paint; Canvas waits for `isRouteHydrated`.
 */
const ConfiguratorRouteShell = ({ slug, product, children }: configuratorRouteShellPropsType) => {
  const appliedRouteKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const routeKey = `${slug}:${product?.modelId ?? 'local'}`;
    if (appliedRouteKeyRef.current === routeKey) return;

    appliedRouteKeyRef.current = routeKey;
    applyConfiguratorRouteProduct(slug, product);
  }, [slug, product]);

  return children ?? null;
};

export { ConfiguratorRouteShell };
