import type { partGradientType, uvBoundsType } from '@types';
import { Color, type MeshStandardMaterial, Vector4 } from 'three';

const applyGarmentGradient = (material: MeshStandardMaterial, gradient: partGradientType) => {
  material.userData.garmentGradient = gradient;

  const enabledUniform = material.userData.uGradientEnabledUniform as { value: number } | undefined;
  if (enabledUniform) enabledUniform.value = gradient.enabled ? 1 : 0;

  const colorUniform = material.userData.uGradientColor2Uniform as { value: Color } | undefined;
  if (colorUniform) colorUniform.value.set(gradient.color2);

  const rotationUniform = material.userData.uGradientRotationUniform as { value: number } | undefined;
  if (rotationUniform) rotationUniform.value = (gradient.rotation * Math.PI) / 180;

  const positionUniform = material.userData.uGradientPositionUniform as { value: number } | undefined;
  if (positionUniform) positionUniform.value = gradient.position;

  const softnessUniform = material.userData.uGradientSoftnessUniform as { value: number } | undefined;
  if (softnessUniform) softnessUniform.value = gradient.softness;

  const opacityUniform = material.userData.uGradientOpacityUniform as { value: number } | undefined;
  if (opacityUniform) opacityUniform.value = gradient.opacity;
};

const applyGarmentPartUvBounds = (material: MeshStandardMaterial, bounds: uvBoundsType) => {
  if (!material.userData.uPartUvBounds) {
    material.userData.uPartUvBounds = new Vector4(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
  } else {
    material.userData.uPartUvBounds.set(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
  }

  const boundsUniform = material.userData.uPartUvBoundsUniform as { value: Vector4 } | undefined;
  if (boundsUniform) {
    boundsUniform.value.set(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
  }
};

export { applyGarmentGradient, applyGarmentPartUvBounds };
