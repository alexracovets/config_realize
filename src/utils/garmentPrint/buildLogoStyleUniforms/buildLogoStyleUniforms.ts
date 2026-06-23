import type { garmentPartConfigType, logoInstanceType, logoSlotBounds4Type, logoSlotFloat4Type, logoSlotVec2Type, logoStyleUniformsType } from '@types';
import { FULL_UV_BOUNDS, LOGO_SLOT_COUNT } from '@constants';
import { resolveLogoDisplayScale } from '../../composeLogoAtlas/composeLogoPrintAtlas';
import { resolvePartPrintRotation, resolvePartUvBounds } from '../../resolveProductRenderConfig/resolveProductRenderConfig';

const DEFAULT_PART_BOUNDS = FULL_UV_BOUNDS;

const buildLogoStyleUniforms = (
  instances: logoInstanceType[],
  parts: garmentPartConfigType[],
  meshPartId: string,
  stampCellSize: { width: number; height: number },
  atlasWidth: number,
  atlasHeight: number,
): logoStyleUniformsType => {
  const partsById = Object.fromEntries(parts.map((part) => [part.id, part]));
  const anchorUv: logoSlotVec2Type = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  const rotation: logoSlotFloat4Type = [0, 0, 0, 0];
  const uploadRotation: logoSlotFloat4Type = [0, 0, 0, 0];
  const partRotation: logoSlotFloat4Type = [0, 0, 0, 0];
  const scale: logoSlotFloat4Type = [1, 1, 1, 1];
  const slotActive: logoSlotFloat4Type = [0, 0, 0, 0];
  const partBounds: logoSlotBounds4Type = [{ ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }];

  instances.slice(0, LOGO_SLOT_COUNT).forEach((instance, index) => {
    if (instance.partId !== meshPartId) return;

    const part = partsById[instance.partId];
    const bounds = part ? resolvePartUvBounds(part) : DEFAULT_PART_BOUNDS;
    const naturalWidth = instance.naturalWidth || 1;
    const naturalHeight = instance.naturalHeight || 1;

    slotActive[index] = 1;
    anchorUv[index] = instance.uv;
    rotation[index] = (instance.rotation * Math.PI) / 180;
    uploadRotation[index] = ((instance.uploadRotation ?? 0) * Math.PI) / 180;
    partRotation[index] = part ? (resolvePartPrintRotation(part) * Math.PI) / 180 : 0;
    scale[index] = resolveLogoDisplayScale(instance, naturalWidth, naturalHeight, atlasWidth, atlasHeight);
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
    slotActive,
    partBounds,
  };
};

export { buildLogoStyleUniforms };
