import type { garmentTextRenderInstanceType, textCanvasDrawOptionsType } from '@types';

import { resolveRotatedGizmoHalf } from '../../composeLogoAtlas/composeLogoPrintAtlas';
import { PRINT_UPLOAD_ROTATION_DEG } from '@constants';

const resolveTextContentRotationDeg = (instance: garmentTextRenderInstanceType) => {
  const userRotationDeg = instance.placementRotation !== undefined ? instance.rotation + instance.placementRotation : instance.rotation;
  return userRotationDeg + PRINT_UPLOAD_ROTATION_DEG;
};

const resolveTextGizmoMeasureOptions = (instance: garmentTextRenderInstanceType): textCanvasDrawOptionsType & { lineHeight?: number } => ({
  letterSpacing: 'letterSpacing' in instance ? instance.letterSpacing : undefined,
  lineHeight: 'lineHeight' in instance ? instance.lineHeight : undefined,
});

const resolveGizmoContentRotationDeg = (contentRotationDeg: number, gizmoRotationDeg: number) => contentRotationDeg - gizmoRotationDeg;

const resolveTextGizmoHalf = (half: { x: number; y: number }, instance: garmentTextRenderInstanceType, gizmoRotationDeg = 0) =>
  resolveRotatedGizmoHalf(half, resolveGizmoContentRotationDeg(resolveTextContentRotationDeg(instance), gizmoRotationDeg));

export { resolveGizmoContentRotationDeg, resolveTextContentRotationDeg, resolveTextGizmoHalf, resolveTextGizmoMeasureOptions };
