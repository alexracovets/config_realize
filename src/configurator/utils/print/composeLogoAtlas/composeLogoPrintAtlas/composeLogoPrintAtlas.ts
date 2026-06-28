import type { logoInstanceType } from '@types';
import { LOGO_ATLAS_REF_WIDTH, LOGO_MARK_REF_WIDTH } from '@configurator/constants';

const resolveLogoDrawSize = (instance: logoInstanceType, naturalWidth: number, naturalHeight: number, atlasWidth: number) => {
  const aspect = naturalWidth / naturalHeight || 1;
  const scale = instance.scale;
  const baseWidth = Math.round((LOGO_MARK_REF_WIDTH / LOGO_ATLAS_REF_WIDTH) * atlasWidth) * scale;

  return { width: baseWidth, height: baseWidth / aspect };
};

// High-resolution stamp space (like NAME_REFERENCE_FONT_SIZE for text). Decoupled from the runtime print atlas.
const resolveLogoReferenceDrawSize = (instance: logoInstanceType, naturalWidth: number, naturalHeight: number) =>
  resolveLogoDrawSize({ ...instance, scale: 1 }, naturalWidth, naturalHeight, LOGO_ATLAS_REF_WIDTH);

const resolveLogoDisplayScale = (instance: logoInstanceType, naturalWidth: number, naturalHeight: number, atlasWidth: number) => {
  const display = resolveLogoDrawSize(instance, naturalWidth, naturalHeight, atlasWidth);
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

export { resolveLogoDisplayScale, resolveLogoDrawSize, resolveLogoGizmoHalf, resolveLogoReferenceDrawSize, resolveRotatedGizmoHalf };
