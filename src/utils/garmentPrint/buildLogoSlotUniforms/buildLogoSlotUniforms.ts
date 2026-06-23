import type { garmentPartConfigType, logoInstanceType, logoSlotBounds4Type, logoSlotFloat4Type, logoSlotUniformsType, logoSlotVec2Type } from '@types';
import { FULL_UV_BOUNDS, LOGO_SLOT_COUNT } from '@constants';
import { resolvePartUvBounds } from '../../resolveProductRenderConfig/resolveProductRenderConfig';

const DEFAULT_PART_BOUNDS = FULL_UV_BOUNDS;

const buildLogoSlotUniforms = (instances: logoInstanceType[], parts: garmentPartConfigType[], meshPartId: string): logoSlotUniformsType => {
  const partsById = Object.fromEntries(parts.map((part) => [part.id, part]));
  const anchorUv: logoSlotVec2Type = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  const slotActive: logoSlotFloat4Type = [0, 0, 0, 0];
  const partBounds: logoSlotBounds4Type = [{ ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }, { ...DEFAULT_PART_BOUNDS }];

  instances.slice(0, LOGO_SLOT_COUNT).forEach((instance, index) => {
    if (instance.partId !== meshPartId) return;

    const bounds = partsById[instance.partId] ? resolvePartUvBounds(partsById[instance.partId]) : DEFAULT_PART_BOUNDS;

    slotActive[index] = 1;
    anchorUv[index] = instance.uv;
    partBounds[index] = bounds;
  });

  return { anchorUv, slotActive, partBounds };
};

export { buildLogoSlotUniforms };
