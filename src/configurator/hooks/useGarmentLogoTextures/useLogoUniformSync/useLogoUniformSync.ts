'use client';

import { useEffect } from 'react';

import { useThree } from '@react-three/fiber';

import {
  getGizmoButtonsRevealUniforms,
  getGizmoHoverUniforms,
  setGizmoButtonsRevealTarget,
  subscribeGizmoButtonHover,
  subscribeGizmoButtonReveal,
} from '@configurator/gizmo';
import { useGarmentMaterialRegistry } from '@configurator/providers';
import type { garmentConfigType } from '@types';
import { applyGarmentGizmoHover, applyGarmentLogoGizmoButtonsReveal } from '@configurator/utils';

const NAME_STEP = 4;
const LOGO_STEP = 7;

type useLogoUniformSyncOptions = {
  product: garmentConfigType;
  activeStep: number;
  selectedInstanceId: string | null;
  selectedSlotIndex: number;
};

const useLogoUniformSync = ({ product, activeStep, selectedInstanceId, selectedSlotIndex }: useLogoUniformSyncOptions) => {
  const { getMaterials } = useGarmentMaterialRegistry();
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (activeStep !== LOGO_STEP) return;

    setGizmoButtonsRevealTarget(selectedSlotIndex);
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
};

export { useLogoUniformSync };
