import type { Texture } from 'three';

import type { stampPixelSizeType } from '@configurator/types';
import type { garmentTextRenderInstanceType } from '@types';
import { packStackedTextMaskTexture } from '@configurator/utils';

const DEFAULT_STAMP_SIZE: stampPixelSizeType = { width: 1, height: 1 };

const buildFillSignature = (instances: garmentTextRenderInstanceType[]) =>
  JSON.stringify(
    instances.map((instance) => ({
      text: instance.text,
      font: instance.font,
      ...('letterSpacing' in instance ? { letterSpacing: instance.letterSpacing } : {}),
    })),
  );

const buildStrokeSignature = (instances: garmentTextRenderInstanceType[]) =>
  JSON.stringify(
    instances.map((instance) => ({
      text: instance.text,
      font: instance.font,
      strokeWidth: instance.strokeWidth,
      fontSize: instance.fontSize,
      ...('letterSpacing' in instance ? { letterSpacing: instance.letterSpacing } : {}),
    })),
  );

const buildStyleSignature = (instances: garmentTextRenderInstanceType[]) =>
  JSON.stringify(
    instances.map((instance) => ({
      textColor: instance.textColor,
      strokeColor: instance.strokeColor,
      fontSize: instance.fontSize,
      uv: instance.uv,
      rotation: instance.rotation,
      partId: instance.partId,
      ...('lineHeight' in instance ? { lineHeight: instance.lineHeight } : {}),
    })),
  );

const stampSizeChanged = (previous: stampPixelSizeType, next: stampPixelSizeType) => previous.width !== next.width || previous.height !== next.height;

interface MaskResourceRefs {
  fillCanvasRef: { current: HTMLCanvasElement | null };
  strokeCanvasRef: { current: HTMLCanvasElement | null };
  stackedCanvasRef: { current: HTMLCanvasElement | null };
  stackedTextureRef: { current: Texture | null };
  stampSizeRef: { current: stampPixelSizeType };
}

const ensureMaskResources = (stampSize: stampPixelSizeType, refs: MaskResourceRefs) => {
  if (!refs.fillCanvasRef.current) {
    refs.fillCanvasRef.current = document.createElement('canvas');
  }

  if (!refs.strokeCanvasRef.current) {
    refs.strokeCanvasRef.current = document.createElement('canvas');
  }

  if (!refs.stackedCanvasRef.current) {
    refs.stackedCanvasRef.current = document.createElement('canvas');
    refs.stackedTextureRef.current = packStackedTextMaskTexture(refs.fillCanvasRef.current, refs.strokeCanvasRef.current, refs.stackedCanvasRef.current);
  }

  if (!stampSizeChanged(refs.stampSizeRef.current, stampSize)) return;

  refs.fillCanvasRef.current.width = stampSize.width;
  refs.fillCanvasRef.current.height = stampSize.height;
  refs.strokeCanvasRef.current.width = stampSize.width;
  refs.strokeCanvasRef.current.height = stampSize.height;
  refs.stackedTextureRef.current?.dispose();
  refs.stackedCanvasRef.current = document.createElement('canvas');
  refs.stackedTextureRef.current = packStackedTextMaskTexture(refs.fillCanvasRef.current, refs.strokeCanvasRef.current, refs.stackedCanvasRef.current);
  refs.stampSizeRef.current = stampSize;
};

const clearMaskRuntime = (refs: MaskResourceRefs, prevFillSignatureRef: { current: string }) => {
  refs.stackedTextureRef.current?.dispose();
  refs.stackedTextureRef.current = null;
  refs.fillCanvasRef.current = null;
  refs.strokeCanvasRef.current = null;
  refs.stackedCanvasRef.current = null;
  refs.stampSizeRef.current = DEFAULT_STAMP_SIZE;
  prevFillSignatureRef.current = '';
};

export { DEFAULT_STAMP_SIZE, buildFillSignature, buildStrokeSignature, buildStyleSignature, clearMaskRuntime, ensureMaskResources };
export type { MaskResourceRefs };
