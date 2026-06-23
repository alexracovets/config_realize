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
import {
  resolveInstancesForRender,
  resolveNumberInstancesForRender,
  resolveTestoInstancesForRender,
  useConfigurationControl,
  useConfiguratorProduct,
  useGarmentName,
  useGarmentNumber,
  useGarmentTesto,
} from '@store';
import type { garmentTextRenderInstanceType, stampPixelSizeType } from '@types';
import { NAME_SLOT_COUNT } from '@constants';
import {
  applyGarmentGizmoButtonsReveal,
  applyGarmentGizmoFrame,
  applyGarmentGizmoHover,
  applyGarmentGizmoIcons,
  applyGarmentGizmoRotation,
  applyGarmentNameMasks,
  applyGarmentNameStyle,
  applyGarmentNumberGizmoButtonsReveal,
  applyGarmentNumberGizmoFrame,
  applyGarmentNumberMasks,
  applyGarmentNumberStyle,
  applyGarmentPrintAtlasSize,
  applyGarmentTestoGizmoButtonsReveal,
  applyGarmentTestoGizmoFrame,
  applyGarmentTestoMasks,
  applyGarmentTestoStyle,
  buildGizmoFrameUniforms,
  buildNameStyleUniforms,
  buildNumberStyleUniforms,
  buildTestoStyleUniforms,
  composeNameMaskAtlas,
  getEmptyPrintTexture,
  packStackedTextMaskTexture,
  repairPrintInstancePlacement,
  resolveNameStampSize,
  resolvePrintAtlasSize,
  resolveProductGizmoRotation,
} from '@utils';

const NAME_STEP = 4;
const NUMBER_STEP = 5;
const TESTO_STEP = 6;
const LOGO_STEP = 7;

const DEFAULT_STAMP_SIZE: stampPixelSizeType = { width: 1, height: 1 };

const buildFillSignature = (instances: garmentTextRenderInstanceType[]) =>
  JSON.stringify(
    instances.map((instance) => ({
      text: instance.text,
      font: instance.font,
      ...('letterSpacing' in instance ? { letterSpacing: instance.letterSpacing } : {}),
    })),
  );

const buildStrokeSignature = (instances: garmentTextRenderInstanceType[]) =>
  JSON.stringify(
    instances.map((instance) => ({
      text: instance.text,
      font: instance.font,
      strokeWidth: instance.strokeWidth,
      fontSize: instance.fontSize,
      ...('letterSpacing' in instance ? { letterSpacing: instance.letterSpacing } : {}),
    })),
  );

const buildStyleSignature = (instances: garmentTextRenderInstanceType[]) =>
  JSON.stringify(
    instances.map((instance) => ({
      textColor: instance.textColor,
      strokeColor: instance.strokeColor,
      fontSize: instance.fontSize,
      uv: instance.uv,
      rotation: instance.rotation,
      partId: instance.partId,
      ...('lineHeight' in instance ? { lineHeight: instance.lineHeight } : {}),
    })),
  );

const stampSizeChanged = (previous: stampPixelSizeType, next: stampPixelSizeType) => previous.width !== next.width || previous.height !== next.height;

const useGarmentNameTextures = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const partIds = useMemo(() => product.parts.map((part) => part.id), [product.parts]);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const gizmoIcons = useGizmoIconAtlas();
  const nameProductPath = useGarmentName((state) => state.productPath);
  const nameInstances = useGarmentName((state) => state.instances);
  const namePreview = useGarmentName((state) => state.preview);
  const selectedInstanceId = useGarmentName((state) => state.selectedInstanceId);
  const numberProductPath = useGarmentNumber((state) => state.productPath);
  const numberInstances = useGarmentNumber((state) => state.instances);
  const numberPreview = useGarmentNumber((state) => state.preview);
  const numberSelectedInstanceId = useGarmentNumber((state) => state.selectedInstanceId);
  const testoProductPath = useGarmentTesto((state) => state.productPath);
  const testoInstances = useGarmentTesto((state) => state.instances);
  const testoPreview = useGarmentTesto((state) => state.preview);
  const testoSelectedInstanceId = useGarmentTesto((state) => state.selectedInstanceId);
  const { getMaterials, hasMaterialsForParts } = useGarmentMaterialRegistry();
  const materialRevision = useMaterialRegistryRevision();
  const invalidate = useThree((state) => state.invalidate);

  const nameFillCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameStrokeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameStackedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameStackedTextureRef = useRef<Texture | null>(null);
  const nameStampSizeRef = useRef<stampPixelSizeType>(DEFAULT_STAMP_SIZE);

  const numberFillCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const numberStrokeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const numberStackedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const numberStackedTextureRef = useRef<Texture | null>(null);
  const numberStampSizeRef = useRef<stampPixelSizeType>(DEFAULT_STAMP_SIZE);

  const testoFillCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const testoStrokeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const testoStackedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const testoStackedTextureRef = useRef<Texture | null>(null);
  const testoStampSizeRef = useRef<stampPixelSizeType>(DEFAULT_STAMP_SIZE);

  const nameMaskGenerationRef = useRef(0);
  const numberMaskGenerationRef = useRef(0);
  const testoMaskGenerationRef = useRef(0);
  const prevNameFillSignatureRef = useRef('');
  const prevNumberFillSignatureRef = useRef('');
  const prevTestoFillSignatureRef = useRef('');
  const prevSelectedSlotRef = useRef(-1);
  const prevSelectedIdRef = useRef<string | null>(null);
  const prevNumberSelectedSlotRef = useRef(-1);
  const prevNumberSelectedIdRef = useRef<string | null>(null);
  const prevTestoSelectedSlotRef = useRef(-1);
  const prevTestoSelectedIdRef = useRef<string | null>(null);

  const nameInstancesForRender = useMemo(
    () => resolveInstancesForRender(nameInstances, namePreview).map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [nameInstances, namePreview, product.parts],
  );
  const numberInstancesForRender = useMemo(
    () =>
      resolveNumberInstancesForRender(numberInstances, numberPreview)
        .slice(0, NAME_SLOT_COUNT)
        .map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [numberInstances, numberPreview, product.parts],
  );
  const testoInstancesForRender = useMemo(
    () =>
      resolveTestoInstancesForRender(testoInstances, testoPreview)
        .slice(0, NAME_SLOT_COUNT)
        .map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [testoInstances, testoPreview, product.parts],
  );

  const selectedSlotIndex = useMemo(() => {
    if (activeStep !== NAME_STEP || !selectedInstanceId) return -1;
    return nameInstancesForRender.slice(0, NAME_SLOT_COUNT).findIndex((instance) => instance.id === selectedInstanceId);
  }, [activeStep, nameInstancesForRender, selectedInstanceId]);

  const numberSelectedSlotIndex = useMemo(() => {
    if (activeStep !== NUMBER_STEP || !numberSelectedInstanceId) return -1;
    return numberInstancesForRender.findIndex((instance) => instance.id === numberSelectedInstanceId);
  }, [activeStep, numberInstancesForRender, numberSelectedInstanceId]);

  const testoSelectedSlotIndex = useMemo(() => {
    if (activeStep !== TESTO_STEP || !testoSelectedInstanceId) return -1;
    return testoInstancesForRender.slice(0, NAME_SLOT_COUNT).findIndex((instance) => instance.id === testoSelectedInstanceId);
  }, [activeStep, testoInstancesForRender, testoSelectedInstanceId]);

  const nameFillSignature = useMemo(() => buildFillSignature(nameInstancesForRender), [nameInstancesForRender]);
  const nameStrokeSignature = useMemo(() => buildStrokeSignature(nameInstancesForRender), [nameInstancesForRender]);
  const nameStyleSignature = useMemo(() => buildStyleSignature(nameInstancesForRender), [nameInstancesForRender]);

  const numberFillSignature = useMemo(() => buildFillSignature(numberInstancesForRender), [numberInstancesForRender]);
  const numberStrokeSignature = useMemo(() => buildStrokeSignature(numberInstancesForRender), [numberInstancesForRender]);
  const numberStyleSignature = useMemo(() => buildStyleSignature(numberInstancesForRender), [numberInstancesForRender]);

  const testoFillSignature = useMemo(() => buildFillSignature(testoInstancesForRender), [testoInstancesForRender]);
  const testoStrokeSignature = useMemo(() => buildStrokeSignature(testoInstancesForRender), [testoInstancesForRender]);
  const testoStyleSignature = useMemo(() => buildStyleSignature(testoInstancesForRender), [testoInstancesForRender]);

  const atlasSize = useMemo(() => resolvePrintAtlasSize(product), [product]);

  const isNameSynced = nameProductPath === product.path;
  const isNumberSynced = numberProductPath === product.path;
  const isTestoSynced = testoProductPath === product.path;
  const sceneReady = hasMaterialsForParts(partIds);
  const isNameReady = isNameSynced && sceneReady;
  const isNumberReady = isNumberSynced && sceneReady;
  const isTestoReady = isTestoSynced && sceneReady;

  const clearNameRuntime = useCallback(() => {
    nameStackedTextureRef.current?.dispose();
    nameStackedTextureRef.current = null;
    nameFillCanvasRef.current = null;
    nameStrokeCanvasRef.current = null;
    nameStackedCanvasRef.current = null;
    nameStampSizeRef.current = DEFAULT_STAMP_SIZE;
    prevNameFillSignatureRef.current = '';
  }, []);

  const clearNumberRuntime = useCallback(() => {
    numberStackedTextureRef.current?.dispose();
    numberStackedTextureRef.current = null;
    numberFillCanvasRef.current = null;
    numberStrokeCanvasRef.current = null;
    numberStackedCanvasRef.current = null;
    numberStampSizeRef.current = DEFAULT_STAMP_SIZE;
    prevNumberFillSignatureRef.current = '';
  }, []);

  const clearTestoRuntime = useCallback(() => {
    testoStackedTextureRef.current?.dispose();
    testoStackedTextureRef.current = null;
    testoFillCanvasRef.current = null;
    testoStrokeCanvasRef.current = null;
    testoStackedCanvasRef.current = null;
    testoStampSizeRef.current = DEFAULT_STAMP_SIZE;
    prevTestoFillSignatureRef.current = '';
  }, []);

  const ensureMaskResources = useCallback(
    (
      stampSize: stampPixelSizeType,
      refs: {
        fillCanvasRef: { current: HTMLCanvasElement | null };
        strokeCanvasRef: { current: HTMLCanvasElement | null };
        stackedCanvasRef: { current: HTMLCanvasElement | null };
        stackedTextureRef: { current: Texture | null };
        stampSizeRef: { current: stampPixelSizeType };
      },
    ) => {
      if (!refs.fillCanvasRef.current) {
        refs.fillCanvasRef.current = document.createElement('canvas');
      }

      if (!refs.strokeCanvasRef.current) {
        refs.strokeCanvasRef.current = document.createElement('canvas');
      }

      if (!refs.stackedCanvasRef.current) {
        refs.stackedCanvasRef.current = document.createElement('canvas');
        refs.stackedTextureRef.current = packStackedTextMaskTexture(refs.fillCanvasRef.current, refs.strokeCanvasRef.current, refs.stackedCanvasRef.current);
      }

      if (!stampSizeChanged(refs.stampSizeRef.current, stampSize)) return;

      refs.fillCanvasRef.current.width = stampSize.width;
      refs.fillCanvasRef.current.height = stampSize.height;
      refs.strokeCanvasRef.current.width = stampSize.width;
      refs.strokeCanvasRef.current.height = stampSize.height;
      refs.stackedTextureRef.current?.dispose();
      refs.stackedCanvasRef.current = document.createElement('canvas');
      refs.stackedTextureRef.current = packStackedTextMaskTexture(refs.fillCanvasRef.current, refs.strokeCanvasRef.current, refs.stackedCanvasRef.current);
      refs.stampSizeRef.current = stampSize;
    },
    [],
  );

  const applyNameMasksToMaterials = useCallback(
    (mask: Texture) => {
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyGarmentNameMasks(material, { mask });
        }
      }
      invalidate();
    },
    [getMaterials, invalidate, product.parts],
  );

  const applyNumberMasksToMaterials = useCallback(
    (mask: Texture) => {
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyGarmentNumberMasks(material, { mask });
        }
      }
      invalidate();
    },
    [getMaterials, invalidate, product.parts],
  );

  const applyTestoMasksToMaterials = useCallback(
    (mask: Texture) => {
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          applyGarmentTestoMasks(material, { mask });
        }
      }
      invalidate();
    },
    [getMaterials, invalidate, product.parts],
  );

  const applyNameStyleToMaterials = useCallback(
    (stampSize: stampPixelSizeType = nameStampSizeRef.current) => {
      for (const part of product.parts) {
        const style = buildNameStyleUniforms(nameInstancesForRender, product.parts, stampSize, part.id);

        for (const material of getMaterials(part.id)) {
          applyGarmentPrintAtlasSize(material, atlasSize.width, atlasSize.height);
          applyGarmentNameStyle(material, style);
        }
      }

      invalidate();
    },
    [atlasSize.height, atlasSize.width, getMaterials, nameInstancesForRender, invalidate, product.parts],
  );

  const applyNumberStyleToMaterials = useCallback(
    (stampSize: stampPixelSizeType = numberStampSizeRef.current) => {
      for (const part of product.parts) {
        const style = buildNumberStyleUniforms(numberInstancesForRender, product.parts, stampSize, part.id);

        for (const material of getMaterials(part.id)) {
          applyGarmentPrintAtlasSize(material, atlasSize.width, atlasSize.height);
          applyGarmentNumberStyle(material, style);
        }
      }

      invalidate();
    },
    [atlasSize.height, atlasSize.width, getMaterials, numberInstancesForRender, invalidate, product.parts],
  );

  const applyTestoStyleToMaterials = useCallback(
    (stampSize: stampPixelSizeType = testoStampSizeRef.current) => {
      for (const part of product.parts) {
        const style = buildTestoStyleUniforms(testoInstancesForRender, product.parts, stampSize, part.id);

        for (const material of getMaterials(part.id)) {
          applyGarmentPrintAtlasSize(material, atlasSize.width, atlasSize.height);
          applyGarmentTestoStyle(material, style);
        }
      }

      invalidate();
    },
    [atlasSize.height, atlasSize.width, getMaterials, testoInstancesForRender, invalidate, product.parts],
  );

  const applyGizmoFrames = useCallback(() => {
    const nameGizmoEnabled = activeStep === NAME_STEP;
    const numberGizmoEnabled = activeStep === NUMBER_STEP;
    const testoGizmoEnabled = activeStep === TESTO_STEP;
    const gizmoRotation = resolveProductGizmoRotation(product);

    for (const part of product.parts) {
      const nameFrame = buildGizmoFrameUniforms(nameInstancesForRender, part.id, nameGizmoEnabled, gizmoRotation);
      const numberFrame = buildGizmoFrameUniforms(numberInstancesForRender, part.id, numberGizmoEnabled, gizmoRotation);
      const testoFrame = buildGizmoFrameUniforms(testoInstancesForRender, part.id, testoGizmoEnabled, gizmoRotation);

      for (const material of getMaterials(part.id)) {
        applyGarmentGizmoRotation(material, gizmoRotation);
        applyGarmentGizmoFrame(material, nameFrame);
        applyGarmentNumberGizmoFrame(material, numberFrame);
        applyGarmentTestoGizmoFrame(material, testoFrame);
        if (gizmoIcons) applyGarmentGizmoIcons(material, gizmoIcons);
      }
    }

    invalidate();
  }, [activeStep, getMaterials, gizmoIcons, nameInstancesForRender, numberInstancesForRender, product, testoInstancesForRender, invalidate]);

  useEffect(() => {
    if (activeStep !== NAME_STEP) return;

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
    if (activeStep !== NUMBER_STEP) return;

    const snap =
      prevNumberSelectedIdRef.current === numberSelectedInstanceId &&
      prevNumberSelectedSlotRef.current !== numberSelectedSlotIndex &&
      prevNumberSelectedSlotRef.current >= 0 &&
      numberSelectedSlotIndex >= 0;

    prevNumberSelectedIdRef.current = numberSelectedInstanceId;
    prevNumberSelectedSlotRef.current = numberSelectedSlotIndex;

    setGizmoButtonsRevealTarget(numberSelectedSlotIndex, snap);
  }, [activeStep, numberSelectedInstanceId, numberSelectedSlotIndex]);

  useEffect(() => {
    if (activeStep !== TESTO_STEP) return;

    const snap =
      prevTestoSelectedIdRef.current === testoSelectedInstanceId &&
      prevTestoSelectedSlotRef.current !== testoSelectedSlotIndex &&
      prevTestoSelectedSlotRef.current >= 0 &&
      testoSelectedSlotIndex >= 0;

    prevTestoSelectedIdRef.current = testoSelectedInstanceId;
    prevTestoSelectedSlotRef.current = testoSelectedSlotIndex;

    setGizmoButtonsRevealTarget(testoSelectedSlotIndex, snap);
  }, [activeStep, testoSelectedInstanceId, testoSelectedSlotIndex]);

  useEffect(() => {
    if (activeStep === NAME_STEP || activeStep === NUMBER_STEP || activeStep === TESTO_STEP || activeStep === LOGO_STEP) return;
    setGizmoButtonsRevealTarget(-1);
  }, [activeStep]);

  const updateNameMasks = useCallback(
    async (redrawFill: boolean, redrawStroke: boolean) => {
      if (!isNameReady) return;

      const generation = ++nameMaskGenerationRef.current;
      const empty = getEmptyPrintTexture();

      if (nameInstancesForRender.length === 0) {
        nameStampSizeRef.current = DEFAULT_STAMP_SIZE;
        applyNameMasksToMaterials(empty);
        applyNameStyleToMaterials(DEFAULT_STAMP_SIZE);
        return;
      }

      await document.fonts.ready;
      if (generation !== nameMaskGenerationRef.current) return;

      const stampSize = resolveNameStampSize(nameInstancesForRender);
      ensureMaskResources(stampSize, {
        fillCanvasRef: nameFillCanvasRef,
        strokeCanvasRef: nameStrokeCanvasRef,
        stackedCanvasRef: nameStackedCanvasRef,
        stackedTextureRef: nameStackedTextureRef,
        stampSizeRef: nameStampSizeRef,
      });
      if (generation !== nameMaskGenerationRef.current) return;

      composeNameMaskAtlas({
        instances: nameInstancesForRender,
        fillCanvas: nameFillCanvasRef.current!,
        strokeCanvas: nameStrokeCanvasRef.current!,
        redrawFill,
        redrawStroke,
      });

      if (generation !== nameMaskGenerationRef.current) return;

      const nameMask = packStackedTextMaskTexture(
        nameFillCanvasRef.current!,
        nameStrokeCanvasRef.current!,
        nameStackedCanvasRef.current,
        nameStackedTextureRef.current,
      );
      nameStackedTextureRef.current = nameMask;
      nameStackedCanvasRef.current = nameMask.image as HTMLCanvasElement;
      applyNameMasksToMaterials(nameMask);
      applyNameStyleToMaterials(stampSize);
    },
    [applyNameMasksToMaterials, applyNameStyleToMaterials, ensureMaskResources, isNameReady, nameInstancesForRender],
  );

  const updateNumberMasks = useCallback(
    async (redrawFill: boolean, redrawStroke: boolean) => {
      if (!isNumberReady) return;

      const generation = ++numberMaskGenerationRef.current;
      const empty = getEmptyPrintTexture();

      if (numberInstancesForRender.length === 0) {
        numberStampSizeRef.current = DEFAULT_STAMP_SIZE;
        applyNumberMasksToMaterials(empty);
        applyNumberStyleToMaterials(DEFAULT_STAMP_SIZE);
        return;
      }

      await document.fonts.ready;
      if (generation !== numberMaskGenerationRef.current) return;

      const stampSize = resolveNameStampSize(numberInstancesForRender);
      ensureMaskResources(stampSize, {
        fillCanvasRef: numberFillCanvasRef,
        strokeCanvasRef: numberStrokeCanvasRef,
        stackedCanvasRef: numberStackedCanvasRef,
        stackedTextureRef: numberStackedTextureRef,
        stampSizeRef: numberStampSizeRef,
      });
      if (generation !== numberMaskGenerationRef.current) return;

      composeNameMaskAtlas({
        instances: numberInstancesForRender,
        fillCanvas: numberFillCanvasRef.current!,
        strokeCanvas: numberStrokeCanvasRef.current!,
        redrawFill,
        redrawStroke,
      });

      if (generation !== numberMaskGenerationRef.current) return;

      const numberMask = packStackedTextMaskTexture(
        numberFillCanvasRef.current!,
        numberStrokeCanvasRef.current!,
        numberStackedCanvasRef.current,
        numberStackedTextureRef.current,
      );
      numberStackedTextureRef.current = numberMask;
      numberStackedCanvasRef.current = numberMask.image as HTMLCanvasElement;
      applyNumberMasksToMaterials(numberMask);
      applyNumberStyleToMaterials(stampSize);
    },
    [applyNumberMasksToMaterials, applyNumberStyleToMaterials, ensureMaskResources, isNumberReady, numberInstancesForRender],
  );

  const updateTestoMasks = useCallback(
    async (redrawFill: boolean, redrawStroke: boolean) => {
      if (!isTestoReady) return;

      const generation = ++testoMaskGenerationRef.current;
      const empty = getEmptyPrintTexture();

      if (testoInstancesForRender.length === 0) {
        testoStampSizeRef.current = DEFAULT_STAMP_SIZE;
        applyTestoMasksToMaterials(empty);
        applyTestoStyleToMaterials(DEFAULT_STAMP_SIZE);
        return;
      }

      await document.fonts.ready;
      if (generation !== testoMaskGenerationRef.current) return;

      const stampSize = resolveNameStampSize(testoInstancesForRender);
      ensureMaskResources(stampSize, {
        fillCanvasRef: testoFillCanvasRef,
        strokeCanvasRef: testoStrokeCanvasRef,
        stackedCanvasRef: testoStackedCanvasRef,
        stackedTextureRef: testoStackedTextureRef,
        stampSizeRef: testoStampSizeRef,
      });
      if (generation !== testoMaskGenerationRef.current) return;

      composeNameMaskAtlas({
        instances: testoInstancesForRender,
        fillCanvas: testoFillCanvasRef.current!,
        strokeCanvas: testoStrokeCanvasRef.current!,
        redrawFill,
        redrawStroke,
      });

      if (generation !== testoMaskGenerationRef.current) return;

      const testoMask = packStackedTextMaskTexture(
        testoFillCanvasRef.current!,
        testoStrokeCanvasRef.current!,
        testoStackedCanvasRef.current,
        testoStackedTextureRef.current,
      );
      testoStackedTextureRef.current = testoMask;
      testoStackedCanvasRef.current = testoMask.image as HTMLCanvasElement;
      applyTestoMasksToMaterials(testoMask);
      applyTestoStyleToMaterials(stampSize);
    },
    [applyTestoMasksToMaterials, applyTestoStyleToMaterials, ensureMaskResources, isTestoReady, testoInstancesForRender],
  );

  useEffect(() => {
    if (!isNameReady) {
      if (nameProductPath !== product.path) {
        clearNameRuntime();
      }
      return;
    }

    const fillChanged = prevNameFillSignatureRef.current !== nameFillSignature;
    prevNameFillSignatureRef.current = nameFillSignature;

    void updateNameMasks(fillChanged, true);
  }, [clearNameRuntime, isNameReady, nameFillSignature, nameProductPath, nameStrokeSignature, product.path, updateNameMasks]);

  useEffect(() => {
    if (!isNumberReady) {
      if (numberProductPath !== product.path) {
        clearNumberRuntime();
      }
      return;
    }

    const fillChanged = prevNumberFillSignatureRef.current !== numberFillSignature;
    prevNumberFillSignatureRef.current = numberFillSignature;

    void updateNumberMasks(fillChanged, true);
  }, [clearNumberRuntime, isNumberReady, numberFillSignature, numberProductPath, numberStrokeSignature, product.path, updateNumberMasks]);

  useEffect(() => {
    if (!isTestoReady) {
      if (testoProductPath !== product.path) {
        clearTestoRuntime();
      }
      return;
    }

    const fillChanged = prevTestoFillSignatureRef.current !== testoFillSignature;
    prevTestoFillSignatureRef.current = testoFillSignature;

    void updateTestoMasks(fillChanged, true);
  }, [clearTestoRuntime, isTestoReady, testoFillSignature, testoProductPath, testoStrokeSignature, product.path, updateTestoMasks]);

  useLayoutEffect(() => {
    if (!hasMaterialsForParts(partIds)) return;

    if (isNameSynced) {
      applyNameStyleToMaterials();

      if (nameStackedTextureRef.current) {
        applyNameMasksToMaterials(nameStackedTextureRef.current);
      }
    }

    if (isNumberSynced) {
      applyNumberStyleToMaterials();

      if (numberStackedTextureRef.current) {
        applyNumberMasksToMaterials(numberStackedTextureRef.current);
      }
    }

    if (isTestoSynced) {
      applyTestoStyleToMaterials();

      if (testoStackedTextureRef.current) {
        applyTestoMasksToMaterials(testoStackedTextureRef.current);
      }
    }

    if (isNameSynced || isNumberSynced || isTestoSynced) {
      applyGizmoFrames();
    }
  }, [
    applyGizmoFrames,
    applyNameMasksToMaterials,
    applyNameStyleToMaterials,
    applyNumberMasksToMaterials,
    applyNumberStyleToMaterials,
    applyTestoMasksToMaterials,
    applyTestoStyleToMaterials,
    hasMaterialsForParts,
    isNameSynced,
    isNumberSynced,
    isTestoSynced,
    materialRevision,
    nameStyleSignature,
    numberStyleSignature,
    testoStyleSignature,
    partIds,
  ]);

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
          applyGarmentGizmoButtonsReveal(material, reveal);
          applyGarmentNumberGizmoButtonsReveal(material, reveal);
          applyGarmentTestoGizmoButtonsReveal(material, reveal);
        }
      }
      invalidate();
    };

    applyReveal();
    return subscribeGizmoButtonReveal(applyReveal);
  }, [getMaterials, invalidate, product.parts]);

  useEffect(
    () => () => {
      clearNameRuntime();
      clearNumberRuntime();
      clearTestoRuntime();
    },
    [clearNameRuntime, clearNumberRuntime, clearTestoRuntime],
  );
};

export { useGarmentNameTextures };
