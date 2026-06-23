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
  resolveNameLimits,
  useGarmentName,
} from './useGarmentName';
export {
  createNumberInstance,
  resolveNumberDefaults,
  resolveNumberInstancesForRender,
  resolveNumberLimits,
  resolveNumberLineHeightShow,
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
  resolveTestoLimits,
  resolveTestoLineHeightShow,
  useGarmentTesto,
} from './useGarmentTesto';
export { resolveLogoInstancesForRender, useGarmentLogo } from './useGarmentLogo';
export { useInfoDialog } from './useInfoDialog';
export { useTutorialDialog } from './useTutorialDialog';
export { resolveCheckoutPrintAvailability, useCheckout } from './useCheckout';
