import type { logoInstanceType } from '@types';
import { LOGO_ATLAS_REF_HEIGHT, LOGO_ATLAS_REF_WIDTH, LOGO_MARK_REF_WIDTH } from '@constants';
import { loadCachedImage } from '../../loadCachedImage/loadCachedImage';

interface ComposeLogoPrintAtlasInput {
  instances: logoInstanceType[];
  canvas: HTMLCanvasElement;
  atlasWidth: number;
  atlasHeight: number;
}

const resolveLogoDrawSize = (instance: logoInstanceType, naturalWidth: number, naturalHeight: number, atlasWidth: number, _atlasHeight: number) => {
  const aspect = naturalWidth / naturalHeight || 1;
  const scale = instance.scale;
  const baseWidth = Math.round((LOGO_MARK_REF_WIDTH / LOGO_ATLAS_REF_WIDTH) * atlasWidth) * scale;

  return { width: baseWidth, height: baseWidth / aspect };
};

// High-resolution stamp space (like NAME_REFERENCE_FONT_SIZE for text). Decoupled from the runtime print atlas.
const resolveLogoReferenceDrawSize = (instance: logoInstanceType, naturalWidth: number, naturalHeight: number) =>
  resolveLogoDrawSize({ ...instance, scale: 1 }, naturalWidth, naturalHeight, LOGO_ATLAS_REF_WIDTH, LOGO_ATLAS_REF_HEIGHT);

const resolveLogoDisplayScale = (instance: logoInstanceType, naturalWidth: number, naturalHeight: number, atlasWidth: number, atlasHeight: number) => {
  const display = resolveLogoDrawSize(instance, naturalWidth, naturalHeight, atlasWidth, atlasHeight);
  const reference = resolveLogoReferenceDrawSize(instance, naturalWidth, naturalHeight);
  return display.width / Math.max(reference.width, 1);
};

const resolveRotatedGizmoHalf = (half: { x: number; y: number }, contentRotationDeg: number) => {
  const rad = (contentRotationDeg * Math.PI) / 180;
  const cosA = Math.abs(Math.cos(rad));
  const sinA = Math.abs(Math.sin(rad));
  return {
    x: half.x * cosA + half.y * sinA,
    y: half.x * sinA + half.y * cosA,
  };
};

const resolveLogoGizmoHalf = (width: number, height: number, contentRotationDeg: number) =>
  resolveRotatedGizmoHalf({ x: width / 2, y: height / 2 }, contentRotationDeg);

const drawLogoInstance = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, instance: logoInstanceType, atlasWidth: number, atlasHeight: number) => {
  const naturalWidth = instance.naturalWidth || image.naturalWidth;
  const naturalHeight = instance.naturalHeight || image.naturalHeight;
  const { width, height } = resolveLogoDrawSize(instance, naturalWidth, naturalHeight, atlasWidth, atlasHeight);
  const centerX = instance.uv.x * atlasWidth;
  const centerY = instance.uv.y * atlasHeight;

  ctx.save();
  ctx.globalAlpha = instance.opacity;
  ctx.globalCompositeOperation = 'source-over';
  ctx.translate(centerX, centerY);
  ctx.rotate((instance.rotation * Math.PI) / 180);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
};

const composeLogoPrintAtlas = async ({ instances, canvas, atlasWidth, atlasHeight }: ComposeLogoPrintAtlasInput) => {
  canvas.width = atlasWidth;
  canvas.height = atlasHeight;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, atlasWidth, atlasHeight);

  const activeInstances = instances.filter((instance) => instance.src.trim());

  for (const instance of activeInstances) {
    try {
      const image = await loadCachedImage(instance.src);
      drawLogoInstance(ctx, image, instance, atlasWidth, atlasHeight);
    } catch {
      // Skip missing or broken logo assets without breaking the whole layer.
    }
  }
};

export { composeLogoPrintAtlas, resolveLogoDisplayScale, resolveLogoDrawSize, resolveLogoGizmoHalf, resolveLogoReferenceDrawSize, resolveRotatedGizmoHalf };
