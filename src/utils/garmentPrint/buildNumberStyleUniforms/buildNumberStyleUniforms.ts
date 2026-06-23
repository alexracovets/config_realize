import type { garmentPartConfigType, nameStyleUniformsType, numberInstanceType, stampPixelSizeType } from '@types';

import { buildLineHeightStyleUniforms } from '../buildLineHeightStyleUniforms';

const buildNumberStyleUniforms = (
  instances: numberInstanceType[],
  parts: garmentPartConfigType[],
  stampSize: stampPixelSizeType,
  meshPartId: string,
): nameStyleUniformsType => buildLineHeightStyleUniforms(instances, parts, stampSize, meshPartId);

export { buildNumberStyleUniforms };
