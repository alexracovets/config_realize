'use client';

import { useCallback, useEffect } from 'react';

import { prepareGarmentModel, warmProductAssets } from '@configurator';
import type { modelIdType } from '@types';
import { getModel, hasModel } from '@utils';

const resolveCatalogModelId = (slug: string): modelIdType | null => {
  if (hasModel(slug)) return slug;
  return null;
};

const warmGarmentCatalogAssets = (modelId: modelIdType) => {
  const product = getModel(modelId);
  if (!product) return;

  warmProductAssets(product, { deferHeavy: true });
};

const warmGarmentCatalogAssetsEager = async (modelId: modelIdType) => {
  const product = getModel(modelId);
  if (!product) return;

  await prepareGarmentModel(product);
};

const useGarmentCatalogPreload = () => {
  const warmByModelId = useCallback((modelId: modelIdType) => {
    warmGarmentCatalogAssets(modelId);
  }, []);

  const warmByModelIdEager = useCallback(async (modelId: modelIdType) => {
    await warmGarmentCatalogAssetsEager(modelId);
  }, []);

  const warmBySlug = useCallback((slug: string) => {
    const modelId = resolveCatalogModelId(slug);
    if (!modelId) return;
    warmGarmentCatalogAssets(modelId);
  }, []);

  const warmBySlugEager = useCallback(async (slug: string) => {
    const modelId = resolveCatalogModelId(slug);
    if (!modelId) return;
    await warmGarmentCatalogAssetsEager(modelId);
  }, []);

  return { warmByModelId, warmByModelIdEager, warmBySlug, warmBySlugEager };
};

const useGarmentCatalogPreloadEffect = (modelIds: modelIdType[]) => {
  useEffect(() => {
    for (const modelId of modelIds) {
      warmGarmentCatalogAssets(modelId);
    }
  }, [modelIds]);
};

export { useGarmentCatalogPreload, useGarmentCatalogPreloadEffect, warmGarmentCatalogAssets, warmGarmentCatalogAssetsEager };
