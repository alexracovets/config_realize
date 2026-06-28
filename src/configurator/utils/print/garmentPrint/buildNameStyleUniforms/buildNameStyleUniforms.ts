import type {
  nameSlotBounds4Type,
  nameSlotColor4Type,
  nameSlotFloat4Type,
  nameSlotVec2Type,
  nameStyleUniformsType,
  stampPixelSizeType,
} from '@configurator/types';
import type { garmentPartConfigType, garmentTextRenderInstanceType } from '@types';
import { FULL_UV_BOUNDS, NAME_REFERENCE_FONT_SIZE, NAME_SLOT_COUNT, PRINT_UPLOAD_ROTATION_DEG } from '@configurator/constants';
import { resolvePartUvBounds } from '@configurator/mappers';
import { resolvePartPrintRotation } from '@configurator/utils';
const DEFAULT_NAME_COLOR = '#000000';
const DEFAULT_NAME_STROKE = '#ffffff';
const DEFAULT_STAMP_SIZE: stampPixelSizeType = { width: 1, height: 1 };
const DEFAULT_PART_BOUNDS = FULL_UV_BOUNDS;

const buildNameStyleUniforms = (
  instances: garmentTextRenderInstanceType[],
  parts: garmentPartConfigType[],
  stampSize: stampPixelSizeType,
  meshPartId: string,
): nameStyleUniformsType => {
  const partsById = Object.fromEntries(parts.map((part) => [part.id, part]));
  const anchorUv: nameSlotVec2Type = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  const rotation: nameSlotFloat4Type = [0, 0, 0, 0];
  const placementRotation: nameSlotFloat4Type = [0, 0, 0, 0];
  const uploadRotation: nameSlotFloat4Type = [0, 0, 0, 0];
  const uploadRotationRad = (PRINT_UPLOAD_ROTATION_DEG * Math.PI) / 180;
  const partRotation: nameSlotFloat4Type = [0, 0, 0, 0];
  const scale: nameSlotFloat4Type = [1, 1, 1, 1];
  const slotActive: nameSlotFloat4Type = [0, 0, 0, 0];
  const partBounds: nameSlotBounds4Type = [{ ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }];
  const textColors: nameSlotColor4Type = [DEFAULT_NAME_COLOR, DEFAULT_NAME_COLOR, DEFAULT_NAME_COLOR, DEFAULT_NAME_COLOR];
  const strokeColors: nameSlotColor4Type = [DEFAULT_NAME_STROKE, DEFAULT_NAME_STROKE, DEFAULT_NAME_STROKE, DEFAULT_NAME_STROKE];

  instances.slice(0, NAME_SLOT_COUNT).forEach((instance, index) => {
    if (instance.partId !== meshPartId) return;

    const part = partsById[instance.partId];
    const bounds = part ? resolvePartUvBounds(part) : DEFAULT_PART_BOUNDS;

    slotActive[index] = 1;
    anchorUv[index] = instance.uv;
    if (instance.placementRotation !== undefined) {
      rotation[index] = (instance.rotation * Math.PI) / 180;
      placementRotation[index] = (instance.placementRotation * Math.PI) / 180;
    } else {
      rotation[index] = 0;
      placementRotation[index] = (instance.rotation * Math.PI) / 180;
    }
    uploadRotation[index] = uploadRotationRad;
    partRotation[index] = part ? (resolvePartPrintRotation(part) * Math.PI) / 180 : 0;
    scale[index] = instance.fontSize / NAME_REFERENCE_FONT_SIZE;
    partBounds[index] = bounds;
    textColors[index] = instance.textColor;
    strokeColors[index] = instance.strokeColor;
  });

  return {
    stampSize: stampSize.width > 0 && stampSize.height > 0 ? stampSize : DEFAULT_STAMP_SIZE,
    anchorUv,
    rotation,
    placementRotation,
    uploadRotation,
    partRotation,
    scale,
    slotActive,
    partBounds,
    textColors,
    strokeColors,
  };
};

export { buildNameStyleUniforms };
