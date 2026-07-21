import type { garmentPrintStateType } from '@configurator/types';
import {
  garmentFragmentUvPars,
  garmentGizmoLightsFragment,
  garmentGradientMapFragment,
  garmentPbrShadeCaptureFragment,
  garmentPrintLightsFragment,
  garmentPrintMapFragment,
} from '@configurator/shaders';
import {
  applyGarmentPrintBase,
  bindGarmentPrintShaderUniforms,
  type GarmentGradientState,
  type garmentPrintFeatureFlagsType,
  getEmptyPrintTexture,
} from '@configurator/utils';
import { MeshStandardMaterial, Vector4 } from 'three';
const GARMENT_SHADER_VERSION = 'garment-print-v93-gated-looped-slots';

const garmentPrintFragmentPars = garmentFragmentUvPars.replace('#include <uv_pars_fragment>\n', '');

const buildGarmentFeatureDefines = (features: garmentPrintFeatureFlagsType): string =>
  [
    features.useName && '#define USE_GARMENT_NAME',
    features.useNumber && '#define USE_GARMENT_NUMBER',
    features.useLogo && '#define USE_GARMENT_LOGO',
    features.useTesto && '#define USE_GARMENT_TESTO',
    (features.useName || features.useNumber || features.useLogo || features.useTesto) && '#define USE_GARMENT_TEXT',
  ]
    .filter(Boolean)
    .join('\n');

const buildGarmentFeatureCacheKey = (features: garmentPrintFeatureFlagsType): string =>
  [features.useName, features.useNumber, features.useLogo, features.useTesto].map((flag) => (flag ? '1' : '0')).join('');

const buildGarmentProgramCacheKey = (material: MeshStandardMaterial) => {
  const channelKey = [
    material.normalMap?.channel ?? -1,
    material.aoMap?.channel ?? -1,
    material.roughnessMap?.channel ?? -1,
    material.metalnessMap?.channel ?? -1,
  ].join(',');

  const features = material.userData.garmentPrintFeatureFlags as garmentPrintFeatureFlagsType | undefined;
  const featureKey = features ? buildGarmentFeatureCacheKey(features) : 'none';

  return `${GARMENT_SHADER_VERSION}:${channelKey}:${featureKey}`;
};

const appendGarmentPrintShaderChunks = (shader: { vertexShader: string; fragmentShader: string }, features: garmentPrintFeatureFlagsType) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <uv_pars_vertex>', `#include <uv_pars_vertex>\nvarying vec2 vPrintUv;`)
    .replace('#include <uv_vertex>', `#include <uv_vertex>\nvPrintUv = uv;`);

  const featureDefines = buildGarmentFeatureDefines(features);

  shader.fragmentShader = shader.fragmentShader
    .replace('#include <uv_pars_fragment>', `#include <uv_pars_fragment>\n${featureDefines}\n${garmentPrintFragmentPars}`)
    .replace('#include <map_fragment>', `#include <map_fragment>\n${garmentGradientMapFragment}\n${garmentPrintMapFragment}`)
    .replace('#include <opaque_fragment>', `${garmentPbrShadeCaptureFragment}\n#include <opaque_fragment>`)
    .replace('#include <tonemapping_fragment>', `${garmentPrintLightsFragment}\n#include <tonemapping_fragment>\n${garmentGizmoLightsFragment}`);
};

const configureGarmentShader = (material: MeshStandardMaterial, features: garmentPrintFeatureFlagsType) => {
  if (material.userData.garmentShaderConfigured) return;

  material.userData.garmentShaderConfigured = true;
  material.userData.garmentPrintFeatureFlags = features;

  const emptyPrint = getEmptyPrintTexture();
  material.userData.uPartUvBounds = material.userData.uPartUvBounds ?? new Vector4(0, 0, 1, 1);

  material.onBeforeCompile = (shader) => {
    const printState = material.userData.garmentPrintState as garmentPrintStateType | undefined;
    const gradient = material.userData.garmentGradient as GarmentGradientState | undefined;

    bindGarmentPrintShaderUniforms(material, shader, { printState, gradient, emptyPrint });
    appendGarmentPrintShaderChunks(shader, features);
  };

  material.customProgramCacheKey = () => buildGarmentProgramCacheKey(material);
};

const createGarmentMaterial = (source: MeshStandardMaterial | null | undefined): MeshStandardMaterial => {
  const material = source ? source.clone() : new MeshStandardMaterial({ color: 0xffffff });

  applyGarmentPrintBase(material);
  material.userData.garmentShaderMode = 'bootstrap';

  return material;
};

const compileGarmentShader = (material: MeshStandardMaterial, features: garmentPrintFeatureFlagsType) => {
  const isCurrentVersion = material.userData.garmentShaderVersion === GARMENT_SHADER_VERSION;
  const featuresChanged = buildGarmentFeatureCacheKey(features) !== buildGarmentFeatureCacheKey(material.userData.garmentPrintFeatureFlags ?? {});
  if (material.userData.garmentShaderMode === 'full' && isCurrentVersion && !featuresChanged) return;

  material.userData.garmentShaderConfigured = false;
  configureGarmentShader(material, features);
  material.userData.garmentShaderMode = 'full';
  material.userData.garmentShaderVersion = GARMENT_SHADER_VERSION;
  material.needsUpdate = true;
};

export { GARMENT_SHADER_VERSION, compileGarmentShader, createGarmentMaterial };
