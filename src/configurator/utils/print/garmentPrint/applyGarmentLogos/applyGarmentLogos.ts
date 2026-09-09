import { type MeshStandardMaterial, type Texture, Vector2, Vector4 } from 'three';

import type { garmentLogoStampStateType, gizmoFrameStateType, logoStyleUniformsType } from '@configurator/types';

let pendingLogoStamp: garmentLogoStampStateType | null = null;
let pendingLogoStyle: logoStyleUniformsType | null = null;
let pendingLogoGizmoFrame: gizmoFrameStateType | null = null;

const applyLogoStampToUniforms = (material: MeshStandardMaterial, state: garmentLogoStampStateType) => {
  const stampUniform = material.userData.uLogoStampUniform as { value: Texture } | undefined;
  const cellSizeUniform = material.userData.uLogoStampCellSizeUniform as { value: Vector2 } | undefined;
  const gridUniform = material.userData.uLogoStampGridUniform as { value: number } | undefined;

  if (stampUniform) stampUniform.value = state.stamp;
  if (cellSizeUniform) cellSizeUniform.value.set(state.cellSize.width, state.cellSize.height);
  if (gridUniform) gridUniform.value = state.grid ?? 4;
};

const applyLogoStyleToUniforms = (material: MeshStandardMaterial, style: logoStyleUniformsType) => {
  const aUniform = material.userData.uLogoAUniform as { value: Vector4[] } | undefined;
  const bUniform = material.userData.uLogoBUniform as { value: Vector4[] } | undefined;

  if (aUniform) {
    aUniform.value.forEach((vec, index) => {
      const anchor = style.anchorUv[index];
      vec.set(anchor?.x ?? 0, anchor?.y ?? 0, style.scale[index] ?? 1, style.stampSlot?.[index] ?? 0);
    });
  }

  if (bUniform) {
    bUniform.value.forEach((vec, index) => {
      vec.set(style.rotation[index] ?? 0, style.uploadRotation[index] ?? 0, style.partRotation[index] ?? 0, style.slotActive[index] ?? 0);
    });
  }

  const partBoundsUniform = material.userData.uLogoPartBoundsUniform as { value: Vector4[] } | undefined;
  if (partBoundsUniform) {
    style.partBounds.forEach((bounds, index) => {
      partBoundsUniform.value[index]?.set(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    });
  }
};

const applyLogoGizmoFrameToUniforms = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  const enabledUniform = material.userData.uLogoGizmoEnabledUniform as { value: number } | undefined;
  if (enabledUniform) enabledUniform.value = state.enabled;

  const halfUniform = material.userData.uLogoGizmoHalfUniform as { value: Vector2[] } | undefined;
  if (halfUniform) {
    state.half.forEach((half, index) => {
      halfUniform.value[index]?.set(half.x, half.y);
    });
  }

  const gUniform = material.userData.uLogoGUniform as { value: Vector4[] } | undefined;
  if (gUniform) {
    gUniform.value.forEach((vec, index) => {
      vec.x = state.frameActive[index] ?? 0;
      vec.y = state.gizmoActive[index] ?? 0;
    });
  }
};

const applyGarmentLogoStamp = (material: MeshStandardMaterial, state: garmentLogoStampStateType) => {
  pendingLogoStamp = state;
  material.userData.garmentLogoStampState = state;
  applyLogoStampToUniforms(material, state);
};

const applyGarmentLogoStyle = (material: MeshStandardMaterial, style: logoStyleUniformsType) => {
  pendingLogoStyle = style;
  material.userData.garmentLogoStyleState = style;
  applyLogoStyleToUniforms(material, style);
};

const applyGarmentLogoGizmoFrame = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  pendingLogoGizmoFrame = state;
  material.userData.garmentLogoGizmoFrameState = state;
  applyLogoGizmoFrameToUniforms(material, state);
};

const hydrateGarmentLogoUniforms = (
  material: MeshStandardMaterial,
  uniforms: {
    uLogoStamp: { value: Texture };
    uLogoStampCellSize: { value: Vector2 };
    uLogoStampGrid: { value: number };
    uLogoA: { value: Vector4[] };
    uLogoB: { value: Vector4[] };
    uLogoPartBounds: { value: Vector4[] };
    uLogoGizmoEnabled: { value: number };
    uLogoG: { value: Vector4[] };
    uLogoGizmoHalf: { value: Vector2[] };
  },
) => {
  const stampState = (material.userData.garmentLogoStampState as garmentLogoStampStateType | undefined) ?? pendingLogoStamp;
  const styleState = (material.userData.garmentLogoStyleState as logoStyleUniformsType | undefined) ?? pendingLogoStyle;
  const gizmoState = (material.userData.garmentLogoGizmoFrameState as gizmoFrameStateType | undefined) ?? pendingLogoGizmoFrame;

  material.userData.uLogoStampUniform = uniforms.uLogoStamp;
  material.userData.uLogoStampCellSizeUniform = uniforms.uLogoStampCellSize;
  material.userData.uLogoStampGridUniform = uniforms.uLogoStampGrid;
  if (stampState) {
    material.userData.garmentLogoStampState = stampState;
    applyLogoStampToUniforms(material, stampState);
  }

  material.userData.uLogoAUniform = uniforms.uLogoA;
  material.userData.uLogoBUniform = uniforms.uLogoB;
  material.userData.uLogoPartBoundsUniform = uniforms.uLogoPartBounds;
  if (styleState) {
    material.userData.garmentLogoStyleState = styleState;
    applyLogoStyleToUniforms(material, styleState);
  }

  material.userData.uLogoGizmoEnabledUniform = uniforms.uLogoGizmoEnabled;
  material.userData.uLogoGUniform = uniforms.uLogoG;
  material.userData.uLogoGizmoHalfUniform = uniforms.uLogoGizmoHalf;
  if (gizmoState) {
    applyLogoGizmoFrameToUniforms(material, gizmoState);
    material.userData.garmentLogoGizmoFrameState = gizmoState;
  }
};

const applyGarmentLogoGizmoButtonsReveal = (material: MeshStandardMaterial, reveal: number[]) => {
  const gUniform = material.userData.uLogoGUniform as { value: Vector4[] } | undefined;
  if (!gUniform) return;

  reveal.forEach((value, index) => {
    if (gUniform.value[index]) gUniform.value[index].z = value;
  });
};

export { applyGarmentLogoGizmoButtonsReveal, applyGarmentLogoGizmoFrame, applyGarmentLogoStamp, applyGarmentLogoStyle, hydrateGarmentLogoUniforms };
