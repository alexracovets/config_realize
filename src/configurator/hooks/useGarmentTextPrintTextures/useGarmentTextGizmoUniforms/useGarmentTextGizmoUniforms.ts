'use client';

import { NAME_SLOT_COUNT } from '@configurator/constants';
import {
  getGizmoButtonsRevealUniforms,
  getGizmoHoverUniforms,
  setGizmoButtonsRevealTarget,
  subscribeGizmoButtonHover,
  subscribeGizmoButtonReveal,
} from '@configurator/gizmo';
import { buildStyleSignature } from '@configurator/hooks/useGarmentTextPrintTextures/garmentTextPrintTextureUtils';
import { useGizmoIconAtlas } from '@configurator/hooks/useGizmoIconAtlas';
import { useGarmentMaterialRegistry, useMaterialRegistryRevision } from '@configurator/providers';
import {
  applyGarmentGizmoButtonsReveal,
  applyGarmentGizmoFrame,
  applyGarmentGizmoHover,
  applyGarmentGizmoIcons,
  applyGarmentGizmoRotation,
  applyGarmentNumberGizmoButtonsReveal,
  applyGarmentNumberGizmoFrame,
  applyGarmentTestoGizmoButtonsReveal,
  applyGarmentTestoGizmoFrame,
  buildGizmoFrameUniforms,
  repairPrintInstancePlacement,
  resolveProductGizmoRotation,
} from '@configurator/utils';
import { useThree } from '@react-three/fiber';
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
import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
const NAME_STEP = 4;
const NUMBER_STEP = 5;
const TESTO_STEP = 6;
const LOGO_STEP = 7;

/** Shared gizmo frame, hover, and button-reveal uniforms for text print kinds. */
const useGarmentTextGizmoUniforms = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const partIds = useMemo(() => product.parts.map((part) => part.id), [product.parts]);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const gizmoIcons = useGizmoIconAtlas();

  const nameInstances = useGarmentName((state) => state.instances);
  const namePreview = useGarmentName((state) => state.preview);
  const numberInstances = useGarmentNumber((state) => state.instances);
  const numberPreview = useGarmentNumber((state) => state.preview);
  const testoInstances = useGarmentTesto((state) => state.instances);
  const testoPreview = useGarmentTesto((state) => state.preview);

  const nameProductPath = useGarmentName((state) => state.productPath);
  const numberProductPath = useGarmentNumber((state) => state.productPath);
  const testoProductPath = useGarmentTesto((state) => state.productPath);

  const { getMaterials, hasMaterialsForParts } = useGarmentMaterialRegistry();
  const materialRevision = useMaterialRegistryRevision();
  const invalidate = useThree((state) => state.invalidate);

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

  const nameStyleSignature = useMemo(() => buildStyleSignature(nameInstancesForRender), [nameInstancesForRender]);
  const numberStyleSignature = useMemo(() => buildStyleSignature(numberInstancesForRender), [numberInstancesForRender]);
  const testoStyleSignature = useMemo(() => buildStyleSignature(testoInstancesForRender), [testoInstancesForRender]);

  const isNameSynced = nameProductPath === product.path;
  const isNumberSynced = numberProductPath === product.path;
  const isTestoSynced = testoProductPath === product.path;

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
    if (activeStep === NAME_STEP || activeStep === NUMBER_STEP || activeStep === TESTO_STEP || activeStep === LOGO_STEP) return;
    setGizmoButtonsRevealTarget(-1);
  }, [activeStep]);

  useLayoutEffect(() => {
    if (!hasMaterialsForParts(partIds)) return;
    if (!isNameSynced && !isNumberSynced && !isTestoSynced) return;

    applyGizmoFrames();
  }, [
    applyGizmoFrames,
    hasMaterialsForParts,
    isNameSynced,
    isNumberSynced,
    isTestoSynced,
    materialRevision,
    nameStyleSignature,
    numberStyleSignature,
    partIds,
    testoStyleSignature,
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
};

export { useGarmentTextGizmoUniforms };
