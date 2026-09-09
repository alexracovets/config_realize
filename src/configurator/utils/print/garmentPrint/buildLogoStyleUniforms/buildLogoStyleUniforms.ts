import type { logoSlotBounds4Type, logoSlotFloat4Type, logoSlotVec2Type, logoStyleUniformsType } from '@configurator/types';
import type { garmentPartConfigType, logoInstanceType } from '@types';
import { FULL_UV_BOUNDS, LOGO_UPLOAD_ROTATION_DEG } from '@configurator/constants';
import { resolvePartUvBounds } from '@configurator/mappers';
import {
  resolveLogoDisplayScale,
  resolveLogoShaderSlotCount,
  resolveLogoStampAtlasGrid,
  resolveLogoStampSlots,
  resolvePartPrintRotation,
} from '@configurator/utils';

const DEFAULT_PART_BOUNDS = FULL_UV_BOUNDS;

const buildLogoStyleUniforms = (
  instances: logoInstanceType[],
  parts: garmentPartConfigType[],
  meshPartId: string,
  stampCellSize: { width: number; height: number },
  atlasWidth: number,
  stampGrid = resolveLogoStampAtlasGrid(),
): logoStyleUniformsType => {
  const partsById = Object.fromEntries(parts.map((part) => [part.id, part]));
  const slotCount = resolveLogoShaderSlotCount(instances.length);
  const stampSlots = resolveLogoStampSlots(instances);
  const atlasCellCount = stampGrid > 0 ? stampGrid * stampGrid : Number.POSITIVE_INFINITY;
  const anchorUv: logoSlotVec2Type = Array.from({ length: slotCount }, () => ({ x: 0, y: 0 }));
  const rotation: logoSlotFloat4Type = Array.from({ length: slotCount }, () => 0);
  const uploadRotation: logoSlotFloat4Type = Array.from({ length: slotCount }, () => 0);
  const partRotation: logoSlotFloat4Type = Array.from({ length: slotCount }, () => 0);
  const scale: logoSlotFloat4Type = Array.from({ length: slotCount }, () => 1);
  const stampSlot: logoSlotFloat4Type = Array.from({ length: slotCount }, () => 0);
  const slotActive: logoSlotFloat4Type = Array.from({ length: slotCount }, () => 0);
  const partBounds: logoSlotBounds4Type = Array.from({ length: slotCount }, () => ({ ...DEFAULT_PART_BOUNDS }));

  instances.slice(0, slotCount).forEach((instance, index) => {
    const cell = stampSlots[index] ?? index;
    stampSlot[index] = cell;

    if (instance.partId !== meshPartId) return;
    if (cell >= atlasCellCount) return;

    const part = partsById[instance.partId];
    const bounds = part ? resolvePartUvBounds(part) : DEFAULT_PART_BOUNDS;
    const naturalWidth = instance.naturalWidth || 1;
    const naturalHeight = instance.naturalHeight || 1;

    slotActive[index] = 1;
    anchorUv[index] = instance.uv;
    rotation[index] = (instance.rotation * Math.PI) / 180;
    uploadRotation[index] = ((instance.uploadRotation ?? LOGO_UPLOAD_ROTATION_DEG) * Math.PI) / 180;
    partRotation[index] = part ? (resolvePartPrintRotation(part) * Math.PI) / 180 : 0;
    scale[index] = resolveLogoDisplayScale(instance, naturalWidth, naturalHeight, atlasWidth);
    partBounds[index] = bounds;
  });

  return {
    stampCellSize: {
      width: Math.max(stampCellSize.width, 1),
      height: Math.max(stampCellSize.height, 1),
    },
    anchorUv,
    rotation,
    uploadRotation,
    partRotation,
    scale,
    stampSlot,
    slotActive,
    partBounds,
  };
};

export { buildLogoStyleUniforms };
