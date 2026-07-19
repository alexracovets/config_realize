export { resolvePartCenterUv, resolvePartUvBounds, resolvePrintLocalUvToAtlas } from './printLayout';
export { resolveGarmentPart } from './resolveGarmentPart';
export {
  cmToPx,
  createPrintUnit,
  DEFAULT_PRINT_REFERENCE_CM,
  formatCm,
  formatPxAsCm,
  pxToCm,
  resolveCmLimitPx,
  resolvePrintCmScale,
} from './resolvePrintCmScale';
export type { printUnitType } from './resolvePrintCmScale';
export { resolveTextPrintPositionLimits, TEXT_PRINT_MIN_CM, TEXT_PRINT_UNBOUNDED_CM } from './resolveTextPrintLimits';
export type { textPrintStepLimitsType } from './resolveTextPrintLimits';
export { createNameInstance, mapProductNamePositions, resolveNameDefaults, resolveNamePositionLimits } from './mapProductNames';
export {
  createNumberInstance,
  mapProductNumberPositions,
  resolveNumberDefaults,
  resolveNumberLineHeightShow,
  resolveNumberLocalUvToAtlas,
  resolveNumberPositionLimits,
  sanitizeNumberText,
  NUMBER_DEFAULT_LINE_HEIGHT,
  NUMBER_MAX_LENGTH,
} from './mapProductNumbers';
export {
  createTestoInstance,
  mapProductTestoPositions,
  resolveTestoDefaults,
  resolveTestoLetterSpacingShow,
  resolveTestoLineHeightShow,
  resolveTestoPositionLimits,
  TESTO_DEFAULT_LETTER_SPACING,
  TESTO_DEFAULT_LINE_HEIGHT,
} from './mapProductTesto';
export {
  createDefaultLogoInstances,
  createDynamicUserLogoPosition,
  createLogoInstance,
  mapProductLogoPositions,
  resolveLogoDefaults,
  resolvePartIdForAtlasUv,
} from './mapProductLogos';
export { mapDefaultPattern, mapProductDesigns } from './mapProductDesigns';
export { normalizeDesignId, parseDesignIdFromPatternName, resolveDesignCardPreviewSrc, resolvePatternDesignId } from './resolveDesignCardPreviewSrc';
export {
  DEFAULT_GRADIENT_COLOR2,
  DEFAULT_PART_GRADIENT,
  DISABLED_PART_GRADIENT,
  buildDefaultGradients,
  mapPartGradientDefaults,
  resolveGradientColors,
} from './partGradient';
