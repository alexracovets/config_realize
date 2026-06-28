import type { buildNameGizmoElementsInputType, printGizmoElementType } from '@configurator/types';
import { NAME_REFERENCE_FONT_SIZE, NAME_SLOT_COUNT } from '@configurator/constants';
import {
  measureNameGizmoHalf,
  resolveGizmoElementRotationDeg,
  resolvePartPrintRotation,
  resolveProductGizmoRotation,
  resolveTextGizmoHalf,
} from '@configurator/utils';

const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const measureCtx = measureCanvas?.getContext('2d') ?? null;

const buildNameGizmoElements = ({ product, instances, fontSizeMin, fontSizeMax }: buildNameGizmoElementsInputType): printGizmoElementType[] => {
  const partsById = Object.fromEntries(product.parts.map((part) => [part.id, part]));
  const gizmoRotation = resolveProductGizmoRotation(product);

  return instances.flatMap((instance) => {
    if (!instance.showGizmo || !instance.text.trim()) return [];

    const slotIndex = instances.slice(0, NAME_SLOT_COUNT).findIndex((item) => item.id === instance.id);
    if (slotIndex < 0) return [];

    const part = partsById[instance.partId];
    if (!part) return [];

    const rawHalf = measureCtx ? measureNameGizmoHalf(instance.text, instance.font, measureCtx) : null;
    if (!rawHalf) return [];

    const half = resolveTextGizmoHalf(rawHalf, instance, gizmoRotation);

    return [
      {
        kind: 'name' as const,
        id: instance.id,
        partId: instance.partId,
        slotIndex,
        meshNames: part.meshNames,
        uv: instance.uv,
        rotation: resolveGizmoElementRotationDeg(product, instance.rotation),
        gizmoRotation,
        partRotation: resolvePartPrintRotation(part),
        half,
        scale: instance.fontSize / NAME_REFERENCE_FONT_SIZE,
        fontSize: instance.fontSize,
        fontSizeMin,
        fontSizeMax,
      },
    ];
  });
};

export { buildNameGizmoElements };
