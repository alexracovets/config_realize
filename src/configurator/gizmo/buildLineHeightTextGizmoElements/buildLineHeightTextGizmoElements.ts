import type { printGizmoElementKindType, printGizmoElementType } from '@configurator/types';
import type { garmentConfigType, numberInstanceType, testoInstanceType } from '@types';
import { NAME_REFERENCE_FONT_SIZE, NAME_SLOT_COUNT } from '@configurator/constants';
import {
  measureNameGizmoHalf,
  resolveGizmoElementRotationDeg,
  resolvePartPrintRotation,
  resolveProductGizmoRotation,
  resolveTextGizmoHalf,
  resolveTextGizmoMeasureOptions,
} from '@configurator/utils';

const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const measureCtx = measureCanvas?.getContext('2d') ?? null;

interface BuildLineHeightTextGizmoElementsInput {
  kind: Extract<printGizmoElementKindType, 'number' | 'testo'>;
  product: garmentConfigType;
  instances: numberInstanceType[] | testoInstanceType[];
  fontSizeMin: number;
  fontSizeMax: number;
}

const buildLineHeightTextGizmoElements = ({
  kind,
  product,
  instances,
  fontSizeMin,
  fontSizeMax,
}: BuildLineHeightTextGizmoElementsInput): printGizmoElementType[] => {
  const partsById = Object.fromEntries(product.parts.map((part) => [part.id, part]));
  const gizmoRotation = resolveProductGizmoRotation(product);

  return instances.flatMap((instance) => {
    if (!instance.showGizmo || !instance.text.trim()) return [];

    const slotIndex = instances.slice(0, NAME_SLOT_COUNT).findIndex((item) => item.id === instance.id);
    if (slotIndex < 0) return [];

    const part = partsById[instance.partId];
    if (!part) return [];

    const rawHalf = measureCtx ? measureNameGizmoHalf(instance.text, instance.font, measureCtx, resolveTextGizmoMeasureOptions(instance)) : null;
    if (!rawHalf) return [];

    const half = resolveTextGizmoHalf(rawHalf, instance, gizmoRotation);

    return [
      {
        kind,
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

export { buildLineHeightTextGizmoElements };
