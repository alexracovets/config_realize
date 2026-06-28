export { resolvePartUvBounds, resolvePrintLocalUvToAtlas } from './printLayout';
export { resolveGarmentPart } from './resolveGarmentPart';
export { createNameInstance, mapProductNamePositions, resolveNameDefaults, resolveNameLimits } from './mapProductNames';
export {
  createNumberInstance,
  mapProductNumberPositions,
  resolveNumberDefaults,
  resolveNumberLimits,
  resolveNumberLineHeightShow,
  resolveNumberLocalUvToAtlas,
  sanitizeNumberText,
  NUMBER_DEFAULT_LINE_HEIGHT,
  NUMBER_MAX_LENGTH,
} from './mapProductNumbers';
export {
  createTestoInstance,
  mapProductTestoPositions,
  resolveTestoDefaults,
  resolveTestoLetterSpacingShow,
  resolveTestoLimits,
  resolveTestoLineHeightShow,
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
