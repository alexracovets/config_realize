import type { partGradientType, uvBoundsType } from '@types';
import { resolveGarmentGradientDir, type garmentGradientWorldFrameType } from '@configurator/utils';
import { Color, type MeshStandardMaterial, Vector3, Vector4 } from 'three';

const applyGarmentGradient = (material: MeshStandardMaterial, gradient: partGradientType, worldFrame?: garmentGradientWorldFrameType) => {
  material.userData.garmentGradient = gradient;

  const enabledUniform = material.userData.uGradientEnabledUniform as { value: number } | undefined;
  if (enabledUniform) enabledUniform.value = gradient.enabled ? 1 : 0;

  const colorUniform = material.userData.uGradientColor2Uniform as { value: Color } | undefined;
  if (colorUniform) colorUniform.value.set(gradient.color2);

  const rotationRad = (gradient.rotation * Math.PI) / 180;
  const rotationUniform = material.userData.uGradientRotationUniform as { value: number } | undefined;
  if (rotationUniform) rotationUniform.value = rotationRad;

  const positionUniform = material.userData.uGradientPositionUniform as { value: number } | undefined;
  if (positionUniform) positionUniform.value = gradient.position;

  const softnessUniform = material.userData.uGradientSoftnessUniform as { value: number } | undefined;
  if (softnessUniform) softnessUniform.value = gradient.softness;

  const opacityUniform = material.userData.uGradientOpacityUniform as { value: number } | undefined;
  if (opacityUniform) opacityUniform.value = gradient.opacity;

  const dir = resolveGarmentGradientDir(worldFrame, rotationRad);
  const dirUniform = material.userData.uGradientDirUniform as { value: Vector3 } | undefined;
  dirUniform?.value.set(dir.x, dir.y, dir.z);
  const uvAxisUniform = material.userData.uGradientUvAxisUniform as { value: { set: (x: number, y: number) => void } } | undefined;
  uvAxisUniform?.value.set(worldFrame?.uvAxis?.x ?? 0, worldFrame?.uvAxis?.y ?? 0);

  if (worldFrame) {
    material.userData.garmentGradientWorldFrame = worldFrame;
    const originUniform = material.userData.uGradientOriginUniform as { value: Vector3 } | undefined;
    originUniform?.value.set(worldFrame.origin.x, worldFrame.origin.y, worldFrame.origin.z);
    const extentUniform = material.userData.uGradientExtentUniform as { value: Vector3 } | undefined;
    extentUniform?.value.set(worldFrame.extent.x, worldFrame.extent.y, worldFrame.extent.z);
  }
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
