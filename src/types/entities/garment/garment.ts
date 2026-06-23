import type { configuratorStepValueType } from '../../configurator';

interface uvPointType {
  x: number;
  y: number;
}

interface uvBoundsType {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface printAtlasConfigType {
  width: number;
  height: number;
}

interface partGradientConfigType {
  reversed: boolean;
  rotation: number;
  position: number;
  softness: number;
  opacity: number;
}

interface garmentPartConfigType {
  id: string;
  name: string;
  label: string;
  meshNames: string[];
  renderOrder?: number;
  uvBounds?: uvBoundsType;
  printRotation?: number;
  gradient?: partGradientConfigType;
  /** Solid color only — excluded from design, gradient, and pattern layers. */
  colorOnly?: boolean;
}

interface patternPartConfigType {
  path_name: string;
}

interface patternConfigType {
  name: string;
  parts: patternPartConfigType[];
}

interface textPositionConfigType {
  label: string;
  uv: uvPointType;
  rotation: number;
  fontSize: number;
  line_height?: number;
  letter_spacing?: number;
  interactive?: boolean;
  show_frame?: boolean;
  show_gizmo?: boolean;
}

interface textDefaultsConfigType {
  text: string;
  font: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  maxLength?: number;
  fontSizeMin?: number;
  fontSizeMax?: number;
  strokeWidthMax?: number;
  lineHeight?: number;
  lineHeightMin?: number;
  lineHeightMax?: number;
  line_height_show?: boolean;
  letterSpacing?: number;
  letterSpacingMin?: number;
  letterSpacingMax?: number;
  letter_spacing_show?: boolean;
}

interface namePositionConfigType extends textPositionConfigType {
  partId: string;
}

interface numberPositionConfigType extends textPositionConfigType {
  partId: string;
}

interface logoPositionConfigType {
  label: string;
  uv: uvPointType;
  src?: string;
  rotation: number;
  scale: number;
  partId?: string;
  default?: boolean;
  interactive?: boolean;
  show_frame?: boolean;
  show_gizmo?: boolean;
}

interface garmentPbrTexturesConfigType {
  bakeNormal: string;
  bakeAoRoughness: string;
  fabricNormal: string;
  fabricRoughness: string;
}

interface garmentStaticMeshConfigType {
  meshNames: string[];
  renderOrder?: number;
}

interface garmentConfigType {
  /** Geometry id — matches the data folder name and the Shopify `custom.id` metafield. */
  id?: string;
  /** @deprecated Business data (name/price/bonus) now comes from Shopify via `garmentBusinessType`. */
  name?: string;
  type?: string;
  previewImage?: string;
  /** @deprecated Use the Shopify-sourced `garmentBusinessType.price`. Optional for geometry-only JSON. */
  price?: number;
  bonus_count?: number;
  bonus_discount?: number;
  minimum_count?: number;
  path: string;
  modelFile?: string;
  pbrTextures?: garmentPbrTexturesConfigType;
  parts: garmentPartConfigType[];
  staticMeshes?: garmentStaticMeshConfigType[];
  preserveGltfMeshes?: string[];
  printAtlas?: printAtlasConfigType;
  partTextureSize?: number;
  gizmoRotation?: number;
  hiddenSteps?: configuratorStepValueType[];
  patterns: patternConfigType[];
  default_pattern?: patternConfigType[];
  nameDefaults?: textDefaultsConfigType;
  namePositions?: namePositionConfigType[];
  numberDefaults?: textDefaultsConfigType;
  numberPositions?: numberPositionConfigType[];
  testoDefaults?: textDefaultsConfigType;
  testoPositions?: namePositionConfigType[];
  logoPositions?: logoPositionConfigType[];
}

interface styleConfigType {
  id: string;
  products: garmentConfigType[];
}

/** Identifier of a local geometry model — equals the data folder name / JSON `id`. */
type modelIdType = string;

/** Business data sourced from the Shopify product (price, bonuses, name). */
interface garmentBusinessType {
  /** Shopify product GID. */
  shopifyProductId: string;
  /** Shopify product handle (== URL slug). */
  handle: string;
  name: string;
  price: number;
  currencyCode: string;
  bonusCount: number;
  bonusDiscount: number;
  minimumCount: number;
}

export type {
  garmentBusinessType,
  garmentConfigType,
  garmentPbrTexturesConfigType,
  garmentPartConfigType,
  logoPositionConfigType,
  modelIdType,
  partGradientConfigType,
  patternConfigType,
  printAtlasConfigType,
  styleConfigType,
  textDefaultsConfigType,
  textPositionConfigType,
  uvBoundsType,
  uvPointType,
};
