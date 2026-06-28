'use client';

import { useMemo, useRef } from 'react';

import type { Texture } from 'three';

import type { patternMaskPairType } from '@configurator/types';
import { emptyMaskPair } from '@configurator/utils';

const useSyncGarmentMaterialsRefs = () => {
  const logosTextureRef = useRef<Texture | null>(null);
  const maskTexturesRef = useRef<patternMaskPairType>(emptyMaskPair());
  const masksPatternKeyRef = useRef<string | null>(null);
  const loadSessionRef = useRef(0);
  const pendingFrameReapplyRef = useRef(false);
  const initialLoadCompletedRef = useRef(false);
  const transitionLoadCompletedRef = useRef(false);
  const shaderUpgradePendingRef = useRef(false);
  const cancelShaderUpgradeRef = useRef<(() => void) | null>(null);
  const logosTextureFailedRef = useRef(false);
  const maskTexturesFailedKeyRef = useRef<string | null>(null);
  const lastPendingReapplyRef = useRef(0);

  const assetRefs = useMemo(
    () => ({
      logosTextureRef,
      maskTexturesRef,
      masksPatternKeyRef,
      loadSessionRef,
      logosTextureFailedRef,
      maskTexturesFailedKeyRef,
    }),
    [],
  );

  const sceneLoadRefs = useMemo(
    () => ({
      logosTextureRef,
      maskTexturesRef,
      masksPatternKeyRef,
      pendingFrameReapplyRef,
      initialLoadCompletedRef,
      transitionLoadCompletedRef,
      shaderUpgradePendingRef,
      cancelShaderUpgradeRef,
      logosTextureFailedRef,
      maskTexturesFailedKeyRef,
    }),
    [],
  );

  return {
    logosTextureRef,
    maskTexturesRef,
    masksPatternKeyRef,
    loadSessionRef,
    pendingFrameReapplyRef,
    lastPendingReapplyRef,
    initialLoadCompletedRef,
    transitionLoadCompletedRef,
    shaderUpgradePendingRef,
    cancelShaderUpgradeRef,
    logosTextureFailedRef,
    maskTexturesFailedKeyRef,
    assetRefs,
    sceneLoadRefs,
  };
};

export { useSyncGarmentMaterialsRefs };
