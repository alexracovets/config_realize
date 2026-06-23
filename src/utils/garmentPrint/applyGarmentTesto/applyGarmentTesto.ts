import { Color, type MeshStandardMaterial, type Texture, Vector2, Vector4 } from 'three';

import type { garmentNameMaskStateType, gizmoFrameStateType, nameStyleUniformsType } from '@types';

let pendingTestoMasks: garmentNameMaskStateType | null = null;
let pendingTestoStyle: nameStyleUniformsType | null = null;
let pendingTestoGizmoFrame: gizmoFrameStateType | null = null;

const applyTestoMasksToUniforms = (material: MeshStandardMaterial, state: garmentNameMaskStateType) => {
  const maskUniform = material.userData.uTestoMaskUniform as { value: Texture } | undefined;
  if (maskUniform) maskUniform.value = state.mask;
};

const applyTestoStyleToUniforms = (material: MeshStandardMaterial, style: nameStyleUniformsType) => {
  const stampSizeUniform = material.userData.uTestoStampSizeUniform as { value: Vector2 } | undefined;
  if (stampSizeUniform) stampSizeUniform.value.set(style.stampSize.width, style.stampSize.height);

  const anchorUniform = material.userData.uTestoAnchorUvUniform as { value: Vector2[] } | undefined;
  if (anchorUniform) {
    style.anchorUv.forEach((anchor, index) => {
      anchorUniform.value[index].set(anchor.x, anchor.y);
    });
  }

  const rotationUniform = material.userData.uTestoRotationUniform as { value: number[] } | undefined;
  if (rotationUniform) {
    style.rotation.forEach((value, index) => {
      rotationUniform.value[index] = value;
    });
  }

  const placementRotationUniform = material.userData.uTestoPlacementRotationUniform as { value: number[] } | undefined;
  if (placementRotationUniform) {
    style.placementRotation.forEach((value, index) => {
      placementRotationUniform.value[index] = value;
    });
  }

  const uploadRotationUniform = material.userData.uTestoUploadRotationUniform as { value: number[] } | undefined;
  if (uploadRotationUniform) {
    style.uploadRotation.forEach((value, index) => {
      uploadRotationUniform.value[index] = value;
    });
  }

  const partRotationUniform = material.userData.uTestoPartRotationUniform as { value: number[] } | undefined;
  if (partRotationUniform) {
    style.partRotation.forEach((value, index) => {
      partRotationUniform.value[index] = value;
    });
  }

  const scaleUniform = material.userData.uTestoScaleUniform as { value: number[] } | undefined;
  if (scaleUniform) {
    style.scale.forEach((value, index) => {
      scaleUniform.value[index] = value;
    });
  }

  const slotActiveUniform = material.userData.uTestoSlotActiveUniform as { value: number[] } | undefined;
  if (slotActiveUniform) {
    style.slotActive.forEach((value, index) => {
      slotActiveUniform.value[index] = value;
    });
  }

  const partBoundsUniform = material.userData.uTestoPartBoundsUniform as { value: Vector4[] } | undefined;
  if (partBoundsUniform) {
    style.partBounds.forEach((bounds, index) => {
      partBoundsUniform.value[index].set(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    });
  }

  const textUniforms = material.userData.uTestoTextColorsUniform as { value: Color[] } | undefined;
  if (textUniforms) {
    style.textColors.forEach((color, index) => {
      textUniforms.value[index].set(color);
    });
  }

  const strokeUniforms = material.userData.uTestoStrokeColorsUniform as { value: Color[] } | undefined;
  if (strokeUniforms) {
    style.strokeColors.forEach((color, index) => {
      strokeUniforms.value[index].set(color);
    });
  }

  const lineHeightUniform = material.userData.uTestoLineHeightUniform as { value: number[] } | undefined;
  if (lineHeightUniform && style.lineHeight) {
    style.lineHeight.forEach((value, index) => {
      lineHeightUniform.value[index] = value;
    });
  }
};

const applyGarmentTestoMasks = (material: MeshStandardMaterial, state: garmentNameMaskStateType) => {
  pendingTestoMasks = state;
  material.userData.garmentTestoMaskState = state;
  applyTestoMasksToUniforms(material, state);
};

const applyGarmentTestoStyle = (material: MeshStandardMaterial, style: nameStyleUniformsType) => {
  pendingTestoStyle = style;
  material.userData.garmentTestoStyleState = style;
  applyTestoStyleToUniforms(material, style);
};

const applyTestoGizmoFrameToUniforms = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  const enabledUniform = material.userData.uTestoGizmoEnabledUniform as { value: number } | undefined;
  if (enabledUniform) enabledUniform.value = state.enabled;

  const halfUniform = material.userData.uTestoGizmoHalfUniform as { value: Vector2[] } | undefined;
  if (halfUniform) {
    state.half.forEach((half, index) => {
      halfUniform.value[index]?.set(half.x, half.y);
    });
  }

  const frameActiveUniform = material.userData.uTestoGizmoFrameActiveUniform as { value: number[] } | undefined;
  if (frameActiveUniform) {
    state.frameActive.forEach((value, index) => {
      frameActiveUniform.value[index] = value;
    });
  }

  const gizmoActiveUniform = material.userData.uTestoGizmoButtonsActiveUniform as { value: number[] } | undefined;
  if (gizmoActiveUniform) {
    state.gizmoActive.forEach((value, index) => {
      gizmoActiveUniform.value[index] = value;
    });
  }
};

const applyGarmentTestoGizmoFrame = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  pendingTestoGizmoFrame = state;
  material.userData.garmentTestoGizmoFrameState = state;
  applyTestoGizmoFrameToUniforms(material, state);
};

const applyGarmentTestoGizmoButtonsReveal = (material: MeshStandardMaterial, reveal: number[]) => {
  const revealUniform = material.userData.uTestoGizmoButtonsRevealUniform as { value: number[] } | undefined;
  if (!revealUniform) return;

  reveal.forEach((value, index) => {
    revealUniform.value[index] = value;
  });
};

const hydrateGarmentTestoUniforms = (
  material: MeshStandardMaterial,
  uniforms: {
    uTestoMask: { value: Texture };
    uTestoStampSize: { value: Vector2 };
    uTestoAnchorUv: { value: Vector2[] };
    uTestoRotation: { value: number[] };
    uTestoPlacementRotation: { value: number[] };
    uTestoUploadRotation: { value: number[] };
    uTestoPartRotation: { value: number[] };
    uTestoScale: { value: number[] };
    uTestoSlotActive: { value: number[] };
    uTestoPartBounds: { value: Vector4[] };
    uTestoTextColors: { value: Color[] };
    uTestoStrokeColors: { value: Color[] };
    uTestoGizmoEnabled: { value: number };
    uTestoGizmoHalf: { value: Vector2[] };
    uTestoLineHeight: { value: number[] };
  },
) => {
  const maskState = (material.userData.garmentTestoMaskState as garmentNameMaskStateType | undefined) ?? pendingTestoMasks;
  const styleState = (material.userData.garmentTestoStyleState as nameStyleUniformsType | undefined) ?? pendingTestoStyle;
  const gizmoState = (material.userData.garmentTestoGizmoFrameState as gizmoFrameStateType | undefined) ?? pendingTestoGizmoFrame;

  if (maskState) {
    uniforms.uTestoMask.value = maskState.mask;
    material.userData.garmentTestoMaskState = maskState;
    material.userData.uTestoMaskUniform = uniforms.uTestoMask;
  }

  if (styleState) {
    applyTestoStyleToUniforms(material, styleState);
    material.userData.garmentTestoStyleState = styleState;
    material.userData.uTestoStampSizeUniform = uniforms.uTestoStampSize;
    material.userData.uTestoAnchorUvUniform = uniforms.uTestoAnchorUv;
    material.userData.uTestoRotationUniform = uniforms.uTestoRotation;
    material.userData.uTestoPlacementRotationUniform = uniforms.uTestoPlacementRotation;
    material.userData.uTestoUploadRotationUniform = uniforms.uTestoUploadRotation;
    material.userData.uTestoPartRotationUniform = uniforms.uTestoPartRotation;
    material.userData.uTestoScaleUniform = uniforms.uTestoScale;
    material.userData.uTestoSlotActiveUniform = uniforms.uTestoSlotActive;
    material.userData.uTestoPartBoundsUniform = uniforms.uTestoPartBounds;
    material.userData.uTestoTextColorsUniform = uniforms.uTestoTextColors;
    material.userData.uTestoStrokeColorsUniform = uniforms.uTestoStrokeColors;
    material.userData.uTestoLineHeightUniform = uniforms.uTestoLineHeight;
  }

  material.userData.uTestoGizmoEnabledUniform = uniforms.uTestoGizmoEnabled;
  material.userData.uTestoGizmoHalfUniform = uniforms.uTestoGizmoHalf;
  if (gizmoState) {
    applyTestoGizmoFrameToUniforms(material, gizmoState);
    material.userData.garmentTestoGizmoFrameState = gizmoState;
  }
};

export { applyGarmentTestoGizmoButtonsReveal, applyGarmentTestoGizmoFrame, applyGarmentTestoMasks, applyGarmentTestoStyle, hydrateGarmentTestoUniforms };
