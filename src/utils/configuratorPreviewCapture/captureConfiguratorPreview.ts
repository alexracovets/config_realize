import type { Camera, ColorSpace, Scene, WebGLRenderer } from 'three';
import { LinearFilter, PerspectiveCamera, RGBAFormat, SRGBColorSpace, Vector3, WebGLRenderTarget } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { resolveGarmentCenter } from '../orbitCamera';

const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 128;
const PREVIEW_CAMERA_OFFSET = new Vector3(0, 0.05, 0.78);

interface captureConfiguratorPreviewInput {
  gl: WebGLRenderer;
  scene: Scene;
  camera: Camera;
  controls?: OrbitControlsImpl | null;
}

let previewRenderTarget: WebGLRenderTarget | null = null;
let previewReadBuffer: Uint8Array | null = null;

const getPreviewRenderTarget = (outputColorSpace: ColorSpace) => {
  if (!previewRenderTarget) {
    previewRenderTarget = new WebGLRenderTarget(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      format: RGBAFormat,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
    });
  }

  previewRenderTarget.texture.colorSpace = outputColorSpace;

  return previewRenderTarget;
};

const applyThumbnailCamera = (scene: Scene, camera: Camera) => {
  const center = new Vector3();
  if (!resolveGarmentCenter(scene, center)) return false;

  camera.position.copy(center).add(PREVIEW_CAMERA_OFFSET);
  camera.lookAt(center);

  if (camera instanceof PerspectiveCamera) {
    camera.aspect = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;
    camera.updateProjectionMatrix();
  }

  return true;
};

const pixelsToDataUrl = (pixels: Uint8Array, width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return null;

  const imageData = context.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y += 1) {
    const srcRowStart = (height - 1 - y) * width * 4;
    const dstRowStart = y * width * 4;
    data.set(pixels.subarray(srcRowStart, srcRowStart + width * 4), dstRowStart);
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/webp', 0.92);
};

const captureConfiguratorPreview = ({ gl, scene, camera }: captureConfiguratorPreviewInput) => {
  scene.updateMatrixWorld(true);

  const previewCamera = camera.clone();
  if (!applyThumbnailCamera(scene, previewCamera)) return null;

  const renderTarget = getPreviewRenderTarget(SRGBColorSpace);
  const previousTarget = gl.getRenderTarget();
  const previousAutoClear = gl.autoClear;
  const pixelCount = THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT * 4;

  if (!previewReadBuffer || previewReadBuffer.length !== pixelCount) {
    previewReadBuffer = new Uint8Array(pixelCount);
  }

  gl.autoClear = true;
  gl.setRenderTarget(renderTarget);
  gl.clear();
  gl.render(scene, previewCamera);
  gl.readRenderTargetPixels(renderTarget, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, previewReadBuffer);

  gl.setRenderTarget(previousTarget);
  gl.autoClear = previousAutoClear;

  return pixelsToDataUrl(previewReadBuffer, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
};

export { captureConfiguratorPreview };
