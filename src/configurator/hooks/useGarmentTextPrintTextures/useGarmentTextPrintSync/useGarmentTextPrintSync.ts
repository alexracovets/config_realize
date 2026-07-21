'use client';

import {
  useGarmentNameTextPrintTextures,
  useGarmentNumberTextPrintTextures,
  useGarmentTestoTextPrintTextures,
} from '@configurator/hooks/useGarmentTextPrintTextures/useGarmentTextPrintTextures';
import { useGarmentTextGizmoUniforms } from '@configurator/hooks/useGarmentTextPrintTextures/useGarmentTextGizmoUniforms';

const useGarmentTextPrintSync = () => {
  useGarmentNameTextPrintTextures();
  useGarmentNumberTextPrintTextures();
  useGarmentTestoTextPrintTextures();
  useGarmentTextGizmoUniforms();
};

export { useGarmentTextPrintSync as useGarmentTextPrintTextures };
