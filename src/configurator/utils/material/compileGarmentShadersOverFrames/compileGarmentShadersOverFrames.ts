import type { garmentConfigType } from '@types';
import type { Camera, MeshStandardMaterial, Object3D, WebGLRenderer } from 'three';
import { compileGarmentShader, resolveGarmentPrintFeatureFlags } from '@configurator/utils';
import { RGBAFormat, SRGBColorSpace, WebGLRenderTarget } from 'three';

type CompileGarmentShadersOverFramesOptions = {
  product: garmentConfigType;
  parts: garmentConfigType['parts'];
  getMaterials: (partId: string) => readonly MeshStandardMaterial[];
  gl: WebGLRenderer;
  scene: Object3D;
  camera: Camera;
  invalidate: () => void;
  onComplete: () => void;
};

let variantWarmupTarget: WebGLRenderTarget | null = null;

const COMPILE_ASYNC_TIMEOUT_MS = 3000;

const compileWithFallback = (gl: WebGLRenderer, scene: Object3D, camera: Camera): Promise<void> => {
  let settled = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const asyncCompile = gl
    .compileAsync(scene, camera)
    .then(() => undefined)
    .catch(() => {
      if (!settled) gl.compile(scene, camera);
    })
    .finally(() => {
      settled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    });

  const timeoutFallback = new Promise<void>((resolve) => {
    timeoutId = setTimeout(() => {
      settled = true;
      gl.compile(scene, camera);
      resolve();
    }, COMPILE_ASYNC_TIMEOUT_MS);
  });

  return Promise.race([asyncCompile, timeoutFallback]);
};

const compileRenderTargetVariants = (gl: WebGLRenderer, scene: Object3D, camera: Camera): Promise<unknown> => {
  if (!variantWarmupTarget) {
    variantWarmupTarget = new WebGLRenderTarget(4, 4, { format: RGBAFormat, depthBuffer: true, stencilBuffer: false });
    variantWarmupTarget.texture.colorSpace = SRGBColorSpace;
  }

  const previousTarget = gl.getRenderTarget();
  gl.setRenderTarget(variantWarmupTarget);

  const warmup = compileWithFallback(gl, scene, camera);
  gl.setRenderTarget(previousTarget);

  return warmup;
};

const compileGarmentShadersOverFrames = ({
  product,
  parts,
  getMaterials,
  gl,
  scene,
  camera,
  invalidate,
  onComplete,
}: CompileGarmentShadersOverFramesOptions) => {
  const materialQueue = [...new Set(parts.flatMap((part) => [...getMaterials(part.id)]))];

  if (materialQueue.length === 0) {
    onComplete();
    return () => {};
  }

  let cancelled = false;

  materialQueue.forEach((material) => {
    const capacity = material.userData.garmentLogoSlotCapacity as number | undefined;
    const features = capacity ? resolveGarmentPrintFeatureFlags(product, capacity) : resolveGarmentPrintFeatureFlags(product);
    compileGarmentShader(material, features);
    material.userData.garmentLogoSlotCapacity = features.logoSlotCount;
  });

  void compileWithFallback(gl, scene, camera)
    .then(() => {
      if (cancelled) return;
      return compileRenderTargetVariants(gl, scene, camera);
    })
    .catch(() => {})
    .then(() => {
      if (cancelled) return;
      invalidate();
      onComplete();
    });

  return () => {
    cancelled = true;
  };
};

export { compileGarmentShadersOverFrames };
