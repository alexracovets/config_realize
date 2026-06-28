import type { nameSlotFloat4Type, nameStyleUniformsType, stampPixelSizeType } from '@configurator/types';
import type { garmentPartConfigType, garmentTextRenderInstanceType } from '@types';
import { NAME_SLOT_COUNT } from '@configurator/constants';
import { buildNameStyleUniforms } from '@configurator/utils';
const DEFAULT_LINE_HEIGHT = 1.5;

type lineHeightTextInstanceType = garmentTextRenderInstanceType & { lineHeight: number };

const buildLineHeightStyleUniforms = (
  instances: lineHeightTextInstanceType[],
  parts: garmentPartConfigType[],
  stampSize: stampPixelSizeType,
  meshPartId: string,
): nameStyleUniformsType => {
  const base = buildNameStyleUniforms(instances, parts, stampSize, meshPartId);
  const lineHeight: nameSlotFloat4Type = [1, 1, 1, 1];

  instances.slice(0, NAME_SLOT_COUNT).forEach((instance, index) => {
    if (instance.partId !== meshPartId) return;
    lineHeight[index] = instance.lineHeight ?? DEFAULT_LINE_HEIGHT;
  });

  return { ...base, lineHeight };
};

export { buildLineHeightStyleUniforms, DEFAULT_LINE_HEIGHT };
