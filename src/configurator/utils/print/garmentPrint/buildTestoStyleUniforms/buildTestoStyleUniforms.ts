import type { nameStyleUniformsType, stampPixelSizeType } from '@configurator/types';
import type { garmentPartConfigType, testoInstanceType } from '@types';
import { buildLineHeightStyleUniforms } from '@configurator/utils';
const buildTestoStyleUniforms = (
  instances: testoInstanceType[],
  parts: garmentPartConfigType[],
  stampSize: stampPixelSizeType,
  meshPartId: string,
): nameStyleUniformsType => buildLineHeightStyleUniforms(instances, parts, stampSize, meshPartId);

export { buildTestoStyleUniforms };
