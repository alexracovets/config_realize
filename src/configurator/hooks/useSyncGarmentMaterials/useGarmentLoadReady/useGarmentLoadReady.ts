'use client';

import { type RefObject, useCallback, useEffect, useRef } from 'react';

import type { MeshStandardMaterial, Texture } from 'three';

import type { patternMaskPairType } from '@configurator/types';
import type { designPatternItemType, garmentConfigType } from '@types';
import { useConfiguratorSceneLoad } from '@store';
import {
  compileGarmentShadersOverFrames,
  isGarmentAppearanceCached,
  readProductAppearanceTextures,
  waitForPresenterFrames,
} from '@configurator/utils';

type garmentLoadReadyRefsType = {
  logosTextureRef: RefObject<Texture | null>;
  maskTexturesRef: RefObject<patternMaskPairType>;
  masksPatternKeyRef: RefObject<string | null>;
  pendingFrameReapplyRef: RefObject<boolean>;
  initialLoadCompletedRef: RefObject<boolean>;
  transitionLoadCompletedRef: RefObject<boolean>;
  shaderUpgradePendingRef: RefObject<boolean>;
  cancelShaderUpgradeRef: RefObject<(() => void) | null>;
  logosTextureFailedRef: RefObject<boolean>;
  maskTexturesFailedKeyRef: RefObject<string | null>;
};

type useGarmentLoadReadyOptionsType = {
  product: garmentConfigType;
  partIds: readonly string[];
  productPath: string | null;
  productPathKey: string;
  activePatternKey: string | null;
  defaultPattern: designPatternItemType | null;
  hasMaterialsForParts: (partIds: readonly string[]) => boolean;
  getMaterials: (partId: string) => readonly MeshStandardMaterial[];
  bumpRevision: () => void;
  invalidate: () => void;
  isSceneTransitionLoading: boolean;
  markInitialSceneLoaded: () => void;
  markSceneTransitionLoaded: () => void;
  loaderSession: number;
  transitionSession: number;
  refs: garmentLoadReadyRefsType;
  reapplyAppearanceCore: () => void;
};

const useGarmentLoadReady = ({
  product,
  partIds,
  productPath,
  productPathKey,
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
  refs: {
    logosTextureRef,
    maskTexturesRef,
    masksPatternKeyRef,
    initialLoadCompletedRef,
    transitionLoadCompletedRef,
    shaderUpgradePendingRef,
    cancelShaderUpgradeRef,
    logosTextureFailedRef,
    maskTexturesFailedKeyRef,
    pendingFrameReapplyRef,
  },
  reapplyAppearanceCore,
}: useGarmentLoadReadyOptionsType) => {
  const isCoreSceneReady = useCallback(() => {
    if (!hasMaterialsForParts(partIds)) return false;
    if (productPath !== productPathKey) return false;
    return true;
  }, [hasMaterialsForParts, partIds, productPath, productPathKey]);

  const hydrateAppearanceRefsFromCache = useCallback(() => {
    const cached = readProductAppearanceTextures(productPathKey);
    logosTextureRef.current = cached.logosTexture;
    maskTexturesRef.current = cached.maskTextures;
    masksPatternKeyRef.current = cached.masksPatternKey;
    pendingFrameReapplyRef.current = true;
  }, [logosTextureRef, maskTexturesRef, masksPatternKeyRef, pendingFrameReapplyRef, productPathKey]);

  const isGarmentAppearanceReady = useCallback(() => {
    if (!isCoreSceneReady()) return false;

    const logosSrc = defaultPattern?.parts[0]?.src;
    if (logosSrc && !logosTextureRef.current && !logosTextureFailedRef.current) {
      if (!isGarmentAppearanceCached(productPathKey, defaultPattern, activePatternKey)) return false;
    }

    if (activePatternKey) {
      const masksReady =
        masksPatternKeyRef.current === activePatternKey && (Boolean(maskTexturesRef.current[0]) || maskTexturesFailedKeyRef.current === activePatternKey);
      if (!masksReady && !isGarmentAppearanceCached(productPathKey, defaultPattern, activePatternKey)) return false;
    }

    return true;
  }, [
    activePatternKey,
    defaultPattern,
    isCoreSceneReady,
    logosTextureFailedRef,
    logosTextureRef,
    maskTexturesFailedKeyRef,
    maskTexturesRef,
    masksPatternKeyRef,
    productPathKey,
  ]);

  const finishSceneLoad = useCallback(
    (onLoaded: () => void) => {
      void (async () => {
        invalidate();
        await waitForPresenterFrames(invalidate, 4);
        onLoaded();
      })();
    },
    [invalidate],
  );

  const runShaderUpgrade = useCallback(
    (onLoaded?: () => void): boolean => {
      if (shaderUpgradePendingRef.current) return false;

      shaderUpgradePendingRef.current = true;
      cancelShaderUpgradeRef.current?.();

      cancelShaderUpgradeRef.current = compileGarmentShadersOverFrames({
        parts: product.parts,
        getMaterials,
        invalidate,
        onComplete: () => {
          shaderUpgradePendingRef.current = false;
          hydrateAppearanceRefsFromCache();
          reapplyAppearanceCore();
          bumpRevision();
          invalidate();
          if (onLoaded) finishSceneLoad(onLoaded);
        },
      });

      return true;
    },
    [
      bumpRevision,
      cancelShaderUpgradeRef,
      finishSceneLoad,
      getMaterials,
      hydrateAppearanceRefsFromCache,
      invalidate,
      product.parts,
      reapplyAppearanceCore,
      shaderUpgradePendingRef,
    ],
  );

  const pendingInitialPaintRef = useRef(false);
  const completedTransitionSessionRef = useRef(0);

  const completeInitialLoadAfterPaint = useCallback(() => {
    if (!pendingInitialPaintRef.current || initialLoadCompletedRef.current) return;
    if (!isGarmentAppearanceReady()) return;

    hydrateAppearanceRefsFromCache();

    pendingInitialPaintRef.current = false;
    initialLoadCompletedRef.current = true;
    const completeInitialLoad = () => {
      finishSceneLoad(() => {
        markInitialSceneLoaded();

        const sceneLoad = useConfiguratorSceneLoad.getState();
        if (sceneLoad.isSceneTransitionLoading) {
          sceneLoad.markSceneTransitionLoaded();
        }
      });
    };

    // Keep the initial loader visible until shader compilation finishes.
    runShaderUpgrade(completeInitialLoad);
  }, [
    finishSceneLoad,
    hydrateAppearanceRefsFromCache,
    initialLoadCompletedRef,
    isGarmentAppearanceReady,
    markInitialSceneLoaded,
    runShaderUpgrade,
  ]);

  const completeSceneLoadersIfReady = useCallback(() => {
    if (!initialLoadCompletedRef.current && isCoreSceneReady()) {
      pendingInitialPaintRef.current = true;
    }

    if (isSceneTransitionLoading && completedTransitionSessionRef.current !== transitionSession) {
      if (!isGarmentAppearanceReady()) return;

      hydrateAppearanceRefsFromCache();

      completedTransitionSessionRef.current = transitionSession;
      transitionLoadCompletedRef.current = true;
      if (!runShaderUpgrade(markSceneTransitionLoaded)) {
        finishSceneLoad(markSceneTransitionLoaded);
      }
    }
  }, [
    completedTransitionSessionRef,
    finishSceneLoad,
    hydrateAppearanceRefsFromCache,
    initialLoadCompletedRef,
    isCoreSceneReady,
    isGarmentAppearanceReady,
    isSceneTransitionLoading,
    markSceneTransitionLoaded,
    runShaderUpgrade,
    transitionLoadCompletedRef,
    transitionSession,
  ]);

  useEffect(() => {
    initialLoadCompletedRef.current = false;
    pendingInitialPaintRef.current = false;
    shaderUpgradePendingRef.current = false;
    cancelShaderUpgradeRef.current?.();
    cancelShaderUpgradeRef.current = null;
  }, [cancelShaderUpgradeRef, initialLoadCompletedRef, loaderSession, shaderUpgradePendingRef]);

  useEffect(() => {
    completedTransitionSessionRef.current = 0;
    transitionLoadCompletedRef.current = false;
    shaderUpgradePendingRef.current = false;
    cancelShaderUpgradeRef.current?.();
    cancelShaderUpgradeRef.current = null;
  }, [cancelShaderUpgradeRef, shaderUpgradePendingRef, transitionLoadCompletedRef, transitionSession]);

  useEffect(() => {
    transitionLoadCompletedRef.current = false;
    completedTransitionSessionRef.current = 0;
    shaderUpgradePendingRef.current = false;
    cancelShaderUpgradeRef.current?.();
    cancelShaderUpgradeRef.current = null;
  }, [activePatternKey, cancelShaderUpgradeRef, shaderUpgradePendingRef, transitionLoadCompletedRef]);

  return { completeSceneLoadersIfReady, completeInitialLoadAfterPaint };
};

export { useGarmentLoadReady };
export type { garmentLoadReadyRefsType };
