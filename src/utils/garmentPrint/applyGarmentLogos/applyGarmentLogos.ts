import { type MeshStandardMaterial, type Texture, Vector2, Vector4 } from 'three';

import type { garmentLogoStampStateType, gizmoFrameStateType, logoStyleUniformsType } from '@types';

let pendingLogoStamp: garmentLogoStampStateType | null = null;
let pendingLogoStyle: logoStyleUniformsType | null = null;
let pendingLogoGizmoFrame: gizmoFrameStateType | null = null;

const applyLogoStampToUniforms = (material: MeshStandardMaterial, state: garmentLogoStampStateType) => {
  const stampUniform = material.userData.uLogoStampUniform as { value: Texture } | undefined;
  const cellSizeUniform = material.userData.uLogoStampCellSizeUniform as { value: Vector2 } | undefined;

  if (stampUniform) stampUniform.value = state.stamp;
  if (cellSizeUniform) cellSizeUniform.value.set(state.cellSize.width, state.cellSize.height);
};

const applyLogoStyleToUniforms = (material: MeshStandardMaterial, style: logoStyleUniformsType) => {
  const anchorUniform = material.userData.uLogoAnchorUvUniform as { value: Vector2[] } | undefined;
  if (anchorUniform) {
    style.anchorUv.forEach((anchor, index) => {
      anchorUniform.value[index]?.set(anchor.x, anchor.y);
    });
  }

  const rotationUniform = material.userData.uLogoRotationUniform as { value: number[] } | undefined;
  if (rotationUniform) {
    style.rotation.forEach((value, index) => {
      rotationUniform.value[index] = value;
    });
  }

  const uploadRotationUniform = material.userData.uLogoUploadRotationUniform as { value: number[] } | undefined;
  if (uploadRotationUniform) {
    style.uploadRotation.forEach((value, index) => {
      uploadRotationUniform.value[index] = value;
    });
  }

  const partRotationUniform = material.userData.uLogoPartRotationUniform as { value: number[] } | undefined;
  if (partRotationUniform) {
    style.partRotation.forEach((value, index) => {
      partRotationUniform.value[index] = value;
    });
  }

  const scaleUniform = material.userData.uLogoScaleUniform as { value: number[] } | undefined;
  if (scaleUniform) {
    style.scale.forEach((value, index) => {
      scaleUniform.value[index] = value;
    });
  }

  const slotActiveUniform = material.userData.uLogoSlotActiveUniform as { value: number[] } | undefined;
  if (slotActiveUniform) {
    style.slotActive.forEach((value, index) => {
      slotActiveUniform.value[index] = value;
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

  const frameActiveUniform = material.userData.uLogoGizmoFrameActiveUniform as { value: number[] } | undefined;
  if (frameActiveUniform) {
    state.frameActive.forEach((value, index) => {
      frameActiveUniform.value[index] = value;
    });
  }

  const buttonsActiveUniform = material.userData.uLogoGizmoButtonsActiveUniform as { value: number[] } | undefined;
  if (buttonsActiveUniform) {
    state.gizmoActive.forEach((value, index) => {
      buttonsActiveUniform.value[index] = value;
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
    uLogoAnchorUv: { value: Vector2[] };
    uLogoRotation: { value: number[] };
    uLogoUploadRotation: { value: number[] };
    uLogoPartRotation: { value: number[] };
    uLogoScale: { value: number[] };
    uLogoSlotActive: { value: number[] };
    uLogoPartBounds: { value: Vector4[] };
    uLogoGizmoEnabled: { value: number };
    uLogoGizmoHalf: { value: Vector2[] };
  },
) => {
  const stampState = (material.userData.garmentLogoStampState as garmentLogoStampStateType | undefined) ?? pendingLogoStamp;
  const styleState = (material.userData.garmentLogoStyleState as logoStyleUniformsType | undefined) ?? pendingLogoStyle;
  const gizmoState = (material.userData.garmentLogoGizmoFrameState as gizmoFrameStateType | undefined) ?? pendingLogoGizmoFrame;

  if (stampState) {
    uniforms.uLogoStamp.value = stampState.stamp;
    uniforms.uLogoStampCellSize.value.set(stampState.cellSize.width, stampState.cellSize.height);
    material.userData.garmentLogoStampState = stampState;
    material.userData.uLogoStampUniform = uniforms.uLogoStamp;
    material.userData.uLogoStampCellSizeUniform = uniforms.uLogoStampCellSize;
  }

  if (styleState) {
    applyLogoStyleToUniforms(material, styleState);
    material.userData.garmentLogoStyleState = styleState;
    material.userData.uLogoAnchorUvUniform = uniforms.uLogoAnchorUv;
    material.userData.uLogoRotationUniform = uniforms.uLogoRotation;
    material.userData.uLogoUploadRotationUniform = uniforms.uLogoUploadRotation;
    material.userData.uLogoPartRotationUniform = uniforms.uLogoPartRotation;
    material.userData.uLogoScaleUniform = uniforms.uLogoScale;
    material.userData.uLogoSlotActiveUniform = uniforms.uLogoSlotActive;
    material.userData.uLogoPartBoundsUniform = uniforms.uLogoPartBounds;
  }

  material.userData.uLogoGizmoEnabledUniform = uniforms.uLogoGizmoEnabled;
  material.userData.uLogoGizmoHalfUniform = uniforms.uLogoGizmoHalf;
  if (gizmoState) {
    applyLogoGizmoFrameToUniforms(material, gizmoState);
    material.userData.garmentLogoGizmoFrameState = gizmoState;
  }
};

const applyGarmentLogoGizmoButtonsReveal = (material: MeshStandardMaterial, reveal: number[]) => {
  const revealUniform = material.userData.uLogoGizmoButtonsRevealUniform as { value: number[] } | undefined;
  if (!revealUniform) return;

  reveal.forEach((value, index) => {
    revealUniform.value[index] = value;
  });
};

export { applyGarmentLogoGizmoButtonsReveal, applyGarmentLogoGizmoFrame, applyGarmentLogoStamp, applyGarmentLogoStyle, hydrateGarmentLogoUniforms };
