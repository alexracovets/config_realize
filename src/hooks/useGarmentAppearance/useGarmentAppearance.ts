'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import type { Texture } from 'three';

import { useGarmentMaterialRegistry, useMaterialRegistryRevision, usePbrMaps } from '@providers';
import type { garmentPrintStateType, patternMaskPairType } from '@types';
import {
  useConfigurationCart,
  useConfiguratorProduct,
  useConfiguratorSceneLoad,
  useGarmentColor,
  useGarmentDesign,
} from '@store';
import { emptyMaskPair, readProductAppearanceTextures, syncProductAppearanceTextures } from '@utils';

import { applyPartColors, applyPatternTints, applyPrintState } from './applyGarmentAppearance';
import { buildPatternColors } from './buildPatternColors';
import { useGarmentPatternAssets } from './useGarmentPatternAssets';
import { useGarmentAppearanceSceneLoad } from './useGarmentAppearanceSceneLoad';

/** Syncs colore, design, and shading store state onto garment materials (R3F side-effect hook). */
const useGarmentAppearance = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const partIds = useMemo(() => product.parts.map((part) => part.id), [product.parts]);
  const byPart = useGarmentColor((state) => state.byPart);
  const gradientsByPart = useGarmentColor((state) => state.gradientsByPart);
  const productPath = useGarmentDesign((state) => state.productPath);
  const activePattern = useGarmentDesign((state) => state.activePattern);
  const patternColors = useGarmentDesign((state) => state.patternColors);
  const designLayerColors = useGarmentDesign((state) => state.designLayerColors);
  const activeOpacity = useGarmentDesign((state) => state.activeOpacity);
  const defaultPattern = useGarmentDesign((state) => state.defaultPattern);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const markInitialSceneLoaded = useConfiguratorSceneLoad((state) => state.markInitialSceneLoaded);
  const markSceneTransitionLoaded = useConfiguratorSceneLoad((state) => state.markSceneTransitionLoaded);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const loaderSession = useConfiguratorSceneLoad((state) => state.loaderSession);
  const { bumpRevision, getMaterials, hasMaterialsForParts } = useGarmentMaterialRegistry();
  const materialRevision = useMaterialRegistryRevision();
  const pbrMaps = usePbrMaps();
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const textureAnisotropy = gl.capabilities.getMaxAnisotropy();

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

  const applyContext = useMemo(
    () => ({ product, byPart, gradientsByPart, getMaterials, invalidate }),
    [byPart, getMaterials, gradientsByPart, invalidate, product],
  );

  const activePatternKey = activePattern?.key ?? null;

  const syncAppearanceCache = useCallback((targetPath: string) => {
    syncProductAppearanceTextures(targetPath, {
      logosTexture: logosTextureRef.current,
      maskTextures: maskTexturesRef.current,
      masksPatternKey: masksPatternKeyRef.current,
    });
  }, []);

  const isLoadSessionActive = useCallback(
    (session: number, targetPath: string) => {
      return session === loadSessionRef.current && useGarmentDesign.getState().productPath === targetPath && targetPath === product.path;
    },
    [product.path],
  );

  const buildPrintState = useCallback((): garmentPrintStateType => {
    return {
      defaultLogos: logosTextureRef.current ?? emptyMaskPair()[0],
      patternMasks: maskTexturesRef.current,
      patternColors: buildPatternColors(activePattern, patternColors, designLayerColors),
      patternOpacity: activeOpacity,
    };
  }, [activeOpacity, activePattern, designLayerColors, patternColors]);

  const buildEmptyPrintState = useCallback((): garmentPrintStateType => {
    const emptyMasks = emptyMaskPair();
    return {
      defaultLogos: emptyMasks[0],
      patternMasks: emptyMasks,
      patternColors: buildPatternColors(null, {}, designLayerColors),
      patternOpacity: 0,
    };
  }, [designLayerColors]);

  const reapplyAppearanceCore = useCallback(() => {
    if (!hasMaterialsForParts(partIds)) {
      pendingFrameReapplyRef.current = true;
      return;
    }

    pendingFrameReapplyRef.current = false;
    applyPartColors(applyContext);

    if (productPath !== product.path) return;

    applyPatternTints(applyContext, buildPatternColors(activePattern, patternColors, designLayerColors), activeOpacity);
    applyPrintState(applyContext, buildPrintState(), buildEmptyPrintState());
  }, [
    activeOpacity,
    activePattern,
    applyContext,
    buildEmptyPrintState,
    buildPrintState,
    designLayerColors,
    hasMaterialsForParts,
    partIds,
    patternColors,
    product.path,
    productPath,
  ]);

  const { completeSceneLoadersIfReady, completeInitialLoadAfterPaint } = useGarmentAppearanceSceneLoad({
    product,
    partIds,
    productPath,
    productPathKey: product.path,
    activePatternKey,
    defaultPattern,
    pbrMaps,
    hasMaterialsForParts,
    getMaterials,
    bumpRevision,
    invalidate,
    isInitialSceneLoading,
    isSceneTransitionLoading,
    markInitialSceneLoaded,
    markSceneTransitionLoaded,
    loaderSession,
    refs: sceneLoadRefs,
    reapplyAppearanceCore,
  });

  const reapplyAppearance = useCallback(() => {
    reapplyAppearanceCore();
    completeSceneLoadersIfReady();
  }, [completeSceneLoadersIfReady, reapplyAppearanceCore]);

  useGarmentPatternAssets({
    productPath,
    productPathKey: product.path,
    defaultPattern,
    activePattern,
    activePatternKey,
    textureAnisotropy,
    refs: assetRefs,
    syncAppearanceCache,
    isLoadSessionActive,
    reapplyAppearance,
  });

  useEffect(() => {
    const cached = readProductAppearanceTextures(product.path);
    logosTextureRef.current = cached.logosTexture;
    maskTexturesRef.current = cached.maskTextures;
    masksPatternKeyRef.current = cached.masksPatternKey;
    pendingFrameReapplyRef.current = true;
  }, [activeItemId, product.path]);

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
  }, [product.path]);

  useEffect(() => {
    reapplyAppearance();
  }, [loaderSession, reapplyAppearance]);

  useLayoutEffect(() => {
    reapplyAppearance();
  }, [activeItemId, activeOpacity, activePatternKey, byPart, gradientsByPart, materialRevision, patternColors, reapplyAppearance]);

  useFrame(() => {
    completeInitialLoadAfterPaint();

    if (!pendingFrameReapplyRef.current) return;

    const now = performance.now();
    if (now - lastPendingReapplyRef.current < 48) return;
    lastPendingReapplyRef.current = now;

    reapplyAppearance();
  });
};

export { useGarmentAppearance };
