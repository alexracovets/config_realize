'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import type { Texture } from 'three';

import { useGarmentMaterialRegistry, useMaterialRegistryRevision, usePbrMaps } from '@providers';
import type { designPatternItemType, garmentPrintStateType, patternColorPairType, patternMaskPairType } from '@types';
import {
  DEFAULT_COLOR,
  DISABLED_PART_GRADIENT,
  resolveGradientColors,
  useConfigurationCart,
  useConfiguratorProduct,
  useConfiguratorSceneLoad,
  useGarmentColor,
  useGarmentDesign,
} from '@store';
import { PATTERN_LAYER_COUNT } from '@constants';
import {
  applyGarmentGradient,
  applyGarmentPartUvBounds,
  applyGarmentPatternTints,
  applyGarmentPrint,
  emptyMaskPair,
  GARMENT_SHADER_VERSION,
  imageToMaskTexture,
  imageToTexture,
  isColorOnlyGarmentPart,
  readProductAppearanceTextures,
  resolvePartUvBounds,
  resolvePbrTexturePaths,
  resolveRasterDesignSrc,
  scheduleGarmentShaderUpgrade,
  syncProductAppearanceTextures,
} from '@utils';

const DEFAULT_PATTERN_COLOR = '#000000';

const buildPatternColors = (
  pattern: designPatternItemType | null,
  patternColors: Record<string, string>,
  designLayerColors: Record<number, string>,
): patternColorPairType => {
  const colors: [string, string] = [designLayerColors[0] ?? DEFAULT_PATTERN_COLOR, designLayerColors[1] ?? DEFAULT_PATTERN_COLOR];

  if (!pattern) return colors;

  for (let index = 0; index < Math.min(pattern.parts.length, PATTERN_LAYER_COUNT); index += 1) {
    colors[index] = patternColors[pattern.parts[index].key] ?? designLayerColors[index] ?? DEFAULT_PATTERN_COLOR;
  }

  return colors;
};

const useGarmentTextures = () => {
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
  const requiresPbrMaps = useMemo(() => Boolean(resolvePbrTexturePaths(product)), [product]);
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

  const applyPrintState = useCallback(
    (state: garmentPrintStateType) => {
      const emptyState = buildEmptyPrintState();

      for (const part of product.parts) {
        const partState = isColorOnlyGarmentPart(part) ? emptyState : state;

        for (const material of getMaterials(part.id)) {
          applyGarmentPrint(material, partState);
        }
      }
      invalidate();
    },
    [buildEmptyPrintState, getMaterials, invalidate, product.parts],
  );

  const applyPartColors = useCallback(() => {
    for (const part of product.parts) {
      const color = byPart[part.id] ?? DEFAULT_COLOR;
      const gradient = isColorOnlyGarmentPart(part) ? DISABLED_PART_GRADIENT : (gradientsByPart[part.id] ?? DISABLED_PART_GRADIENT);
      const { fabricColor, gradientColor2 } = resolveGradientColors(color, gradient);
      const uvBounds = resolvePartUvBounds(part);

      for (const material of getMaterials(part.id)) {
        material.color.set(fabricColor);
        material.map = null;
        applyGarmentPartUvBounds(material, uvBounds);
        applyGarmentGradient(material, { ...gradient, color2: gradientColor2 });
        material.needsUpdate = true;
      }
    }

    invalidate();
  }, [byPart, getMaterials, gradientsByPart, invalidate, product.parts]);

  const applyPatternTints = useCallback(() => {
    const colors = buildPatternColors(activePattern, patternColors, designLayerColors);

    for (const part of product.parts) {
      if (isColorOnlyGarmentPart(part)) continue;

      for (const material of getMaterials(part.id)) {
        applyGarmentPatternTints(material, colors, activeOpacity);
      }
    }

    invalidate();
  }, [activeOpacity, activePattern, designLayerColors, getMaterials, invalidate, patternColors, product.parts]);

  const activePatternKey = activePattern?.key ?? null;

  const isInitialAppearanceReady = useCallback(() => {
    if (!hasMaterialsForParts(partIds)) return false;
    if (requiresPbrMaps && !pbrMaps) return false;
    if (productPath !== product.path) return false;
    if (pendingFrameReapplyRef.current) return false;

    const logosSrc = defaultPattern?.parts[0]?.src ? resolveRasterDesignSrc(defaultPattern.parts[0].src) : null;
    if (logosSrc && !logosTextureRef.current && !logosTextureFailedRef.current) return false;

    if (activePatternKey) {
      const masksReady =
        masksPatternKeyRef.current === activePatternKey && (Boolean(maskTexturesRef.current[0]) || maskTexturesFailedKeyRef.current === activePatternKey);
      if (!masksReady) return false;
    }

    return true;
  }, [activePatternKey, defaultPattern, hasMaterialsForParts, partIds, pbrMaps, product.path, productPath, requiresPbrMaps]);

  const reapplyAppearanceCore = useCallback(() => {
    if (!hasMaterialsForParts(partIds)) {
      pendingFrameReapplyRef.current = true;
      return;
    }

    pendingFrameReapplyRef.current = false;
    applyPartColors();

    if (productPath !== product.path) return;

    applyPatternTints();
    applyPrintState(buildPrintState());
  }, [applyPartColors, applyPatternTints, applyPrintState, buildPrintState, hasMaterialsForParts, partIds, product.path, productPath]);

  const finishSceneLoad = useCallback(
    (onLoaded: () => void) => {
      invalidate();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onLoaded();
        });
      });
    },
    [invalidate],
  );

  const materialsNeedShaderUpgrade = useCallback(() => {
    return product.parts.some((part) =>
      getMaterials(part.id).some(
        (material) => material.userData.garmentShaderMode !== 'full' || material.userData.garmentShaderVersion !== GARMENT_SHADER_VERSION,
      ),
    );
  }, [getMaterials, product.parts]);

  const scheduleFullShaderUpgrade = useCallback(
    (onLoaded: () => void): boolean => {
      if (shaderUpgradePendingRef.current) return false;

      shaderUpgradePendingRef.current = true;
      cancelShaderUpgradeRef.current?.();

      cancelShaderUpgradeRef.current = scheduleGarmentShaderUpgrade({
        parts: product.parts,
        getMaterials,
        invalidate,
        onComplete: () => {
          shaderUpgradePendingRef.current = false;
          reapplyAppearanceCore();
          bumpRevision();
          invalidate();
          finishSceneLoad(onLoaded);
        },
      });

      return true;
    },
    [bumpRevision, finishSceneLoad, getMaterials, invalidate, product.parts, reapplyAppearanceCore],
  );

  const completeSceneLoadersIfReady = useCallback(() => {
    if (!isInitialAppearanceReady()) return;

    if (materialsNeedShaderUpgrade()) {
      if (isInitialSceneLoading && !initialLoadCompletedRef.current) {
        if (scheduleFullShaderUpgrade(markInitialSceneLoaded)) {
          initialLoadCompletedRef.current = true;
        }
        return;
      }

      if (isSceneTransitionLoading && !transitionLoadCompletedRef.current) {
        if (scheduleFullShaderUpgrade(markSceneTransitionLoaded)) {
          transitionLoadCompletedRef.current = true;
        }
      }

      return;
    }

    if (isInitialSceneLoading && !initialLoadCompletedRef.current) {
      initialLoadCompletedRef.current = true;
      finishSceneLoad(markInitialSceneLoaded);
      return;
    }

    if (isSceneTransitionLoading && !transitionLoadCompletedRef.current) {
      transitionLoadCompletedRef.current = true;
      finishSceneLoad(markSceneTransitionLoaded);
    }
  }, [
    finishSceneLoad,
    isInitialAppearanceReady,
    isInitialSceneLoading,
    isSceneTransitionLoading,
    markInitialSceneLoaded,
    markSceneTransitionLoaded,
    materialsNeedShaderUpgrade,
    scheduleFullShaderUpgrade,
  ]);

  const reapplyAppearance = useCallback(() => {
    reapplyAppearanceCore();
    completeSceneLoadersIfReady();
  }, [completeSceneLoadersIfReady, reapplyAppearanceCore]);

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
    initialLoadCompletedRef.current = false;
    transitionLoadCompletedRef.current = false;
    shaderUpgradePendingRef.current = false;
    cancelShaderUpgradeRef.current?.();
    cancelShaderUpgradeRef.current = null;
  }, [loaderSession]);

  useEffect(() => {
    transitionLoadCompletedRef.current = false;
    shaderUpgradePendingRef.current = false;
  }, [activePatternKey]);

  useLayoutEffect(() => {
    reapplyAppearance();
  }, [activeItemId, activeOpacity, activePatternKey, byPart, gradientsByPart, materialRevision, patternColors, reapplyAppearance]);

  useFrame(() => {
    if (!pendingFrameReapplyRef.current) return;

    const now = performance.now();
    if (now - lastPendingReapplyRef.current < 48) return;
    lastPendingReapplyRef.current = now;

    reapplyAppearance();
  });

  useEffect(() => {
    if (productPath !== product.path) return;

    const logosSrc = defaultPattern?.parts[0]?.src ? resolveRasterDesignSrc(defaultPattern.parts[0].src) : null;
    if (!logosSrc) return;

    if (logosTextureRef.current) return;

    const session = loadSessionRef.current;
    const targetPath = product.path;
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
  }, [defaultPattern, isLoadSessionActive, product.path, productPath, reapplyAppearance, syncAppearanceCache, textureAnisotropy]);

  useEffect(() => {
    if (productPath !== product.path) return;

    if (!activePatternKey) {
      maskTexturesRef.current = emptyMaskPair();
      masksPatternKeyRef.current = null;
      syncAppearanceCache(product.path);
      reapplyAppearance();
      return;
    }

    if (masksPatternKeyRef.current === activePatternKey && maskTexturesRef.current[0]) return;

    const session = loadSessionRef.current;
    const targetPath = product.path;
    let cancelled = false;

    const loadMasks = async () => {
      try {
        const masks = emptyMaskPair();

        await Promise.all(
          activePattern!.parts.slice(0, PATTERN_LAYER_COUNT).map(async (part, index) => {
            masks[index] = await imageToMaskTexture(resolveRasterDesignSrc(part.src), { anisotropy: textureAnisotropy });
          }),
        );

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
  }, [activePattern, activePatternKey, isLoadSessionActive, product.path, productPath, reapplyAppearance, syncAppearanceCache, textureAnisotropy]);
};

export { useGarmentTextures };
