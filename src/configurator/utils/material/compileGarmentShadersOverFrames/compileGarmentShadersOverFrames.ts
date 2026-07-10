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

/**
 * three.js compiles a SECOND program variant per material when rendering into a render target
 * (tone mapping / output-colorspace defines differ from the canvas variant). The cart preview
 * capture renders into one, so without warming, its first run after the loader closes blocked
 * the main thread (~1.4s of getProgramParameter link-waits, confirmed by profiling). A tiny RT
 * with the same SRGB colorSpace as the capture target produces the same program defines, so
 * compiling against it here — while the loader is still up — pre-links those variants.
 */
let variantWarmupTarget: WebGLRenderTarget | null = null;

const compileRenderTargetVariants = (gl: WebGLRenderer, scene: Object3D, camera: Camera): Promise<unknown> => {
  if (!variantWarmupTarget) {
    variantWarmupTarget = new WebGLRenderTarget(4, 4, { format: RGBAFormat, depthBuffer: true, stencilBuffer: false });
    variantWarmupTarget.texture.colorSpace = SRGBColorSpace;
  }

  const previousTarget = gl.getRenderTarget();
  gl.setRenderTarget(variantWarmupTarget);
  // compileAsync resolves program parameters synchronously (against the bound target) and only
  // polls link readiness asynchronously — restoring the target right after the call is safe.
  const warmup = gl.compileAsync(scene, camera);
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
  const features = resolveGarmentPrintFeatureFlags(product);

  materialQueue.forEach((material) => compileGarmentShader(material, features));

  void gl
    .compileAsync(scene, camera)
    .then(() => {
      if (cancelled) return;
      return compileRenderTargetVariants(gl, scene, camera);
    })
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
