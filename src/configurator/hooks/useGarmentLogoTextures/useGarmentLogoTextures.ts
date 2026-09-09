'use client';

import type { logoInstanceType } from '@types';
import type { Texture } from 'three';
import { registerGarmentLogoE2eDebug, setGarmentLogoE2eStampCanvas } from '@configurator/hooks/registerGarmentLogoE2eDebug';
import { buildLogoStampSignature, buildLogoStyleSignature } from '@configurator/hooks/useGarmentLogoTextures/logoTextureSignatures';
import { useLogoUniformSync } from '@configurator/hooks/useGarmentLogoTextures/useLogoUniformSync';
import { useGizmoIconAtlas } from '@configurator/hooks/useGizmoIconAtlas';
import { useGarmentMaterialRegistry, useMaterialRegistryRevision } from '@configurator/providers';
import {
  applyGarmentGizmoIcons,
  applyGarmentGizmoRotation,
  applyGarmentLogoGizmoFrame,
  applyGarmentLogoStamp,
  applyGarmentLogoStyle,
  applyGarmentPrintAtlasSize,
  buildLogoGizmoFrameUniforms,
  buildLogoStyleUniforms,
  canvasToLogoLayerTexture,
  compileGarmentShader,
  composeLogoStampAtlas,
  getEmptyPrintTexture,
  loadCachedImage,
  repairPrintInstancePlacement,
  resolveGarmentPrintFeatureFlags,
  resolveLogoShaderSlotCount,
  resolveLogoStampAtlasGrid,
  resolvePrintAtlasSize,
  resolveProductGizmoRotation,
} from '@configurator/utils';
import { useThree } from '@react-three/fiber';
import { resolveLogoInstancesForRender, useConfigurationControl, useConfiguratorProduct, useConfiguratorSceneLoad, useGarmentLogo } from '@store';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
const LOGO_STEP = 7;
const DEFAULT_STAMP_GRID = resolveLogoStampAtlasGrid();

const useGarmentLogoTextures = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const partIds = useMemo(() => product.parts.map((part) => part.id), [product.parts]);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const isGizmoVisible = useConfigurationControl((state) => state.isGizmoVisible);
  const logoProductPath = useGarmentLogo((state) => state.productPath);
  const logoInstances = useGarmentLogo((state) => state.instances);
  const logoPreview = useGarmentLogo((state) => state.preview);
  const selectedInstanceId = useGarmentLogo((state) => state.selectedInstanceId);
  const gizmoIcons = useGizmoIconAtlas();
  const { getMaterials, hasMaterialsForParts } = useGarmentMaterialRegistry();
  const materialRevision = useMaterialRegistryRevision();
  const invalidate = useThree((state) => state.invalidate);
  const isLogoSynced = logoProductPath === product.path;
  const isSceneReady = isLogoSynced && hasMaterialsForParts(partIds) && !isInitialSceneLoading && !isSceneTransitionLoading;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const stampCellSizeRef = useRef({ width: 1, height: 1 });
  const stampGridRef = useRef(DEFAULT_STAMP_GRID);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const generationRef = useRef(0);
  const prevStampSignatureRef = useRef('');

  const instancesForRender = useMemo(
    () => resolveLogoInstancesForRender(logoInstances, logoPreview).map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [logoInstances, logoPreview, product.parts],
  );
  const stampSignature = useMemo(() => buildLogoStampSignature(instancesForRender), [instancesForRender]);
  const styleSignature = useMemo(() => buildLogoStyleSignature(instancesForRender), [instancesForRender]);
  const atlasSize = useMemo(() => resolvePrintAtlasSize(product), [product]);
  const selectedSlotIndex = useMemo(() => {
    if (activeStep !== LOGO_STEP || !selectedInstanceId) return -1;
    return instancesForRender.findIndex((instance) => instance.id === selectedInstanceId);
  }, [activeStep, instancesForRender, selectedInstanceId]);

  const clearRuntime = useCallback(() => {
    textureRef.current?.dispose();
    textureRef.current = null;
    canvasRef.current = null;
    stampCellSizeRef.current = { width: 1, height: 1 };
    stampGridRef.current = DEFAULT_STAMP_GRID;
    canvasSizeRef.current = { width: 0, height: 0 };
    prevStampSignatureRef.current = '';
    setGarmentLogoE2eStampCanvas(null);
  }, []);

  const ensureNaturalSizes = useCallback(async () => {
    const updates = await Promise.all(
      instancesForRender.map(async (instance) => {
        if (instance.naturalWidth > 0 && instance.naturalHeight > 0) return null;
        try {
          const image = await loadCachedImage(instance.src);
          return { id: instance.id, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
        } catch {
          return null;
        }
      }),
    );

    const patches = updates.filter((item): item is NonNullable<typeof item> => item !== null);
    if (patches.length === 0) return;

    const store = useGarmentLogo.getState();
    patches.forEach((patch) => {
      store.updateInstance(patch.id, { naturalWidth: patch.naturalWidth, naturalHeight: patch.naturalHeight });
    });
  }, [instancesForRender]);

  const ensureLogoSlotCapacity = useCallback(
    (instanceCount: number) => {
      const features = resolveGarmentPrintFeatureFlags(product, instanceCount);
      const capacity = features.useLogo ? resolveLogoShaderSlotCount(instanceCount) : 0;

      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          if (material.userData.garmentLogoSlotCapacity === capacity) continue;

          material.userData.garmentLogoSlotCapacity = capacity;
          compileGarmentShader(material, features);
        }
      }
    },
    [getMaterials, product],
  );

  const applyLogoStyleAndFrame = useCallback(
    (instances: logoInstanceType[] = instancesForRender) => {
      ensureLogoSlotCapacity(instances.length);

      const cellSize = stampCellSizeRef.current;
      const gizmoRotation = resolveProductGizmoRotation(product);

      for (const part of product.parts) {
        const style = buildLogoStyleUniforms(instances, product.parts, part.id, cellSize, atlasSize.width, stampGridRef.current);
        const frame = buildLogoGizmoFrameUniforms(instances, part.id, activeStep === LOGO_STEP && isGizmoVisible, gizmoRotation);

        for (const material of getMaterials(part.id)) {
          applyGarmentGizmoRotation(material, gizmoRotation);
          applyGarmentPrintAtlasSize(material, atlasSize.width, atlasSize.height);
          applyGarmentLogoStyle(material, style);
          applyGarmentLogoGizmoFrame(material, frame);
          if (gizmoIcons) applyGarmentGizmoIcons(material, gizmoIcons);
        }
      }

      invalidate();
    },
    [activeStep, atlasSize.height, atlasSize.width, ensureLogoSlotCapacity, getMaterials, gizmoIcons, instancesForRender, invalidate, isGizmoVisible, product],
  );

  const applyStampToMaterials = useCallback(
    (texture: Texture, cellSize: { width: number; height: number }, grid: number) => {
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyGarmentLogoStamp(material, { stamp: texture, cellSize, grid });
        }
      }

      invalidate();
    },
    [getMaterials, invalidate, product.parts],
  );

  const syncStampTexture = (canvas: HTMLCanvasElement) => {
    const sizeChanged = !textureRef.current || canvasSizeRef.current.width !== canvas.width || canvasSizeRef.current.height !== canvas.height;

    if (sizeChanged) {
      textureRef.current?.dispose();
      textureRef.current = canvasToLogoLayerTexture(canvas);
      canvasSizeRef.current = { width: canvas.width, height: canvas.height };
      return;
    }

    const texture = textureRef.current;
    if (!texture) return;
    texture.needsUpdate = true;
    texture.source.needsUpdate = true;
  };

  const updateLogoStamp = useCallback(async () => {
    if (!isLogoSynced) return;

    const generation = ++generationRef.current;
    const targetPath = product.path;
    const empty = getEmptyPrintTexture();

    if (instancesForRender.length === 0) {
      stampCellSizeRef.current = { width: 1, height: 1 };
      stampGridRef.current = DEFAULT_STAMP_GRID;
      setGarmentLogoE2eStampCanvas(null);
      applyStampToMaterials(empty, { width: 1, height: 1 }, DEFAULT_STAMP_GRID);
      applyLogoStyleAndFrame([]);
      return;
    }

    await ensureNaturalSizes();
    if (generation !== generationRef.current || useGarmentLogo.getState().productPath !== targetPath) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const latestInstances = resolveLogoInstancesForRender(useGarmentLogo.getState().instances, useGarmentLogo.getState().preview);

    const { cellSize, referenceCellSize, grid } = await composeLogoStampAtlas({
      instances: latestInstances,
      canvas: canvasRef.current,
    });

    if (generation !== generationRef.current || useGarmentLogo.getState().productPath !== targetPath) return;

    stampCellSizeRef.current = referenceCellSize;
    stampGridRef.current = grid;
    syncStampTexture(canvasRef.current);
    setGarmentLogoE2eStampCanvas(canvasRef.current, {
      grid,
      canvasWidth: canvasRef.current.width,
      canvasHeight: canvasRef.current.height,
      cellWidth: cellSize.width,
      cellHeight: cellSize.height,
    });
    applyStampToMaterials(textureRef.current!, referenceCellSize, grid);
    applyLogoStyleAndFrame(latestInstances);
  }, [applyLogoStyleAndFrame, applyStampToMaterials, ensureNaturalSizes, instancesForRender.length, isLogoSynced, product.path]);

  useEffect(() => {
    if (!isLogoSynced) {
      clearRuntime();
      return;
    }

    if (!hasMaterialsForParts(partIds) || !isSceneReady) return;

    if (prevStampSignatureRef.current === stampSignature) return;
    prevStampSignatureRef.current = stampSignature;

    void updateLogoStamp();
  }, [clearRuntime, hasMaterialsForParts, isLogoSynced, isSceneReady, partIds, stampSignature, updateLogoStamp]);

  useLayoutEffect(() => {
    if (!isSceneReady) return;

    applyLogoStyleAndFrame();

    if (textureRef.current) {
      applyStampToMaterials(textureRef.current, stampCellSizeRef.current, stampGridRef.current);
    }
  }, [applyLogoStyleAndFrame, applyStampToMaterials, isSceneReady, materialRevision, partIds, styleSignature]);

  useLogoUniformSync({ product, activeStep, isGizmoVisible, selectedInstanceId, selectedSlotIndex });

  useEffect(() => registerGarmentLogoE2eDebug(), []);
  useEffect(() => () => clearRuntime(), [clearRuntime]);
};

export { useGarmentLogoTextures };
