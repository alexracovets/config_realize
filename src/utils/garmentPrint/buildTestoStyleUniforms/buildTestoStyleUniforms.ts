import type { garmentPartConfigType, nameStyleUniformsType, stampPixelSizeType, testoInstanceType } from '@types';

import { buildLineHeightStyleUniforms } from '../buildLineHeightStyleUniforms';

const buildTestoStyleUniforms = (
  instances: testoInstanceType[],
  parts: garmentPartConfigType[],
  stampSize: stampPixelSizeType,
  meshPartId: string,
): nameStyleUniformsType => buildLineHeightStyleUniforms(instances, parts, stampSize, meshPartId);

export { buildTestoStyleUniforms };
