'use client';

import {
  useGarmentNameTextPrintTextures,
  useGarmentNumberTextPrintTextures,
  useGarmentTestoTextPrintTextures,
} from '@configurator/hooks/useGarmentTextPrintTextures/useGarmentTextPrintTextures';
import { useGarmentTextGizmoUniforms } from '@configurator/hooks/useGarmentTextPrintTextures/useGarmentTextGizmoUniforms';
/** Syncs name, number, and testo print textures onto garment materials (R3F side-effect hook). */
const useGarmentTextPrintSync = () => {
  useGarmentNameTextPrintTextures();
  useGarmentNumberTextPrintTextures();
  useGarmentTestoTextPrintTextures();
  useGarmentTextGizmoUniforms();
};

export { useGarmentTextPrintSync as useGarmentTextPrintTextures };
