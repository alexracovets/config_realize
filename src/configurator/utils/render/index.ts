export {
  getAppearanceCacheVersion,
  isGarmentAppearanceCached,
  readProductAppearanceTextures,
  syncProductAppearanceTextures,
} from './garmentAppearance/garmentProductAppearanceCache';
export { applyGarmentGradient, applyGarmentPartUvBounds } from './garmentGradient/applyGarmentGradient';
export type { garmentGradientPartRefType, garmentGradientWorldFrameType } from './garmentGradient/resolveGarmentGradientWorldFrame';
export {
  evaluateGarmentGradientMask,
  evaluateGarmentGradientUvT,
  evaluateGarmentGradientWorldT,
  isSleeveGarmentPart,
  resolveGarmentGradientDir,
  resolveGarmentGradientWorldFrame,
  resolveGarmentPartGradientFrame,
} from './garmentGradient/resolveGarmentGradientWorldFrame';
export {
  clampUvToPartBounds,
  isColorOnlyGarmentPart,
  isUvInsidePartBounds,
  repairPrintInstancePlacement,
  resolveGizmoElementRotationDeg,
  resolvePartPrintRotation,
  resolvePartTextureSize,
  resolvePrintAtlasSize,
  resolveProductGizmoRotation,
} from './resolveProductRenderConfig';
export type { garmentPartHorizonFacingType } from './orbitCamera';
export {
  ORBIT_SURFACE_CLEARANCE,
  ORBIT_MIN_DISTANCE,
  ORBIT_MAX_DISTANCE,
  applyCardinalHorizonDirection,
  applyPartHorizonDirection,
  applyFrontOrBackHorizonDirection,
  applyOrbitZoomAroundPoint,
  clampOrbitCameraOutsideGarment,
  clampOrbitTargetToGarment,
  recenterOrbitTargetByZoom,
  resolveCursorFocusPoint,
  resolveGarmentCenter,
  resolveGarmentPartHorizonFacing,
  resolveOrbitFocusPose,
  resolveShortestAngleDelta,
  snapOrbitToLevelFrontOrBack,
} from './orbitCamera';
export type { resolvePrintUvWorldPointInputType, resolvePrintUvWorldPointResultType } from './resolvePrintUvWorldPoint';
export { resolvePrintUvWorldPoint } from './resolvePrintUvWorldPoint';
export { suppressThreeClockDeprecation } from '@configurator/bootstrap/clientConsoleSuppression/suppressThreeClockDeprecation';
