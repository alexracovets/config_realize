import { Color, LinearFilter, LinearMipmapLinearFilter, type MeshStandardMaterial, type Texture, Vector2, Vector4 } from 'three';

import type { garmentNameMaskStateType, gizmoFrameStateType, nameStyleUniformsType } from '@configurator/types';

let pendingNameMasks: garmentNameMaskStateType | null = null;
let pendingNameStyle: nameStyleUniformsType | null = null;
let pendingNumberMasks: garmentNameMaskStateType | null = null;
let pendingNumberStyle: nameStyleUniformsType | null = null;
let pendingGizmoFrame: gizmoFrameStateType | null = null;
let pendingNumberGizmoFrame: gizmoFrameStateType | null = null;
let pendingGizmoIcons: Texture | null = null;

const applyNameMasksToUniforms = (material: MeshStandardMaterial, state: garmentNameMaskStateType) => {
  const maskUniform = material.userData.uNameMaskUniform as { value: Texture } | undefined;
  if (maskUniform) maskUniform.value = state.mask;
};

const applyNameStyleToUniforms = (material: MeshStandardMaterial, style: nameStyleUniformsType) => {
  const stampSizeUniform = material.userData.uNameStampSizeUniform as { value: Vector2 } | undefined;
  if (stampSizeUniform) stampSizeUniform.value.set(style.stampSize.width, style.stampSize.height);

  const anchorUniform = material.userData.uNameAnchorUvUniform as { value: Vector2[] } | undefined;
  if (anchorUniform) {
    style.anchorUv.forEach((anchor, index) => {
      anchorUniform.value[index].set(anchor.x, anchor.y);
    });
  }

  const rotationUniform = material.userData.uNameRotationUniform as { value: number[] } | undefined;
  if (rotationUniform) {
    style.rotation.forEach((value, index) => {
      rotationUniform.value[index] = value;
    });
  }

  const placementRotationUniform = material.userData.uNamePlacementRotationUniform as { value: number[] } | undefined;
  if (placementRotationUniform) {
    style.placementRotation.forEach((value, index) => {
      placementRotationUniform.value[index] = value;
    });
  }

  const uploadRotationUniform = material.userData.uNameUploadRotationUniform as { value: number[] } | undefined;
  if (uploadRotationUniform) {
    style.uploadRotation.forEach((value, index) => {
      uploadRotationUniform.value[index] = value;
    });
  }

  const partRotationUniform = material.userData.uNamePartRotationUniform as { value: number[] } | undefined;
  if (partRotationUniform) {
    style.partRotation.forEach((value, index) => {
      partRotationUniform.value[index] = value;
    });
  }

  const scaleUniform = material.userData.uNameScaleUniform as { value: number[] } | undefined;
  if (scaleUniform) {
    style.scale.forEach((value, index) => {
      scaleUniform.value[index] = value;
    });
  }

  const slotActiveUniform = material.userData.uNameSlotActiveUniform as { value: number[] } | undefined;
  if (slotActiveUniform) {
    style.slotActive.forEach((value, index) => {
      slotActiveUniform.value[index] = value;
    });
  }

  const partBoundsUniform = material.userData.uNamePartBoundsUniform as { value: Vector4[] } | undefined;
  if (partBoundsUniform) {
    style.partBounds.forEach((bounds, index) => {
      partBoundsUniform.value[index].set(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    });
  }

  const textUniforms = material.userData.uNameTextColorsUniform as { value: Color[] } | undefined;
  if (textUniforms) {
    style.textColors.forEach((color, index) => {
      textUniforms.value[index].set(color);
    });
  }

  const strokeUniforms = material.userData.uNameStrokeColorsUniform as { value: Color[] } | undefined;
  if (strokeUniforms) {
    style.strokeColors.forEach((color, index) => {
      strokeUniforms.value[index].set(color);
    });
  }
};

const applyGarmentNameMasks = (material: MeshStandardMaterial, state: garmentNameMaskStateType) => {
  pendingNameMasks = state;
  material.userData.garmentNameMaskState = state;
  applyNameMasksToUniforms(material, state);
};

const applyGarmentNameStyle = (material: MeshStandardMaterial, style: nameStyleUniformsType) => {
  pendingNameStyle = style;
  material.userData.garmentNameStyleState = style;
  applyNameStyleToUniforms(material, style);
};

const applyNumberMasksToUniforms = (material: MeshStandardMaterial, state: garmentNameMaskStateType) => {
  const maskUniform = material.userData.uNumberMaskUniform as { value: Texture } | undefined;
  if (maskUniform) maskUniform.value = state.mask;
};

const applyNumberStyleToUniforms = (material: MeshStandardMaterial, style: nameStyleUniformsType) => {
  const stampSizeUniform = material.userData.uNumberStampSizeUniform as { value: Vector2 } | undefined;
  if (stampSizeUniform) stampSizeUniform.value.set(style.stampSize.width, style.stampSize.height);

  const anchorUniform = material.userData.uNumberAnchorUvUniform as { value: Vector2[] } | undefined;
  if (anchorUniform) {
    style.anchorUv.forEach((anchor, index) => {
      anchorUniform.value[index].set(anchor.x, anchor.y);
    });
  }

  const rotationUniform = material.userData.uNumberRotationUniform as { value: number[] } | undefined;
  if (rotationUniform) {
    style.rotation.forEach((value, index) => {
      rotationUniform.value[index] = value;
    });
  }

  const placementRotationUniform = material.userData.uNumberPlacementRotationUniform as { value: number[] } | undefined;
  if (placementRotationUniform) {
    style.placementRotation.forEach((value, index) => {
      placementRotationUniform.value[index] = value;
    });
  }

  const uploadRotationUniform = material.userData.uNumberUploadRotationUniform as { value: number[] } | undefined;
  if (uploadRotationUniform) {
    style.uploadRotation.forEach((value, index) => {
      uploadRotationUniform.value[index] = value;
    });
  }

  const partRotationUniform = material.userData.uNumberPartRotationUniform as { value: number[] } | undefined;
  if (partRotationUniform) {
    style.partRotation.forEach((value, index) => {
      partRotationUniform.value[index] = value;
    });
  }

  const scaleUniform = material.userData.uNumberScaleUniform as { value: number[] } | undefined;
  if (scaleUniform) {
    style.scale.forEach((value, index) => {
      scaleUniform.value[index] = value;
    });
  }

  const lineHeightUniform = material.userData.uNumberLineHeightUniform as { value: number[] } | undefined;
  if (lineHeightUniform && style.lineHeight) {
    style.lineHeight.forEach((value, index) => {
      lineHeightUniform.value[index] = value;
    });
  }

  const slotActiveUniform = material.userData.uNumberSlotActiveUniform as { value: number[] } | undefined;
  if (slotActiveUniform) {
    style.slotActive.forEach((value, index) => {
      slotActiveUniform.value[index] = value;
    });
  }

  const partBoundsUniform = material.userData.uNumberPartBoundsUniform as { value: Vector4[] } | undefined;
  if (partBoundsUniform) {
    style.partBounds.forEach((bounds, index) => {
      partBoundsUniform.value[index].set(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    });
  }

  const textUniforms = material.userData.uNumberTextColorsUniform as { value: Color[] } | undefined;
  if (textUniforms) {
    style.textColors.forEach((color, index) => {
      textUniforms.value[index].set(color);
    });
  }

  const strokeUniforms = material.userData.uNumberStrokeColorsUniform as { value: Color[] } | undefined;
  if (strokeUniforms) {
    style.strokeColors.forEach((color, index) => {
      strokeUniforms.value[index].set(color);
    });
  }
};

const applyGarmentNumberMasks = (material: MeshStandardMaterial, state: garmentNameMaskStateType) => {
  pendingNumberMasks = state;
  material.userData.garmentNumberMaskState = state;
  applyNumberMasksToUniforms(material, state);
};

const applyGarmentNumberStyle = (material: MeshStandardMaterial, style: nameStyleUniformsType) => {
  pendingNumberStyle = style;
  material.userData.garmentNumberStyleState = style;
  applyNumberStyleToUniforms(material, style);
};

const applyGarmentPrintAtlasSize = (material: MeshStandardMaterial, width: number, height: number) => {
  const atlasUniform = material.userData.uPrintAtlasSizeUniform as { value: Vector2 } | undefined;
  if (atlasUniform) atlasUniform.value.set(width, height);
};

const applyGizmoFrameToUniforms = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  const enabledUniform = material.userData.uNameGizmoEnabledUniform as { value: number } | undefined;
  if (enabledUniform) enabledUniform.value = state.enabled;

  const halfUniform = material.userData.uNameGizmoHalfUniform as { value: Vector2[] } | undefined;
  if (halfUniform) {
    state.half.forEach((half, index) => {
      halfUniform.value[index]?.set(half.x, half.y);
    });
  }

  const frameActiveUniform = material.userData.uNameGizmoFrameActiveUniform as { value: number[] } | undefined;
  if (frameActiveUniform) {
    state.frameActive.forEach((value, index) => {
      frameActiveUniform.value[index] = value;
    });
  }

  const gizmoActiveUniform = material.userData.uNameGizmoButtonsActiveUniform as { value: number[] } | undefined;
  if (gizmoActiveUniform) {
    state.gizmoActive.forEach((value, index) => {
      gizmoActiveUniform.value[index] = value;
    });
  }
};

const applyGarmentGizmoFrame = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  pendingGizmoFrame = state;
  material.userData.garmentGizmoFrameState = state;
  applyGizmoFrameToUniforms(material, state);
};

const applyNumberGizmoFrameToUniforms = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  const enabledUniform = material.userData.uNumberGizmoEnabledUniform as { value: number } | undefined;
  if (enabledUniform) enabledUniform.value = state.enabled;

  const halfUniform = material.userData.uNumberGizmoHalfUniform as { value: Vector2[] } | undefined;
  if (halfUniform) {
    state.half.forEach((half, index) => {
      halfUniform.value[index]?.set(half.x, half.y);
    });
  }

  const frameActiveUniform = material.userData.uNumberGizmoFrameActiveUniform as { value: number[] } | undefined;
  if (frameActiveUniform) {
    state.frameActive.forEach((value, index) => {
      frameActiveUniform.value[index] = value;
    });
  }

  const gizmoActiveUniform = material.userData.uNumberGizmoButtonsActiveUniform as { value: number[] } | undefined;
  if (gizmoActiveUniform) {
    state.gizmoActive.forEach((value, index) => {
      gizmoActiveUniform.value[index] = value;
    });
  }
};

const applyGarmentNumberGizmoFrame = (material: MeshStandardMaterial, state: gizmoFrameStateType) => {
  pendingNumberGizmoFrame = state;
  material.userData.garmentNumberGizmoFrameState = state;
  applyNumberGizmoFrameToUniforms(material, state);
};

const applyGarmentGizmoIcons = (material: MeshStandardMaterial, texture: Texture) => {
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = Math.max(texture.anisotropy, 16);
  pendingGizmoIcons = texture;
  material.userData.garmentGizmoIcons = texture;
  const iconsUniform = material.userData.uNameGizmoIconsUniform as { value: Texture } | undefined;
  if (iconsUniform) iconsUniform.value = texture;
};

const applyGarmentGizmoButtonsReveal = (material: MeshStandardMaterial, reveal: number[]) => {
  const revealUniform = material.userData.uNameGizmoButtonsRevealUniform as { value: number[] } | undefined;
  if (!revealUniform) return;

  reveal.forEach((value, index) => {
    revealUniform.value[index] = value;
  });
};

const applyGarmentNumberGizmoButtonsReveal = (material: MeshStandardMaterial, reveal: number[]) => {
  const revealUniform = material.userData.uNumberGizmoButtonsRevealUniform as { value: number[] } | undefined;
  if (!revealUniform) return;

  reveal.forEach((value, index) => {
    revealUniform.value[index] = value;
  });
};

const applyGarmentGizmoHover = (material: MeshStandardMaterial, hover: { slot: number; corner: number; scale: number }) => {
  const slotUniform = material.userData.uNameGizmoHoverSlotUniform as { value: number } | undefined;
  const cornerUniform = material.userData.uNameGizmoHoverCornerUniform as { value: number } | undefined;
  const scaleUniform = material.userData.uNameGizmoHoverScaleUniform as { value: number } | undefined;

  if (slotUniform) slotUniform.value = hover.slot;
  if (cornerUniform) cornerUniform.value = hover.corner;
  if (scaleUniform) scaleUniform.value = hover.scale;
};

const hydrateGarmentNameUniforms = (
  material: MeshStandardMaterial,
  uniforms: {
    uNameMask: { value: Texture };
    uNameStampSize: { value: Vector2 };
    uNameAnchorUv: { value: Vector2[] };
    uNameRotation: { value: number[] };
    uNamePlacementRotation: { value: number[] };
    uNameUploadRotation: { value: number[] };
    uNamePartRotation: { value: number[] };
    uNameScale: { value: number[] };
    uNameSlotActive: { value: number[] };
    uNamePartBounds: { value: Vector4[] };
    uNameTextColors: { value: Color[] };
    uNameStrokeColors: { value: Color[] };
    uNameGizmoEnabled: { value: number };
    uNameGizmoHalf: { value: Vector2[] };
    uNameGizmoIcons: { value: Texture };
  },
) => {
  const maskState = (material.userData.garmentNameMaskState as garmentNameMaskStateType | undefined) ?? pendingNameMasks;
  const styleState = (material.userData.garmentNameStyleState as nameStyleUniformsType | undefined) ?? pendingNameStyle;
  const gizmoState = (material.userData.garmentGizmoFrameState as gizmoFrameStateType | undefined) ?? pendingGizmoFrame;

  if (maskState) {
    uniforms.uNameMask.value = maskState.mask;
    material.userData.garmentNameMaskState = maskState;
    material.userData.uNameMaskUniform = uniforms.uNameMask;
  }

  if (styleState) {
    applyNameStyleToUniforms(material, styleState);
    material.userData.garmentNameStyleState = styleState;
    material.userData.uNameStampSizeUniform = uniforms.uNameStampSize;
    material.userData.uNameAnchorUvUniform = uniforms.uNameAnchorUv;
    material.userData.uNameRotationUniform = uniforms.uNameRotation;
    material.userData.uNamePlacementRotationUniform = uniforms.uNamePlacementRotation;
    material.userData.uNameUploadRotationUniform = uniforms.uNameUploadRotation;
    material.userData.uNamePartRotationUniform = uniforms.uNamePartRotation;
    material.userData.uNameScaleUniform = uniforms.uNameScale;
    material.userData.uNameSlotActiveUniform = uniforms.uNameSlotActive;
    material.userData.uNamePartBoundsUniform = uniforms.uNamePartBounds;
    material.userData.uNameTextColorsUniform = uniforms.uNameTextColors;
    material.userData.uNameStrokeColorsUniform = uniforms.uNameStrokeColors;
  }

  material.userData.uNameGizmoEnabledUniform = uniforms.uNameGizmoEnabled;
  material.userData.uNameGizmoHalfUniform = uniforms.uNameGizmoHalf;
  material.userData.uNameGizmoIconsUniform = uniforms.uNameGizmoIcons;
  if (gizmoState) {
    applyGizmoFrameToUniforms(material, gizmoState);
    material.userData.garmentGizmoFrameState = gizmoState;
  }
  const iconsState = (material.userData.garmentGizmoIcons as Texture | undefined) ?? pendingGizmoIcons;
  if (iconsState) {
    uniforms.uNameGizmoIcons.value = iconsState;
    material.userData.garmentGizmoIcons = iconsState;
  }
};

const hydrateGarmentNumberUniforms = (
  material: MeshStandardMaterial,
  uniforms: {
    uNumberMask: { value: Texture };
    uNumberStampSize: { value: Vector2 };
    uNumberAnchorUv: { value: Vector2[] };
    uNumberRotation: { value: number[] };
    uNumberPlacementRotation: { value: number[] };
    uNumberUploadRotation: { value: number[] };
    uNumberPartRotation: { value: number[] };
    uNumberScale: { value: number[] };
    uNumberLineHeight: { value: number[] };
    uNumberSlotActive: { value: number[] };
    uNumberPartBounds: { value: Vector4[] };
    uNumberTextColors: { value: Color[] };
    uNumberStrokeColors: { value: Color[] };
    uNumberGizmoEnabled: { value: number };
    uNumberGizmoHalf: { value: Vector2[] };
  },
) => {
  const maskState = (material.userData.garmentNumberMaskState as garmentNameMaskStateType | undefined) ?? pendingNumberMasks;
  const styleState = (material.userData.garmentNumberStyleState as nameStyleUniformsType | undefined) ?? pendingNumberStyle;
  const gizmoState = (material.userData.garmentNumberGizmoFrameState as gizmoFrameStateType | undefined) ?? pendingNumberGizmoFrame;

  if (maskState) {
    uniforms.uNumberMask.value = maskState.mask;
    material.userData.garmentNumberMaskState = maskState;
    material.userData.uNumberMaskUniform = uniforms.uNumberMask;
  }

  if (styleState) {
    applyNumberStyleToUniforms(material, styleState);
    material.userData.garmentNumberStyleState = styleState;
    material.userData.uNumberStampSizeUniform = uniforms.uNumberStampSize;
    material.userData.uNumberAnchorUvUniform = uniforms.uNumberAnchorUv;
    material.userData.uNumberRotationUniform = uniforms.uNumberRotation;
    material.userData.uNumberPlacementRotationUniform = uniforms.uNumberPlacementRotation;
    material.userData.uNumberUploadRotationUniform = uniforms.uNumberUploadRotation;
    material.userData.uNumberPartRotationUniform = uniforms.uNumberPartRotation;
    material.userData.uNumberScaleUniform = uniforms.uNumberScale;
    material.userData.uNumberLineHeightUniform = uniforms.uNumberLineHeight;
    material.userData.uNumberSlotActiveUniform = uniforms.uNumberSlotActive;
    material.userData.uNumberPartBoundsUniform = uniforms.uNumberPartBounds;
    material.userData.uNumberTextColorsUniform = uniforms.uNumberTextColors;
    material.userData.uNumberStrokeColorsUniform = uniforms.uNumberStrokeColors;
  }

  material.userData.uNumberGizmoEnabledUniform = uniforms.uNumberGizmoEnabled;
  material.userData.uNumberGizmoHalfUniform = uniforms.uNumberGizmoHalf;
  material.userData.uNumberLineHeightUniform = uniforms.uNumberLineHeight;
  if (gizmoState) {
    applyNumberGizmoFrameToUniforms(material, gizmoState);
    material.userData.garmentNumberGizmoFrameState = gizmoState;
  }
};

export {
  applyGarmentGizmoButtonsReveal,
  applyGarmentGizmoFrame,
  applyGarmentGizmoHover,
  applyGarmentGizmoIcons,
  applyGarmentNameMasks,
  applyGarmentNameStyle,
  applyGarmentNumberGizmoButtonsReveal,
  applyGarmentNumberGizmoFrame,
  applyGarmentNumberMasks,
  applyGarmentNumberStyle,
  applyGarmentPrintAtlasSize,
  hydrateGarmentNameUniforms,
  hydrateGarmentNumberUniforms,
};
