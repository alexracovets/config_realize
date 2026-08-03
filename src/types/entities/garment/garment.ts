import type { configuratorStepValueType } from '@configurator/types';
import type { modalInfoTabType } from '@types';

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

interface printReferenceCmType {

  heightCm: number;

  widthCm: number;
}

interface printCmScaleType {
  cmPerPxHorizontal: number;
  cmPerPxVertical: number;
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

  colorOnly?: boolean;
  restrictedColors?: string[];
}

interface patternPartConfigType {
  path_name: string;
}

interface patternConfigType {
  name: string;
  designId?: string;
  parts: patternPartConfigType[];
}

interface printPositionConflictsConfigType {
  name?: string[];
  number?: string[];
  testo?: string[];

  text?: string[];
}

type printPositionRelationAxisXType = 'left' | 'center' | 'right';
type printPositionRelationAxisYType = 'top' | 'center' | 'bottom';

interface printPositionRelationItemsConfigType {
  name?: string[];
  number?: string[];
  testo?: string[];
}

interface printPositionRelationConfigType {
  x: printPositionRelationAxisXType;
  y: printPositionRelationAxisYType;
  items: printPositionRelationItemsConfigType;
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
  id?: string;
  conflicts?: printPositionConflictsConfigType;
  relation?: printPositionRelationConfigType;

  src?: string;
  heightMinCm?: number;
  heightMaxCm?: number;
  widthMinCm?: number;
  widthMaxCm?: number;
}

interface textDefaultsConfigType {
  text: string;
  font: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  maxLength?: number;
  strokeWidthMax?: number;
  strokeWidthMaxCm?: number;
  lineHeight?: number;
  lineHeightMin?: number;
  lineHeightMax?: number;
  line_height_show?: boolean;
  letterSpacing?: number;
  letterSpacingMin?: number;
  letterSpacingMax?: number;
  letterSpacingMinCm?: number;
  letterSpacingMaxCm?: number;
  letter_spacing_show?: boolean;

  title?: string;

  description?: string;
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

interface garmentStaticMeshConfigType {
  meshNames: string[];
  renderOrder?: number;
}

interface preserveGltfMeshEntryConfigType {
  meshName: string;
  renderOrder?: number;
}

type preserveGltfMeshConfigType = string | preserveGltfMeshEntryConfigType;

interface garmentConfigType {

  id?: string;

  name?: string;
  type?: string;
  previewImage?: string;

  price?: number;
  bonus_count?: number;
  bonus_discount?: number;
  minimum_count?: number;
  path: string;
  modelFile?: string;
  parts: garmentPartConfigType[];
  staticMeshes?: garmentStaticMeshConfigType[];
  preserveGltfMeshes?: preserveGltfMeshConfigType[];
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

type modelIdType = string;

interface garmentBusinessType {

  shopifyProductId: string;

  handle: string;
  name: string;
  price: number;
  currencyCode: string;
  bonusCount: number;
  bonusDiscount: number;
  minimumCount: number;

  sizeChart?: modalInfoTabType;

  printReferenceCm?: printReferenceCmType;
}

export type {
  garmentBusinessType,
  garmentConfigType,
  garmentPartConfigType,
  logoPositionConfigType,
  modelIdType,
  partGradientConfigType,
  patternConfigType,
  printPositionConflictsConfigType,
  printPositionRelationAxisXType,
  printPositionRelationAxisYType,
  printPositionRelationConfigType,
  printPositionRelationItemsConfigType,
  preserveGltfMeshConfigType,
  preserveGltfMeshEntryConfigType,
  printAtlasConfigType,
  printCmScaleType,
  printReferenceCmType,
  styleConfigType,
  textDefaultsConfigType,
  textPositionConfigType,
  uvBoundsType,
  uvPointType,
};
