import type { gizmoFrameStateType, logoInstanceType } from '@types';
import { LOGO_SLOT_COUNT, LOGO_UPLOAD_ROTATION_DEG } from '@constants';
import { resolveLogoGizmoHalf, resolveLogoReferenceDrawSize } from '../../composeLogoAtlas/composeLogoPrintAtlas';

const buildLogoGizmoFrameUniforms = (instances: logoInstanceType[], meshPartId: string, enabled: boolean, gizmoRotationDeg = 0): gizmoFrameStateType => {
  const half = Array.from({ length: LOGO_SLOT_COUNT }, () => ({ x: 0, y: 0 }));
  const frameActive = Array.from({ length: LOGO_SLOT_COUNT }, () => 0);
  const gizmoActive = Array.from({ length: LOGO_SLOT_COUNT }, () => 0);

  instances.slice(0, LOGO_SLOT_COUNT).forEach((instance, index) => {
    if (instance.partId !== meshPartId) return;

    frameActive[index] = instance.showFrame ? 1 : 0;
    gizmoActive[index] = instance.showGizmo ? 1 : 0;

    const naturalWidth = instance.naturalWidth || 1;
    const naturalHeight = instance.naturalHeight || 1;
    const { width, height } = resolveLogoReferenceDrawSize(instance, naturalWidth, naturalHeight);

    half[index] = resolveLogoGizmoHalf(width, height, instance.rotation + LOGO_UPLOAD_ROTATION_DEG - gizmoRotationDeg);
  });

  return { enabled: enabled ? 1 : 0, half, frameActive, gizmoActive };
};

export { buildLogoGizmoFrameUniforms };
