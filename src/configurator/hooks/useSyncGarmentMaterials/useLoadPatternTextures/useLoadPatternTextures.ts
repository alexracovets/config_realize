'use client';

import { type RefObject, useCallback, useEffect } from 'react';

import type { Texture } from 'three';

import type { patternMaskPairType } from '@configurator/types';
import type { designPatternItemType } from '@types';
import { PATTERN_LAYER_COUNT } from '@configurator/constants';
import { useConfiguratorSceneLoad, useGarmentDesign } from '@store';
import {
  emptyMaskPair,
  imageToMaskTexture,
  imageToTexture,
  readProductAppearanceTextures,
  resolveRasterDesignSrc,
  syncProductAppearanceTextures,
  yieldToMain,
} from '@configurator/utils';

type garmentPrintAssetsRefsType = {
  logosTextureRef: RefObject<Texture | null>;
  maskTexturesRef: RefObject<patternMaskPairType>;
  masksPatternKeyRef: RefObject<string | null>;
  loadSessionRef: RefObject<number>;
  initialLoadCompletedRef: RefObject<boolean>;
  transitionLoadCompletedRef: RefObject<boolean>;
  shaderUpgradePendingRef: RefObject<boolean>;
  cancelShaderUpgradeRef: RefObject<(() => void) | null>;
  logosTextureFailedRef: RefObject<boolean>;
  maskTexturesFailedKeyRef: RefObject<string | null>;
  pendingFrameReapplyRef: RefObject<boolean>;
};

type useLoadPatternTexturesOptionsType = {
  productPath: string | null;
  productPathKey: string;
  defaultPattern: designPatternItemType | null;
  activePattern: designPatternItemType | null;
  activePatternKey: string | null;
  textureAnisotropy: number;
  activeItemId: string | null;
  refs: garmentPrintAssetsRefsType;
  reapplyAppearance: () => void;
};

const useLoadPatternTextures = ({
  productPath,
  productPathKey,
  defaultPattern,
  activePattern,
  activePatternKey,
  textureAnisotropy,
  activeItemId,
  refs: {
    logosTextureRef,
    maskTexturesRef,
    masksPatternKeyRef,
    loadSessionRef,
    initialLoadCompletedRef,
    transitionLoadCompletedRef,
    shaderUpgradePendingRef,
    cancelShaderUpgradeRef,
    logosTextureFailedRef,
    maskTexturesFailedKeyRef,
    pendingFrameReapplyRef,
  },
  reapplyAppearance,
}: useLoadPatternTexturesOptionsType) => {
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);

  const syncAppearanceCache = useCallback(
    (targetPath: string) => {
      syncProductAppearanceTextures(targetPath, {
        logosTexture: logosTextureRef.current,
        maskTextures: maskTexturesRef.current,
        masksPatternKey: masksPatternKeyRef.current,
      });
    },
    [logosTextureRef, maskTexturesRef, masksPatternKeyRef],
  );

  const isLoadSessionActive = useCallback(
    (session: number, targetPath: string) => {
      return session === loadSessionRef.current && useGarmentDesign.getState().productPath === targetPath && targetPath === productPathKey;
    },
    [loadSessionRef, productPathKey],
  );

  useEffect(() => {
    const cached = readProductAppearanceTextures(productPathKey);
    logosTextureRef.current = cached.logosTexture;
    maskTexturesRef.current = cached.maskTextures;
    masksPatternKeyRef.current = cached.masksPatternKey;
    pendingFrameReapplyRef.current = true;
  }, [activeItemId, logosTextureRef, maskTexturesRef, masksPatternKeyRef, pendingFrameReapplyRef, productPathKey]);

  useEffect(() => {
    loadSessionRef.current += 1;
    initialLoadCompletedRef.current = false;
    transitionLoadCompletedRef.current = false;
    shaderUpgradePendingRef.current = false;
    logosTextureFailedRef.current = false;
    maskTexturesFailedKeyRef.current = null;
    cancelShaderUpgradeRef.current?.();
    cancelShaderUpgradeRef.current = null;

    return () => {
      loadSessionRef.current += 1;
      shaderUpgradePendingRef.current = false;
      cancelShaderUpgradeRef.current?.();
      cancelShaderUpgradeRef.current = null;
    };
  }, [
    cancelShaderUpgradeRef,
    initialLoadCompletedRef,
    loadSessionRef,
    logosTextureFailedRef,
    maskTexturesFailedKeyRef,
    productPathKey,
    shaderUpgradePendingRef,
    transitionLoadCompletedRef,
  ]);

  useEffect(() => {
    if (productPath !== productPathKey || isInitialSceneLoading) return;

    const logosSrc = defaultPattern?.parts[0]?.src ? resolveRasterDesignSrc(defaultPattern.parts[0].src) : null;
    if (!logosSrc || logosTextureRef.current) return;

    const session = loadSessionRef.current;
    const targetPath = productPathKey;
    let cancelled = false;

    void imageToTexture(logosSrc, { anisotropy: textureAnisotropy })
      .then((texture) => {
        if (cancelled || !isLoadSessionActive(session, targetPath)) return;

        logosTextureRef.current = texture;
        syncAppearanceCache(targetPath);
        reapplyAppearance();
      })
      .catch(() => {
        if (cancelled || !isLoadSessionActive(session, targetPath)) return;

        logosTextureFailedRef.current = true;
        reapplyAppearance();
      });

    return () => {
      cancelled = true;
    };
  }, [
    defaultPattern,
    isInitialSceneLoading,
    isLoadSessionActive,
    logosTextureFailedRef,
    logosTextureRef,
    productPath,
    productPathKey,
    reapplyAppearance,
    loadSessionRef,
    syncAppearanceCache,
    textureAnisotropy,
  ]);

  useEffect(() => {
    if (productPath !== productPathKey || isInitialSceneLoading) return;

    if (!activePatternKey) {
      maskTexturesRef.current = emptyMaskPair();
      masksPatternKeyRef.current = null;
      syncAppearanceCache(productPathKey);
      reapplyAppearance();
      return;
    }

    if (masksPatternKeyRef.current === activePatternKey && maskTexturesRef.current[0]) return;

    const session = loadSessionRef.current;
    const targetPath = productPathKey;
    let cancelled = false;

    const loadMasks = async () => {
      try {
        const masks = emptyMaskPair();
        const patternParts = activePattern!.parts.slice(0, PATTERN_LAYER_COUNT);

        for (let index = 0; index < patternParts.length; index += 1) {
          masks[index] = await imageToMaskTexture(resolveRasterDesignSrc(patternParts[index].src), { anisotropy: textureAnisotropy });
          await yieldToMain();
          if (cancelled || !isLoadSessionActive(session, targetPath)) return;
        }

        if (cancelled || !isLoadSessionActive(session, targetPath)) return;

        maskTexturesRef.current = masks;
        masksPatternKeyRef.current = activePatternKey;
        syncAppearanceCache(targetPath);
        reapplyAppearance();
      } catch {
        if (cancelled || !isLoadSessionActive(session, targetPath)) return;

        maskTexturesRef.current = emptyMaskPair();
        masksPatternKeyRef.current = activePatternKey;
        maskTexturesFailedKeyRef.current = activePatternKey;
        syncAppearanceCache(targetPath);
        reapplyAppearance();
      }
    };

    void loadMasks();

    return () => {
      cancelled = true;
    };
  }, [
    activePattern,
    activePatternKey,
    isInitialSceneLoading,
    isLoadSessionActive,
    maskTexturesFailedKeyRef,
    maskTexturesRef,
    masksPatternKeyRef,
    productPath,
    productPathKey,
    reapplyAppearance,
    loadSessionRef,
    syncAppearanceCache,
    textureAnisotropy,
  ]);
};

export { useLoadPatternTextures };
