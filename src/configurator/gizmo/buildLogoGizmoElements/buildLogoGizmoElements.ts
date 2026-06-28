import type { buildLogoGizmoElementsInputType, printGizmoElementType } from '@configurator/types';

import { LOGO_SCALE_MAX, LOGO_SCALE_MIN, LOGO_SLOT_COUNT, LOGO_UPLOAD_ROTATION_DEG } from '@configurator/constants';
import {
  resolveGizmoElementRotationDeg,
  resolveLogoDisplayScale,
  resolveLogoGizmoHalf,
  resolveLogoReferenceDrawSize,
  resolvePartPrintRotation,
  resolvePrintAtlasSize,
  resolveProductGizmoRotation,
} from '@configurator/utils';

const buildLogoGizmoElements = ({ product, instances }: buildLogoGizmoElementsInputType): printGizmoElementType[] => {
  const partsById = Object.fromEntries(product.parts.map((part) => [part.id, part]));
  const atlasSize = resolvePrintAtlasSize(product);
  const gizmoRotation = resolveProductGizmoRotation(product);

  return instances.flatMap((instance) => {
    if (!instance.showGizmo || !instance.src.trim()) return [];

    const slotIndex = instances.slice(0, LOGO_SLOT_COUNT).findIndex((item) => item.id === instance.id);
    if (slotIndex < 0) return [];

    const part = partsById[instance.partId];
    if (!part) return [];

    const naturalWidth = instance.naturalWidth || 1;
    const naturalHeight = instance.naturalHeight || 1;
    const { width, height } = resolveLogoReferenceDrawSize(instance, naturalWidth, naturalHeight);

    const half = resolveLogoGizmoHalf(width, height, instance.rotation + LOGO_UPLOAD_ROTATION_DEG - gizmoRotation);

    return [
      {
        kind: 'logo' as const,
        id: instance.id,
        partId: instance.partId,
        slotIndex,
        meshNames: part.meshNames,
        uv: instance.uv,
        rotation: resolveGizmoElementRotationDeg(product, instance.rotation),
        gizmoRotation,
        partRotation: resolvePartPrintRotation(part),
        scale: resolveLogoDisplayScale(instance, naturalWidth, naturalHeight, atlasSize.width),
        half,
        scaleMin: LOGO_SCALE_MIN,
        scaleMax: LOGO_SCALE_MAX,
      },
    ];
  });
};

export { buildLogoGizmoElements };
