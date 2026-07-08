export {
  getAppearanceCacheVersion,
  isGarmentAppearanceCached,
  readProductAppearanceTextures,
  syncProductAppearanceTextures,
} from './garmentAppearance/garmentProductAppearanceCache';
export { applyGarmentGradient, applyGarmentPartUvBounds } from './garmentGradient/applyGarmentGradient';
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
export {
  ORBIT_SURFACE_CLEARANCE,
  applyOrbitZoomAroundPoint,
  clampOrbitCameraOutsideGarment,
  clampOrbitTargetToGarment,
  recenterOrbitTargetByZoom,
  resolveCursorFocusPoint,
  resolveGarmentCenter,
  resolveOrbitFocusPose,
  resolveShortestAngleDelta,
} from './orbitCamera';
export type { resolvePrintUvWorldPointInputType, resolvePrintUvWorldPointResultType } from './resolvePrintUvWorldPoint';
export { resolvePrintUvWorldPoint } from './resolvePrintUvWorldPoint';
export { suppressThreeClockDeprecation } from '@configurator/bootstrap/clientConsoleSuppression/suppressThreeClockDeprecation';
