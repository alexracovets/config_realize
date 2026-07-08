'use client';

import { useGarmentColors } from '@configurator/hooks/useSyncGarmentMaterials/useGarmentColors';
import { useGarmentLoadReady } from '@configurator/hooks/useSyncGarmentMaterials/useGarmentLoadReady';
import { useLoadPatternTextures } from '@configurator/hooks/useSyncGarmentMaterials/useLoadPatternTextures';
import { useSyncGarmentMaterialsRefs } from '@configurator/hooks/useSyncGarmentMaterials/useSyncGarmentMaterialsRefs';
import { useGarmentMaterialRegistry, useMaterialRegistryRevision } from '@configurator/providers';
import { useFrame, useThree } from '@react-three/fiber';
import { useConfigurationCart, useConfiguratorSceneLoad, useGarmentDesign } from '@store';
import { useCallback, useEffect, useLayoutEffect } from 'react';
/** Syncs store colors, design, and textures onto garment materials (R3F side-effect hook). */
const useSyncGarmentMaterials = () => {
  const refs = useSyncGarmentMaterialsRefs();
  const { pendingFrameReapplyRef, lastPendingReapplyRef, sceneLoadRefs } = refs;

  const defaultPattern = useGarmentDesign((state) => state.defaultPattern);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const markInitialSceneLoaded = useConfiguratorSceneLoad((state) => state.markInitialSceneLoaded);
  const markSceneTransitionLoaded = useConfiguratorSceneLoad((state) => state.markSceneTransitionLoaded);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const loaderSession = useConfiguratorSceneLoad((state) => state.loaderSession);
  const transitionSession = useConfiguratorSceneLoad((state) => state.transitionSession);
  const invalidate = useThree((state) => state.invalidate);
  const textureAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const { bumpRevision, getMaterials, hasMaterialsForParts } = useGarmentMaterialRegistry();
  const materialRevision = useMaterialRegistryRevision();

  const { product, partIds, productPath, activePattern, activePatternKey, activeOpacity, byPart, gradientsByPart, patternColors, reapplyAppearanceCore } =
    useGarmentColors({
      refs,
      invalidate,
    });

  const { completeSceneLoadersIfReady, completeInitialLoadAfterPaint } = useGarmentLoadReady({
    product,
    partIds,
    productPath,
    productPathKey: product.path,
    activePatternKey,
    defaultPattern,
    hasMaterialsForParts,
    getMaterials,
    bumpRevision,
    invalidate,
    isSceneTransitionLoading,
    markInitialSceneLoaded,
    markSceneTransitionLoaded,
    loaderSession,
    transitionSession,
    refs: sceneLoadRefs,
    reapplyAppearanceCore,
  });

  const reapplyAppearance = useCallback(() => {
    reapplyAppearanceCore();
    completeSceneLoadersIfReady();
  }, [completeSceneLoadersIfReady, reapplyAppearanceCore]);

  useLoadPatternTextures({
    productPath,
    productPathKey: product.path,
    defaultPattern,
    activePattern,
    activePatternKey,
    textureAnisotropy,
    activeItemId,
    refs,
    reapplyAppearance,
  });

  useEffect(() => {
    reapplyAppearance();
  }, [loaderSession, reapplyAppearance]);

  useLayoutEffect(() => {
    reapplyAppearance();
  }, [activeItemId, activeOpacity, activePatternKey, byPart, gradientsByPart, materialRevision, patternColors, reapplyAppearance]);

  useFrame(() => {
    completeSceneLoadersIfReady();
    completeInitialLoadAfterPaint();

    if (!pendingFrameReapplyRef.current) return;

    const now = performance.now();
    if (now - lastPendingReapplyRef.current < 48) return;
    lastPendingReapplyRef.current = now;

    reapplyAppearance();
  });
};

export { useSyncGarmentMaterials };
