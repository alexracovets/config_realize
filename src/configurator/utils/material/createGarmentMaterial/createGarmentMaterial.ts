import type { garmentPrintStateType } from '@configurator/types';
import {
  garmentFragmentUvPars,
  garmentGizmoLightsFragment,
  garmentGradientMapFragment,
  garmentPbrShadeCaptureFragment,
  garmentPrintLightsFragment,
  garmentPrintMapFragment,
} from '@configurator/shaders';
import { applyGarmentPrintBase, bindGarmentPrintShaderUniforms, type GarmentGradientState, getEmptyPrintTexture } from '@configurator/utils';
import { MeshStandardMaterial, Vector4 } from 'three';
const GARMENT_SHADER_VERSION = 'garment-print-v91-diffuse-shade-tonemap';

const garmentPrintFragmentPars = garmentFragmentUvPars.replace('#include <uv_pars_fragment>\n', '');

const buildGarmentProgramCacheKey = (material: MeshStandardMaterial) => {
  const channelKey = [
    material.normalMap?.channel ?? -1,
    material.aoMap?.channel ?? -1,
    material.roughnessMap?.channel ?? -1,
    material.metalnessMap?.channel ?? -1,
  ].join(',');

  return `${GARMENT_SHADER_VERSION}:${channelKey}`;
};

const appendGarmentPrintShaderChunks = (shader: { vertexShader: string; fragmentShader: string }) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <uv_pars_vertex>', `#include <uv_pars_vertex>\nvarying vec2 vPrintUv;`)
    .replace('#include <uv_vertex>', `#include <uv_vertex>\nvPrintUv = uv;`);

  shader.fragmentShader = shader.fragmentShader
    .replace('#include <uv_pars_fragment>', `#include <uv_pars_fragment>\n${garmentPrintFragmentPars}`)
    .replace('#include <map_fragment>', `#include <map_fragment>\n${garmentGradientMapFragment}\n${garmentPrintMapFragment}`)
    .replace('#include <opaque_fragment>', `${garmentPbrShadeCaptureFragment}\n#include <opaque_fragment>`)
    .replace('#include <tonemapping_fragment>', `${garmentPrintLightsFragment}\n#include <tonemapping_fragment>\n${garmentGizmoLightsFragment}`);
};

const configureGarmentShader = (material: MeshStandardMaterial) => {
  if (material.userData.garmentShaderConfigured) return;

  material.userData.garmentShaderConfigured = true;

  const emptyPrint = getEmptyPrintTexture();
  material.userData.uPartUvBounds = material.userData.uPartUvBounds ?? new Vector4(0, 0, 1, 1);

  material.onBeforeCompile = (shader) => {
    const printState = material.userData.garmentPrintState as garmentPrintStateType | undefined;
    const gradient = material.userData.garmentGradient as GarmentGradientState | undefined;

    bindGarmentPrintShaderUniforms(material, shader, { printState, gradient, emptyPrint });
    appendGarmentPrintShaderChunks(shader);
  };

  material.customProgramCacheKey = () => buildGarmentProgramCacheKey(material);
};

/** Clone GLTF material — native PBR maps stay intact; print shader added on upgrade. */
const createGarmentMaterial = (source: MeshStandardMaterial | null | undefined): MeshStandardMaterial => {
  const material = source ? source.clone() : new MeshStandardMaterial({ color: 0xffffff });

  applyGarmentPrintBase(material);
  material.userData.garmentShaderMode = 'bootstrap';

  return material;
};

const compileGarmentShader = (material: MeshStandardMaterial) => {
  const isCurrentVersion = material.userData.garmentShaderVersion === GARMENT_SHADER_VERSION;
  if (material.userData.garmentShaderMode === 'full' && isCurrentVersion) return;

  material.userData.garmentShaderConfigured = false;
  configureGarmentShader(material);
  material.userData.garmentShaderMode = 'full';
  material.userData.garmentShaderVersion = GARMENT_SHADER_VERSION;
  material.needsUpdate = true;
};

export { GARMENT_SHADER_VERSION, compileGarmentShader, createGarmentMaterial };
