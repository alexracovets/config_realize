import type { garmentPrintStateType, patternColorPairType, patternMaskPairType } from '@configurator/types';
import { PATTERN_LAYER_COUNT } from '@configurator/constants';
import { getEmptyPrintTexture } from '@configurator/utils';
import { Color, type MeshStandardMaterial, type Texture } from 'three';

const emptyMaskPair = (): patternMaskPairType => {
  const empty = getEmptyPrintTexture();
  return [empty, empty, empty];
};

const applyGarmentPrint = (material: MeshStandardMaterial, state: garmentPrintStateType) => {
  material.userData.garmentPrintState = state;

  const logosUniform = material.userData.uDefaultLogosUniform as { value: Texture } | undefined;
  if (logosUniform) logosUniform.value = state.defaultLogos;

  for (let layerIndex = 0; layerIndex < PATTERN_LAYER_COUNT; layerIndex += 1) {
    const maskUniform = material.userData[`uPatternMask${layerIndex}Uniform`] as { value: Texture } | undefined;
    if (maskUniform) maskUniform.value = state.patternMasks[layerIndex];
  }

  applyGarmentPatternTints(material, state.patternColors, state.patternOpacity);
};

const applyGarmentPatternTints = (material: MeshStandardMaterial, patternColors: patternColorPairType, patternOpacity: number) => {
  const state = material.userData.garmentPrintState as garmentPrintStateType | undefined;
  if (state) {
    material.userData.garmentPrintState = { ...state, patternColors, patternOpacity };
  }

  for (let layerIndex = 0; layerIndex < PATTERN_LAYER_COUNT; layerIndex += 1) {
    const colorUniform = material.userData[`uPatternColor${layerIndex}Uniform`] as { value: Color } | undefined;
    if (colorUniform) colorUniform.value.set(patternColors[layerIndex]);
  }

  const opacityUniform = material.userData.uPatternOpacityUniform as { value: number } | undefined;
  if (opacityUniform) opacityUniform.value = patternOpacity;
};

export { applyGarmentPatternTints, applyGarmentPrint, emptyMaskPair };
