import { Color, MeshStandardMaterial, Vector2, Vector4 } from 'three';

import {
  LOGO_SLOT_COUNT,
  NAME_GIZMO_BTN_ACTIVE_COLOR,
  NAME_GIZMO_BTN_FILL_COLOR,
  NAME_GIZMO_ICON_COLOR,
  NAME_SLOT_COUNT,
  PRINT_ATLAS_HEIGHT,
  PRINT_ATLAS_WIDTH,
} from '@constants';

import type { garmentPrintStateType, pbrMapsType } from '@types';
import {
  garmentFragmentUvPars,
  garmentGizmoLightsFragment,
  garmentGradientMapFragment,
  garmentNormalFragment,
  garmentPrintLightsFragment,
  garmentPrintMapFragment,
  garmentRoughnessFragment,
  garmentVertexUv,
  garmentVertexUvPars,
} from '@shaders';
import { hydrateGarmentLogoUniforms } from '../garmentPrint/applyGarmentLogos';
import { hydrateGarmentNameUniforms, hydrateGarmentNumberUniforms } from '../garmentPrint/applyGarmentNames';
import { hydrateGarmentTestoUniforms } from '../garmentPrint/applyGarmentTesto';
import { getEmptyPrintTexture } from '../garmentPrint/emptyPrintTexture';

import { applyGarmentPrintBase, applyPbrMaps } from './applyPbrMaps';

const GARMENT_SHADER_VERSION = 'garment-pbr-print-v85-bake-normal-decode';

type GarmentGradientState = {
  color2: string;
  rotation: number;
  position: number;
  softness: number;
  opacity: number;
  enabled: boolean;
};

const configureGarmentShader = (material: MeshStandardMaterial) => {
  if (material.userData.garmentShaderConfigured) return;

  material.userData.garmentShaderConfigured = true;

  const emptyPrint = getEmptyPrintTexture();
  material.userData.uPartUvBounds = material.userData.uPartUvBounds ?? new Vector4(0, 0, 1, 1);

  material.onBeforeCompile = (shader) => {
    const pbrUvChannel = (material.userData.pbrUvChannel as 0 | 1 | undefined) ?? 1;
    const printState = material.userData.garmentPrintState as garmentPrintStateType | undefined;
    const gradient = material.userData.garmentGradient as GarmentGradientState | undefined;

    shader.defines = { ...shader.defines, USE_UV1: '', USE_GRADIENT: '', USE_PRINT: '' };
    if (pbrUvChannel === 0) {
      shader.defines.USE_PBR_UV0 = '';
    }
    shader.uniforms.uPartUvBounds = { value: material.userData.uPartUvBounds };
    material.userData.uPartUvBoundsUniform = shader.uniforms.uPartUvBounds;
    shader.uniforms.uGradientEnabled = { value: gradient?.enabled ? 1 : 0 };
    shader.uniforms.uGradientColor2 = { value: new Color(gradient?.color2 ?? '#000000') };
    shader.uniforms.uGradientRotation = { value: ((gradient?.rotation ?? 0) * Math.PI) / 180 };
    shader.uniforms.uGradientPosition = { value: gradient?.position ?? 0.5 };
    shader.uniforms.uGradientSoftness = { value: gradient?.softness ?? 0.5 };
    shader.uniforms.uGradientOpacity = { value: gradient?.opacity ?? 1 };
    material.userData.uGradientEnabledUniform = shader.uniforms.uGradientEnabled;
    material.userData.uGradientColor2Uniform = shader.uniforms.uGradientColor2;
    material.userData.uGradientRotationUniform = shader.uniforms.uGradientRotation;
    material.userData.uGradientPositionUniform = shader.uniforms.uGradientPosition;
    material.userData.uGradientSoftnessUniform = shader.uniforms.uGradientSoftness;
    material.userData.uGradientOpacityUniform = shader.uniforms.uGradientOpacity;
    shader.uniforms.uDefaultLogos = { value: printState?.defaultLogos ?? emptyPrint };
    shader.uniforms.uPrintAtlasSize = { value: new Vector2(PRINT_ATLAS_WIDTH, PRINT_ATLAS_HEIGHT) };
    shader.uniforms.uGizmoRotation = { value: 0 };
    shader.uniforms.uNameMask = { value: emptyPrint };
    shader.uniforms.uNameStampSize = { value: new Vector2(1, 1) };
    shader.uniforms.uNameAnchorUv = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector2()) };
    shader.uniforms.uNameRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNamePlacementRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNameUploadRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNamePartRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNameScale = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 1) };
    shader.uniforms.uNameSlotActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNamePartBounds = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector4(0, 0, 1, 1)) };
    shader.uniforms.uNameTextColors = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Color('#000000')) };
    shader.uniforms.uNameStrokeColors = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Color('#ffffff')) };
    shader.uniforms.uNameGizmoEnabled = { value: 0 };
    shader.uniforms.uNameGizmoFrameActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNameGizmoButtonsActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNameGizmoButtonsReveal = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNameGizmoHalf = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector2(0, 0)) };
    shader.uniforms.uNameGizmoIcons = { value: emptyPrint };
    shader.uniforms.uNameGizmoHoverSlot = { value: -1 };
    shader.uniforms.uNameGizmoHoverCorner = { value: -1 };
    shader.uniforms.uNameGizmoHoverScale = { value: 1 };
    shader.uniforms.uNameGizmoBtnFill = { value: new Color(NAME_GIZMO_BTN_FILL_COLOR) };
    shader.uniforms.uNameGizmoBtnFillActive = { value: new Color(NAME_GIZMO_BTN_ACTIVE_COLOR) };
    shader.uniforms.uNameGizmoIconColor = { value: new Color(NAME_GIZMO_ICON_COLOR) };
    shader.uniforms.uTestoMask = { value: emptyPrint };
    shader.uniforms.uTestoStampSize = { value: new Vector2(1, 1) };
    shader.uniforms.uTestoAnchorUv = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector2()) };
    shader.uniforms.uTestoRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoPlacementRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoUploadRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoPartRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoScale = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 1) };
    shader.uniforms.uTestoSlotActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoPartBounds = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector4(0, 0, 1, 1)) };
    shader.uniforms.uTestoTextColors = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Color('#000000')) };
    shader.uniforms.uTestoStrokeColors = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Color('#ffffff')) };
    shader.uniforms.uTestoGizmoEnabled = { value: 0 };
    shader.uniforms.uTestoGizmoFrameActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoGizmoButtonsActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoGizmoButtonsReveal = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uTestoGizmoHalf = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector2(0, 0)) };
    shader.uniforms.uTestoLineHeight = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 1) };
    shader.uniforms.uNumberMask = { value: emptyPrint };
    shader.uniforms.uNumberStampSize = { value: new Vector2(1, 1) };
    shader.uniforms.uNumberAnchorUv = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector2()) };
    shader.uniforms.uNumberRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberPlacementRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberUploadRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberPartRotation = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberScale = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 1) };
    shader.uniforms.uNumberLineHeight = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 1) };
    shader.uniforms.uNumberSlotActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberPartBounds = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector4(0, 0, 1, 1)) };
    shader.uniforms.uNumberTextColors = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Color('#000000')) };
    shader.uniforms.uNumberStrokeColors = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Color('#ffffff')) };
    shader.uniforms.uNumberGizmoEnabled = { value: 0 };
    shader.uniforms.uNumberGizmoFrameActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberGizmoButtonsActive = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberGizmoButtonsReveal = { value: Array.from({ length: NAME_SLOT_COUNT }, () => 0) };
    shader.uniforms.uNumberGizmoHalf = { value: Array.from({ length: NAME_SLOT_COUNT }, () => new Vector2(0, 0)) };
    shader.uniforms.uLogoStamp = { value: emptyPrint };
    shader.uniforms.uLogoStampCellSize = { value: new Vector2(1, 1) };
    shader.uniforms.uLogoAnchorUv = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => new Vector2()) };
    shader.uniforms.uLogoRotation = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 0) };
    shader.uniforms.uLogoUploadRotation = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 0) };
    shader.uniforms.uLogoPartRotation = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 0) };
    shader.uniforms.uLogoScale = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 1) };
    shader.uniforms.uLogoSlotActive = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 0) };
    shader.uniforms.uLogoPartBounds = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => new Vector4(0, 0, 1, 1)) };
    shader.uniforms.uLogoGizmoEnabled = { value: 0 };
    shader.uniforms.uLogoGizmoFrameActive = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 0) };
    shader.uniforms.uLogoGizmoButtonsActive = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 0) };
    shader.uniforms.uLogoGizmoButtonsReveal = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => 0) };
    shader.uniforms.uLogoGizmoHalf = { value: Array.from({ length: LOGO_SLOT_COUNT }, () => new Vector2(0, 0)) };
    shader.uniforms.uPatternMask0 = { value: printState?.patternMasks[0] ?? emptyPrint };
    shader.uniforms.uPatternMask1 = { value: printState?.patternMasks[1] ?? emptyPrint };
    shader.uniforms.uPatternColor0 = { value: new Color(printState?.patternColors[0] ?? '#000000') };
    shader.uniforms.uPatternColor1 = { value: new Color(printState?.patternColors[1] ?? '#000000') };
    shader.uniforms.uPatternOpacity = { value: printState?.patternOpacity ?? 1 };

    material.userData.uDefaultLogosUniform = shader.uniforms.uDefaultLogos;
    material.userData.uPrintAtlasSizeUniform = shader.uniforms.uPrintAtlasSize;
    material.userData.uGizmoRotationUniform = shader.uniforms.uGizmoRotation;
    material.userData.uNameMaskUniform = shader.uniforms.uNameMask;
    material.userData.uNameStampSizeUniform = shader.uniforms.uNameStampSize;
    material.userData.uNameAnchorUvUniform = shader.uniforms.uNameAnchorUv;
    material.userData.uNameRotationUniform = shader.uniforms.uNameRotation;
    material.userData.uNamePlacementRotationUniform = shader.uniforms.uNamePlacementRotation;
    material.userData.uNameUploadRotationUniform = shader.uniforms.uNameUploadRotation;
    material.userData.uNamePartRotationUniform = shader.uniforms.uNamePartRotation;
    material.userData.uNameScaleUniform = shader.uniforms.uNameScale;
    material.userData.uNameSlotActiveUniform = shader.uniforms.uNameSlotActive;
    material.userData.uNamePartBoundsUniform = shader.uniforms.uNamePartBounds;
    material.userData.uNameTextColorsUniform = shader.uniforms.uNameTextColors;
    material.userData.uNameStrokeColorsUniform = shader.uniforms.uNameStrokeColors;
    material.userData.uNameGizmoEnabledUniform = shader.uniforms.uNameGizmoEnabled;
    material.userData.uNameGizmoFrameActiveUniform = shader.uniforms.uNameGizmoFrameActive;
    material.userData.uNameGizmoButtonsActiveUniform = shader.uniforms.uNameGizmoButtonsActive;
    material.userData.uNameGizmoButtonsRevealUniform = shader.uniforms.uNameGizmoButtonsReveal;
    material.userData.uNameGizmoHalfUniform = shader.uniforms.uNameGizmoHalf;
    material.userData.uNameGizmoIconsUniform = shader.uniforms.uNameGizmoIcons;
    material.userData.uNameGizmoHoverSlotUniform = shader.uniforms.uNameGizmoHoverSlot;
    material.userData.uNameGizmoHoverCornerUniform = shader.uniforms.uNameGizmoHoverCorner;
    material.userData.uNameGizmoHoverScaleUniform = shader.uniforms.uNameGizmoHoverScale;
    material.userData.uTestoMaskUniform = shader.uniforms.uTestoMask;
    material.userData.uTestoStampSizeUniform = shader.uniforms.uTestoStampSize;
    material.userData.uTestoAnchorUvUniform = shader.uniforms.uTestoAnchorUv;
    material.userData.uTestoRotationUniform = shader.uniforms.uTestoRotation;
    material.userData.uTestoPlacementRotationUniform = shader.uniforms.uTestoPlacementRotation;
    material.userData.uTestoUploadRotationUniform = shader.uniforms.uTestoUploadRotation;
    material.userData.uTestoPartRotationUniform = shader.uniforms.uTestoPartRotation;
    material.userData.uTestoScaleUniform = shader.uniforms.uTestoScale;
    material.userData.uTestoSlotActiveUniform = shader.uniforms.uTestoSlotActive;
    material.userData.uTestoPartBoundsUniform = shader.uniforms.uTestoPartBounds;
    material.userData.uTestoTextColorsUniform = shader.uniforms.uTestoTextColors;
    material.userData.uTestoStrokeColorsUniform = shader.uniforms.uTestoStrokeColors;
    material.userData.uTestoGizmoEnabledUniform = shader.uniforms.uTestoGizmoEnabled;
    material.userData.uTestoGizmoFrameActiveUniform = shader.uniforms.uTestoGizmoFrameActive;
    material.userData.uTestoGizmoButtonsActiveUniform = shader.uniforms.uTestoGizmoButtonsActive;
    material.userData.uTestoGizmoButtonsRevealUniform = shader.uniforms.uTestoGizmoButtonsReveal;
    material.userData.uTestoGizmoHalfUniform = shader.uniforms.uTestoGizmoHalf;
    material.userData.uTestoLineHeightUniform = shader.uniforms.uTestoLineHeight;
    material.userData.uNumberMaskUniform = shader.uniforms.uNumberMask;
    material.userData.uNumberStampSizeUniform = shader.uniforms.uNumberStampSize;
    material.userData.uNumberAnchorUvUniform = shader.uniforms.uNumberAnchorUv;
    material.userData.uNumberRotationUniform = shader.uniforms.uNumberRotation;
    material.userData.uNumberPlacementRotationUniform = shader.uniforms.uNumberPlacementRotation;
    material.userData.uNumberUploadRotationUniform = shader.uniforms.uNumberUploadRotation;
    material.userData.uNumberPartRotationUniform = shader.uniforms.uNumberPartRotation;
    material.userData.uNumberScaleUniform = shader.uniforms.uNumberScale;
    material.userData.uNumberLineHeightUniform = shader.uniforms.uNumberLineHeight;
    material.userData.uNumberSlotActiveUniform = shader.uniforms.uNumberSlotActive;
    material.userData.uNumberPartBoundsUniform = shader.uniforms.uNumberPartBounds;
    material.userData.uNumberTextColorsUniform = shader.uniforms.uNumberTextColors;
    material.userData.uNumberStrokeColorsUniform = shader.uniforms.uNumberStrokeColors;
    material.userData.uNumberGizmoEnabledUniform = shader.uniforms.uNumberGizmoEnabled;
    material.userData.uNumberGizmoFrameActiveUniform = shader.uniforms.uNumberGizmoFrameActive;
    material.userData.uNumberGizmoButtonsActiveUniform = shader.uniforms.uNumberGizmoButtonsActive;
    material.userData.uNumberGizmoButtonsRevealUniform = shader.uniforms.uNumberGizmoButtonsReveal;
    material.userData.uNumberGizmoHalfUniform = shader.uniforms.uNumberGizmoHalf;
    material.userData.uLogoStampUniform = shader.uniforms.uLogoStamp;
    material.userData.uLogoStampCellSizeUniform = shader.uniforms.uLogoStampCellSize;
    material.userData.uLogoAnchorUvUniform = shader.uniforms.uLogoAnchorUv;
    material.userData.uLogoRotationUniform = shader.uniforms.uLogoRotation;
    material.userData.uLogoUploadRotationUniform = shader.uniforms.uLogoUploadRotation;
    material.userData.uLogoPartRotationUniform = shader.uniforms.uLogoPartRotation;
    material.userData.uLogoScaleUniform = shader.uniforms.uLogoScale;
    material.userData.uLogoSlotActiveUniform = shader.uniforms.uLogoSlotActive;
    material.userData.uLogoPartBoundsUniform = shader.uniforms.uLogoPartBounds;
    material.userData.uLogoGizmoEnabledUniform = shader.uniforms.uLogoGizmoEnabled;
    material.userData.uLogoGizmoFrameActiveUniform = shader.uniforms.uLogoGizmoFrameActive;
    material.userData.uLogoGizmoButtonsActiveUniform = shader.uniforms.uLogoGizmoButtonsActive;
    material.userData.uLogoGizmoButtonsRevealUniform = shader.uniforms.uLogoGizmoButtonsReveal;
    material.userData.uLogoGizmoHalfUniform = shader.uniforms.uLogoGizmoHalf;
    material.userData.uPatternMask0Uniform = shader.uniforms.uPatternMask0;
    material.userData.uPatternMask1Uniform = shader.uniforms.uPatternMask1;
    material.userData.uPatternColor0Uniform = shader.uniforms.uPatternColor0;
    material.userData.uPatternColor1Uniform = shader.uniforms.uPatternColor1;
    material.userData.uPatternOpacityUniform = shader.uniforms.uPatternOpacity;

    hydrateGarmentNameUniforms(material, {
      uNameMask: shader.uniforms.uNameMask,
      uNameStampSize: shader.uniforms.uNameStampSize,
      uNameAnchorUv: shader.uniforms.uNameAnchorUv,
      uNameRotation: shader.uniforms.uNameRotation,
      uNamePlacementRotation: shader.uniforms.uNamePlacementRotation,
      uNameUploadRotation: shader.uniforms.uNameUploadRotation,
      uNamePartRotation: shader.uniforms.uNamePartRotation,
      uNameScale: shader.uniforms.uNameScale,
      uNameSlotActive: shader.uniforms.uNameSlotActive,
      uNamePartBounds: shader.uniforms.uNamePartBounds,
      uNameTextColors: shader.uniforms.uNameTextColors,
      uNameStrokeColors: shader.uniforms.uNameStrokeColors,
      uNameGizmoEnabled: shader.uniforms.uNameGizmoEnabled,
      uNameGizmoHalf: shader.uniforms.uNameGizmoHalf,
      uNameGizmoIcons: shader.uniforms.uNameGizmoIcons,
    });

    hydrateGarmentTestoUniforms(material, {
      uTestoMask: shader.uniforms.uTestoMask,
      uTestoStampSize: shader.uniforms.uTestoStampSize,
      uTestoAnchorUv: shader.uniforms.uTestoAnchorUv,
      uTestoRotation: shader.uniforms.uTestoRotation,
      uTestoPlacementRotation: shader.uniforms.uTestoPlacementRotation,
      uTestoUploadRotation: shader.uniforms.uTestoUploadRotation,
      uTestoPartRotation: shader.uniforms.uTestoPartRotation,
      uTestoScale: shader.uniforms.uTestoScale,
      uTestoSlotActive: shader.uniforms.uTestoSlotActive,
      uTestoPartBounds: shader.uniforms.uTestoPartBounds,
      uTestoTextColors: shader.uniforms.uTestoTextColors,
      uTestoStrokeColors: shader.uniforms.uTestoStrokeColors,
      uTestoGizmoEnabled: shader.uniforms.uTestoGizmoEnabled,
      uTestoGizmoHalf: shader.uniforms.uTestoGizmoHalf,
      uTestoLineHeight: shader.uniforms.uTestoLineHeight,
    });

    hydrateGarmentNumberUniforms(material, {
      uNumberMask: shader.uniforms.uNumberMask,
      uNumberStampSize: shader.uniforms.uNumberStampSize,
      uNumberAnchorUv: shader.uniforms.uNumberAnchorUv,
      uNumberRotation: shader.uniforms.uNumberRotation,
      uNumberPlacementRotation: shader.uniforms.uNumberPlacementRotation,
      uNumberUploadRotation: shader.uniforms.uNumberUploadRotation,
      uNumberPartRotation: shader.uniforms.uNumberPartRotation,
      uNumberScale: shader.uniforms.uNumberScale,
      uNumberLineHeight: shader.uniforms.uNumberLineHeight,
      uNumberSlotActive: shader.uniforms.uNumberSlotActive,
      uNumberPartBounds: shader.uniforms.uNumberPartBounds,
      uNumberTextColors: shader.uniforms.uNumberTextColors,
      uNumberStrokeColors: shader.uniforms.uNumberStrokeColors,
      uNumberGizmoEnabled: shader.uniforms.uNumberGizmoEnabled,
      uNumberGizmoHalf: shader.uniforms.uNumberGizmoHalf,
    });

    hydrateGarmentLogoUniforms(material, {
      uLogoStamp: shader.uniforms.uLogoStamp,
      uLogoStampCellSize: shader.uniforms.uLogoStampCellSize,
      uLogoAnchorUv: shader.uniforms.uLogoAnchorUv,
      uLogoRotation: shader.uniforms.uLogoRotation,
      uLogoUploadRotation: shader.uniforms.uLogoUploadRotation,
      uLogoPartRotation: shader.uniforms.uLogoPartRotation,
      uLogoScale: shader.uniforms.uLogoScale,
      uLogoSlotActive: shader.uniforms.uLogoSlotActive,
      uLogoPartBounds: shader.uniforms.uLogoPartBounds,
      uLogoGizmoEnabled: shader.uniforms.uLogoGizmoEnabled,
      uLogoGizmoHalf: shader.uniforms.uLogoGizmoHalf,
    });

    shader.vertexShader = shader.vertexShader.replace('#include <uv_pars_vertex>', garmentVertexUvPars).replace('#include <uv_vertex>', garmentVertexUv);

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <uv_pars_fragment>', garmentFragmentUvPars)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${garmentGradientMapFragment}\n${garmentPrintMapFragment}`)
      .replace('#include <normal_fragment_maps>', garmentNormalFragment)
      .replace('#include <roughnessmap_fragment>', garmentRoughnessFragment)
      .replace('#include <tonemapping_fragment>', `#include <tonemapping_fragment>\n${garmentPrintLightsFragment}\n${garmentGizmoLightsFragment}`);
  };

  material.customProgramCacheKey = () => GARMENT_SHADER_VERSION;
};

const createGarmentMaterial = (
  pbrMaps: pbrMapsType | null,
  source: MeshStandardMaterial | null | undefined,
  pbrUvChannel: 0 | 1 = 1,
): MeshStandardMaterial => {
  const material = source ? source.clone() : new MeshStandardMaterial({ color: 0xffffff });

  if (pbrMaps) {
    applyPbrMaps(material, pbrMaps, pbrUvChannel);
  } else {
    applyGarmentPrintBase(material);
    material.userData.pbrUvChannel = pbrUvChannel;
  }

  material.userData.garmentShaderMode = 'bootstrap';
  material.needsUpdate = true;

  return material;
};

const upgradeGarmentMaterialShader = (material: MeshStandardMaterial) => {
  const isCurrentVersion = material.userData.garmentShaderVersion === GARMENT_SHADER_VERSION;
  if (material.userData.garmentShaderMode === 'full' && isCurrentVersion) return;

  material.userData.garmentShaderConfigured = false;
  configureGarmentShader(material);
  material.userData.garmentShaderMode = 'full';
  material.userData.garmentShaderVersion = GARMENT_SHADER_VERSION;
  material.needsUpdate = true;
};

export { GARMENT_SHADER_VERSION, createGarmentMaterial, upgradeGarmentMaterialShader };
