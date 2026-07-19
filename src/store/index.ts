'use client';

export { useConfigurationControl } from './useConfigurationControl';
export {
  activateCartItem,
  applyGarmentConfiguration,
  captureGarmentConfiguration,
  areGarmentPrintStoresSynced,
  useConfigurationCart,
} from './useConfigurationCart';
export { useConfiguratorProduct } from './useConfiguratorProduct';
export { useConfiguratorSceneLoad } from './useConfiguratorSceneLoad';
export { buildDefaultGradients, DEFAULT_COLOR, DEFAULT_PART_GRADIENT, DISABLED_PART_GRADIENT, resolveGradientColors, useGarmentColor } from './useGarmentColor';
export { useGarmentDesign } from './useGarmentDesign';
export {
  createNameInstance,
  mapProductNamePositions,
  resolveInstancesForRender,
  resolveNameDefaults,
  resolveNamePositionLimits,
  useGarmentName,
} from './useGarmentName';
export {
  createNumberInstance,
  resolveNumberDefaults,
  resolveNumberInstancesForRender,
  resolveNumberLineHeightShow,
  resolveNumberPositionLimits,
  sanitizeNumberText,
  NUMBER_MAX_LENGTH,
  useGarmentNumber,
} from './useGarmentNumber';
export {
  createTestoInstance,
  mapProductTestoPositions,
  resolveTestoDefaults,
  resolveTestoInstancesForRender,
  resolveTestoLetterSpacingShow,
  resolveTestoLineHeightShow,
  resolveTestoPositionLimits,
  useGarmentTesto,
} from './useGarmentTesto';
export { resolveLogoInstancesForRender, useGarmentLogo } from './useGarmentLogo';
export { resolvePrintPositionConflicts } from './resolvePrintPositionConflicts';
export { useAddProductDesignDialog } from './useAddProductDesignDialog';
export { useInfoDialog } from './useInfoDialog';
export { useTutorialDialog } from './useTutorialDialog';
export { resolveCheckoutPrintAvailability, useCheckout } from './useCheckout';
