'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import type { MeshStandardMaterial, Texture } from 'three';

import { setGizmoButtonsRevealTarget } from '@configurator/gizmo';
import { useGarmentMaterialRegistry, useMaterialRegistryRevision } from '@configurator/providers';
import { useConfigurationControl, useConfiguratorProduct, useConfiguratorSceneLoad } from '@store';
import type { stampPixelSizeType } from '@configurator/types';
import type { garmentPartConfigType, garmentTextRenderInstanceType } from '@types';
import {
  applyGarmentPrintAtlasSize,
  composeNameMaskAtlas,
  getEmptyPrintTexture,
  packStackedTextMaskTexture,
  repairPrintInstancePlacement,
  resolveNameStampSize,
  resolvePrintAtlasSize,
} from '@configurator/utils';
import {
  buildFillSignature,
  buildStrokeSignature,
  buildStyleSignature,
  clearMaskRuntime,
  DEFAULT_STAMP_SIZE,
  ensureMaskResources,
  type MaskResourceRefs,
} from '@configurator/hooks/useGarmentTextPrintTextures/garmentTextPrintTextureUtils';

interface TextPrintMaskPipelineConfig<TInstance extends garmentTextRenderInstanceType, TPreview, TStyle> {
  step: number;
  productPath: string | null;
  instances: TInstance[];
  preview: TPreview;
  selectedInstanceId: string | null;
  resolveInstances: (instances: TInstance[], preview: TPreview) => TInstance[];
  applyMasks: (material: MeshStandardMaterial, payload: { mask: Texture }) => void;
  applyStyle: (material: MeshStandardMaterial, style: TStyle) => void;
  buildStyleUniforms: (instances: TInstance[], parts: garmentPartConfigType[], stampSize: stampPixelSizeType, partId: string) => TStyle;
}

const useTextPrintMaskPipeline = <TInstance extends garmentTextRenderInstanceType, TPreview, TStyle>({
  step,
  productPath,
  instances,
  preview,
  selectedInstanceId,
  resolveInstances,
  applyMasks,
  applyStyle,
  buildStyleUniforms,
}: TextPrintMaskPipelineConfig<TInstance, TPreview, TStyle>) => {
  const product = useConfiguratorProduct((state) => state.product);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const partIds = useMemo(() => product.parts.map((part) => part.id), [product.parts]);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const { getMaterials, hasMaterialsForParts } = useGarmentMaterialRegistry();
  const materialRevision = useMaterialRegistryRevision();
  const invalidate = useThree((state) => state.invalidate);

  const fillCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stackedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stackedTextureRef = useRef<Texture | null>(null);
  const stampSizeRef = useRef(DEFAULT_STAMP_SIZE);
  const maskGenerationRef = useRef(0);
  const prevFillSignatureRef = useRef('');
  const prevSelectedSlotRef = useRef(-1);
  const prevSelectedIdRef = useRef<string | null>(null);

  const maskRefs = useMemo<MaskResourceRefs>(
    () => ({
      fillCanvasRef,
      strokeCanvasRef,
      stackedCanvasRef,
      stackedTextureRef,
      stampSizeRef,
    }),
    [],
  );

  const instancesForRender = useMemo(
    () => resolveInstances(instances, preview).map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [instances, preview, product.parts, resolveInstances],
  );

  const selectedSlotIndex = useMemo(() => {
    if (activeStep !== step || !selectedInstanceId) return -1;
    return instancesForRender.findIndex((instance) => instance.id === selectedInstanceId);
  }, [activeStep, instancesForRender, selectedInstanceId, step]);

  const fillSignature = useMemo(() => buildFillSignature(instancesForRender), [instancesForRender]);
  const strokeSignature = useMemo(() => buildStrokeSignature(instancesForRender), [instancesForRender]);
  const styleSignature = useMemo(() => buildStyleSignature(instancesForRender), [instancesForRender]);
  const atlasSize = useMemo(() => resolvePrintAtlasSize(product), [product]);

  const isSynced = productPath === product.path;
  const isReady = isSynced && hasMaterialsForParts(partIds) && !isInitialSceneLoading;

  const clearRuntime = useCallback(() => {
    clearMaskRuntime(maskRefs, prevFillSignatureRef);
  }, [maskRefs]);

  const applyMasksToMaterials = useCallback(
    (mask: Texture) => {
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyMasks(material, { mask });
        }
      }
      invalidate();
    },
    [applyMasks, getMaterials, invalidate, product.parts],
  );

  const applyStyleToMaterials = useCallback(
    (stampSize = stampSizeRef.current) => {
      for (const part of product.parts) {
        const style = buildStyleUniforms(instancesForRender, product.parts, stampSize, part.id);

        for (const material of getMaterials(part.id)) {
          applyGarmentPrintAtlasSize(material, atlasSize.width, atlasSize.height);
          applyStyle(material, style);
        }
      }

      invalidate();
    },
    [applyStyle, atlasSize.height, atlasSize.width, buildStyleUniforms, getMaterials, instancesForRender, invalidate, product.parts],
  );

  useEffect(() => {
    if (activeStep !== step) return;

    const snap =
      prevSelectedIdRef.current === selectedInstanceId &&
      prevSelectedSlotRef.current !== selectedSlotIndex &&
      prevSelectedSlotRef.current >= 0 &&
      selectedSlotIndex >= 0;

    prevSelectedIdRef.current = selectedInstanceId;
    prevSelectedSlotRef.current = selectedSlotIndex;

    setGizmoButtonsRevealTarget(selectedSlotIndex, snap);
  }, [activeStep, selectedInstanceId, selectedSlotIndex, step]);

  const updateMasks = useCallback(
    async (redrawFill: boolean, redrawStroke: boolean) => {
      if (!isReady) return;

      const generation = ++maskGenerationRef.current;
      const empty = getEmptyPrintTexture();

      if (instancesForRender.length === 0) {
        stampSizeRef.current = DEFAULT_STAMP_SIZE;
        applyMasksToMaterials(empty);
        applyStyleToMaterials(DEFAULT_STAMP_SIZE);
        return;
      }

      await document.fonts.ready;
      if (generation !== maskGenerationRef.current) return;

      const stampSize = resolveNameStampSize(instancesForRender);
      ensureMaskResources(stampSize, maskRefs);
      if (generation !== maskGenerationRef.current) return;

      composeNameMaskAtlas({
        instances: instancesForRender,
        fillCanvas: fillCanvasRef.current!,
        strokeCanvas: strokeCanvasRef.current!,
        redrawFill,
        redrawStroke,
      });

      if (generation !== maskGenerationRef.current) return;

      const mask = packStackedTextMaskTexture(fillCanvasRef.current!, strokeCanvasRef.current!, stackedCanvasRef.current, stackedTextureRef.current);
      stackedTextureRef.current = mask;
      stackedCanvasRef.current = mask.image as HTMLCanvasElement;
      applyMasksToMaterials(mask);
      applyStyleToMaterials(stampSize);
    },
    [applyMasksToMaterials, applyStyleToMaterials, instancesForRender, isReady, maskRefs],
  );

  useEffect(() => {
    if (!isReady) {
      if (productPath !== product.path) {
        clearRuntime();
      }
      return;
    }

    const fillChanged = prevFillSignatureRef.current !== fillSignature;
    prevFillSignatureRef.current = fillSignature;

    void updateMasks(fillChanged, true);
  }, [clearRuntime, fillSignature, isReady, product.path, productPath, strokeSignature, updateMasks]);

  useLayoutEffect(() => {
    if (!hasMaterialsForParts(partIds) || !isSynced) return;

    applyStyleToMaterials();

    if (stackedTextureRef.current) {
      applyMasksToMaterials(stackedTextureRef.current);
    }
  }, [applyMasksToMaterials, applyStyleToMaterials, hasMaterialsForParts, isSynced, materialRevision, partIds, styleSignature]);

  useEffect(
    () => () => {
      clearRuntime();
    },
    [clearRuntime],
  );
};

export { useTextPrintMaskPipeline };
export type { TextPrintMaskPipelineConfig };
