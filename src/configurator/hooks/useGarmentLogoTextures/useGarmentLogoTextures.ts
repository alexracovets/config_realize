'use client';

import type { Texture } from 'three';
import { LOGO_SLOT_COUNT } from '@configurator/constants';
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
  canvasToMaskTexture,
  composeLogoStampAtlas,
  getEmptyPrintTexture,
  loadCachedImage,
  repairPrintInstancePlacement,
  resolvePrintAtlasSize,
  resolveProductGizmoRotation,
} from '@configurator/utils';
import { useThree } from '@react-three/fiber';
import { resolveLogoInstancesForRender, useConfigurationControl, useConfiguratorProduct, useConfiguratorSceneLoad, useGarmentLogo } from '@store';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
const LOGO_STEP = 7;

const useGarmentLogoTextures = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const partIds = useMemo(() => product.parts.map((part) => part.id), [product.parts]);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const logoProductPath = useGarmentLogo((state) => state.productPath);
  const logoInstances = useGarmentLogo((state) => state.instances);
  const logoPreview = useGarmentLogo((state) => state.preview);
  const selectedInstanceId = useGarmentLogo((state) => state.selectedInstanceId);
  const gizmoIcons = useGizmoIconAtlas();
  const { getMaterials, hasMaterialsForParts } = useGarmentMaterialRegistry();
  const materialRevision = useMaterialRegistryRevision();
  const invalidate = useThree((state) => state.invalidate);
  const isLogoSynced = logoProductPath === product.path;
  const isSceneReady = isLogoSynced && hasMaterialsForParts(partIds) && !isInitialSceneLoading;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const stampCellSizeRef = useRef({ width: 1, height: 1 });
  const generationRef = useRef(0);
  const prevStampSignatureRef = useRef('');

  const instancesForRender = useMemo(
    () =>
      resolveLogoInstancesForRender(logoInstances, logoPreview)
        .slice(0, LOGO_SLOT_COUNT)
        .map((instance) => repairPrintInstancePlacement(instance, product.parts)),
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
    prevStampSignatureRef.current = '';
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

  const applyLogoStyleAndFrame = useCallback(() => {
    const cellSize = stampCellSizeRef.current;
    const gizmoRotation = resolveProductGizmoRotation(product);

    for (const part of product.parts) {
      const style = buildLogoStyleUniforms(instancesForRender, product.parts, part.id, cellSize, atlasSize.width);
      const frame = buildLogoGizmoFrameUniforms(instancesForRender, part.id, activeStep === LOGO_STEP, gizmoRotation);

      for (const material of getMaterials(part.id)) {
        applyGarmentGizmoRotation(material, gizmoRotation);
        applyGarmentPrintAtlasSize(material, atlasSize.width, atlasSize.height);
        applyGarmentLogoStyle(material, style);
        applyGarmentLogoGizmoFrame(material, frame);
        if (gizmoIcons) applyGarmentGizmoIcons(material, gizmoIcons);
      }
    }

    invalidate();
  }, [activeStep, atlasSize.height, atlasSize.width, getMaterials, gizmoIcons, instancesForRender, invalidate, product]);

  const applyStampToMaterials = useCallback(
    (texture: Texture, cellSize: { width: number; height: number }) => {
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyGarmentLogoStamp(material, { stamp: texture, cellSize });
        }
      }

      invalidate();
    },
    [getMaterials, invalidate, product.parts],
  );

  const updateLogoStamp = useCallback(async () => {
    if (!isLogoSynced) return;

    const generation = ++generationRef.current;
    const targetPath = product.path;
    const empty = getEmptyPrintTexture();

    if (instancesForRender.length === 0) {
      stampCellSizeRef.current = { width: 1, height: 1 };
      applyStampToMaterials(empty, { width: 1, height: 1 });
      applyLogoStyleAndFrame();
      return;
    }

    await ensureNaturalSizes();
    if (generation !== generationRef.current || useGarmentLogo.getState().productPath !== targetPath) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      textureRef.current = canvasToMaskTexture(canvasRef.current);
    }

    const latestInstances = resolveLogoInstancesForRender(useGarmentLogo.getState().instances, useGarmentLogo.getState().preview).slice(0, LOGO_SLOT_COUNT);

    const { cellSize } = await composeLogoStampAtlas({
      instances: latestInstances,
      canvas: canvasRef.current,
      atlasWidth: atlasSize.width,
      atlasHeight: atlasSize.height,
    });

    if (generation !== generationRef.current || useGarmentLogo.getState().productPath !== targetPath) return;

    stampCellSizeRef.current = cellSize;
    textureRef.current!.needsUpdate = true;
    applyStampToMaterials(textureRef.current!, cellSize);
    applyLogoStyleAndFrame();
  }, [
    applyLogoStyleAndFrame,
    applyStampToMaterials,
    atlasSize.height,
    atlasSize.width,
    ensureNaturalSizes,
    instancesForRender.length,
    isLogoSynced,
    product.path,
  ]);

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
      applyStampToMaterials(textureRef.current, stampCellSizeRef.current);
    }
  }, [applyLogoStyleAndFrame, applyStampToMaterials, isSceneReady, materialRevision, partIds, styleSignature]);

  useLogoUniformSync({ product, activeStep, selectedInstanceId, selectedSlotIndex });

  useEffect(() => () => clearRuntime(), [clearRuntime]);
};

export { useGarmentLogoTextures };
