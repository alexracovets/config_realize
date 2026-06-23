'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import type { Texture } from 'three';

import {
  getGizmoButtonsRevealUniforms,
  getGizmoHoverUniforms,
  setGizmoButtonsRevealTarget,
  subscribeGizmoButtonHover,
  subscribeGizmoButtonReveal,
} from '@gizmo';
import { useGizmoIconAtlas } from '@hooks';
import { useGarmentMaterialRegistry, useMaterialRegistryRevision } from '@providers';
import { resolveLogoInstancesForRender, useConfigurationControl, useConfiguratorProduct, useGarmentLogo } from '@store';
import { LOGO_SLOT_COUNT } from '@constants';
import {
  applyGarmentGizmoHover,
  applyGarmentGizmoIcons,
  applyGarmentGizmoRotation,
  applyGarmentLogoGizmoButtonsReveal,
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
} from '@utils';

const NAME_STEP = 4;
const LOGO_STEP = 7;

const buildLogoStampSignature = (instances: ReturnType<typeof resolveLogoInstancesForRender>) =>
  JSON.stringify(
    instances.map((instance) => ({
      id: instance.id,
      src: instance.src,
      opacity: instance.opacity,
      naturalWidth: instance.naturalWidth,
      naturalHeight: instance.naturalHeight,
    })),
  );

const buildLogoStyleSignature = (instances: ReturnType<typeof resolveLogoInstancesForRender>) =>
  JSON.stringify(
    instances.map((instance) => ({
      id: instance.id,
      uv: instance.uv,
      rotation: instance.rotation,
      uploadRotation: instance.uploadRotation ?? 0,
      scale: instance.scale,
      partId: instance.partId,
      showFrame: instance.showFrame,
      showGizmo: instance.showGizmo,
    })),
  );

const useGarmentLogoTextures = () => {
  const product = useConfiguratorProduct((state) => state.product);
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const stampCellSizeRef = useRef({ width: 1, height: 1 });
  const generationRef = useRef(0);
  const prevStampSignatureRef = useRef('');
  const prevSelectedIdRef = useRef<string | null>(null);
  const prevSelectedSlotRef = useRef(-1);

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
      const style = buildLogoStyleUniforms(instancesForRender, product.parts, part.id, cellSize, atlasSize.width, atlasSize.height);
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

    if (!hasMaterialsForParts(partIds)) return;

    if (prevStampSignatureRef.current === stampSignature) return;
    prevStampSignatureRef.current = stampSignature;

    void updateLogoStamp();
  }, [clearRuntime, hasMaterialsForParts, isLogoSynced, partIds, stampSignature, updateLogoStamp]);

  useLayoutEffect(() => {
    if (!isLogoSynced || !hasMaterialsForParts(partIds)) return;

    applyLogoStyleAndFrame();

    if (textureRef.current) {
      applyStampToMaterials(textureRef.current, stampCellSizeRef.current);
    }
  }, [applyLogoStyleAndFrame, applyStampToMaterials, hasMaterialsForParts, isLogoSynced, materialRevision, partIds, styleSignature]);

  useEffect(() => {
    if (activeStep !== LOGO_STEP) return;

    const snap =
      prevSelectedIdRef.current === selectedInstanceId &&
      prevSelectedSlotRef.current !== selectedSlotIndex &&
      prevSelectedSlotRef.current >= 0 &&
      selectedSlotIndex >= 0;

    prevSelectedIdRef.current = selectedInstanceId;
    prevSelectedSlotRef.current = selectedSlotIndex;

    setGizmoButtonsRevealTarget(selectedSlotIndex, snap);
  }, [activeStep, selectedInstanceId, selectedSlotIndex]);

  useEffect(() => {
    if (activeStep === NAME_STEP || activeStep === LOGO_STEP) return;
    setGizmoButtonsRevealTarget(-1);
  }, [activeStep]);

  useEffect(() => {
    const applyHover = () => {
      const hover = getGizmoHoverUniforms();
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyGarmentGizmoHover(material, hover);
        }
      }
      invalidate();
    };

    applyHover();
    return subscribeGizmoButtonHover(applyHover);
  }, [getMaterials, invalidate, product.parts]);

  useEffect(() => {
    const applyReveal = () => {
      const reveal = getGizmoButtonsRevealUniforms();
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyGarmentLogoGizmoButtonsReveal(material, reveal);
        }
      }
      invalidate();
    };

    applyReveal();
    return subscribeGizmoButtonReveal(applyReveal);
  }, [getMaterials, invalidate, product.parts]);

  useEffect(() => () => clearRuntime(), [clearRuntime]);
};

export { useGarmentLogoTextures };
