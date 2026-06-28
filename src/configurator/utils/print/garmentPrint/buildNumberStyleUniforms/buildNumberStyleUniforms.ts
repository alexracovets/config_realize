import type { nameStyleUniformsType, stampPixelSizeType } from '@configurator/types';
import type { garmentPartConfigType, numberInstanceType } from '@types';
import { buildLineHeightStyleUniforms } from '@configurator/utils';
const buildNumberStyleUniforms = (
  instances: numberInstanceType[],
  parts: garmentPartConfigType[],
  stampSize: stampPixelSizeType,
  meshPartId: string,
): nameStyleUniformsType => buildLineHeightStyleUniforms(instances, parts, stampSize, meshPartId);

export { buildNumberStyleUniforms };
