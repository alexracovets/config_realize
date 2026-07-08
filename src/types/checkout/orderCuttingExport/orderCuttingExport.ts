import type { configuratorStepValueType } from '@configurator/types';
import type { cartItemConfigurationType, checkoutProductType, modelIdType, uvBoundsType, uvPointType } from '@types';

type orderCuttingExportComposeKindType = 'design-layer' | 'design-mix' | 'color-atlas' | 'gradient-atlas' | 'text-layer';

/** @deprecated Use orderCuttingExportComposeKindType */
type orderCuttingExportDesignComposeKindType = orderCuttingExportComposeKindType;

interface orderCuttingExportDesignLayerSpecType {
  maskSrc: string;
  color: string;
}

interface orderCuttingExportGradientSpecType {
  /** Gradient end color; base part color is the start. Already resolved for `reversed`. */
  color2: string;
  /** Degrees, same convention as the garment shader. */
  rotation: number;
  position: number;
  softness: number;
  opacity: number;
  /** Part UV bounds the shader normalizes against. */
  uvBounds: uvBoundsType;
}

interface orderCuttingExportColorPartSpecType {
  label: string;
  color: string;
  meshNames: string[];
  gradient?: orderCuttingExportGradientSpecType;
}

interface orderCuttingExportTextLayerSpecType {
  text: string;
  font: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  fontSize: number;
  /** Anchor in atlas UV space (0..1). */
  uv: uvPointType;
  /** Total print rotation in degrees (instance + placement + upload + part). */
  rotation: number;
  lineHeight?: number;
  letterSpacing?: number;
}

interface orderCuttingExportDownloadFileType {
  key: string;
  label: string;
  fileName: string;
  downloadUrl: string;
  previewSrc?: string;
  composeKind?: orderCuttingExportComposeKindType;
  maskSrc?: string;
  color?: string;
  opacity?: number;
  layers?: orderCuttingExportDesignLayerSpecType[];
  uvBounds?: uvBoundsType;
  colorParts?: orderCuttingExportColorPartSpecType[];
  textLayers?: orderCuttingExportTextLayerSpecType[];
  atlasWidth?: number;
  atlasHeight?: number;
  modelSrc?: string;
}

interface orderCuttingExportStepDetailParamType {
  label: string;
  value: string;
}

interface orderCuttingExportStepDetailType {
  label: string;
  value: string;
  /** Extra key/value rows rendered stacked under the main value. */
  params?: orderCuttingExportStepDetailParamType[];
}

interface orderCuttingExportConfigurationStepType {
  step: number;
  key: configuratorStepValueType;
  title: string;
  isConfigured: boolean;
  emptyMessage: string;
  details: orderCuttingExportStepDetailType[];
  downloadFiles: orderCuttingExportDownloadFileType[];
}

interface orderCuttingExportArticleType {
  modelLabel: string;
  size: string;
  quantity: number;
  jerseyName: string;
  number: string;
}

interface orderCuttingExportPrintAtlasType {
  width: number;
  height: number;
}

interface orderCuttingExportProductType {
  cartItemId: string;
  productTitle: string;
  modelId: modelIdType;
  modelLabel: string;
  printAtlas: orderCuttingExportPrintAtlasType;
  steps: orderCuttingExportConfigurationStepType[];
}

interface orderCuttingExportCustomerType {
  company: string;
  vatOrTaxCode: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  email: string;
  pec: string;
}

interface orderCuttingExportType {
  orderNumber: string;
  orderDate: string;
  customer: orderCuttingExportCustomerType;
  articles: orderCuttingExportArticleType[];
  products: orderCuttingExportProductType[];
}

interface buildOrderCuttingExportParamsType {
  products: checkoutProductType[];
  configurations: Record<string, cartItemConfigurationType>;
  orderNumber?: string;
  orderDate?: string;
  customer?: Partial<orderCuttingExportCustomerType>;
}

interface buildOrderCuttingExportPreviewParamsType {
  modelId?: modelIdType;
  patternIndex?: number;
}

export type {
  buildOrderCuttingExportParamsType,
  buildOrderCuttingExportPreviewParamsType,
  orderCuttingExportArticleType,
  orderCuttingExportColorPartSpecType,
  orderCuttingExportComposeKindType,
  orderCuttingExportConfigurationStepType,
  orderCuttingExportCustomerType,
  orderCuttingExportDesignComposeKindType,
  orderCuttingExportDesignLayerSpecType,
  orderCuttingExportDownloadFileType,
  orderCuttingExportGradientSpecType,
  orderCuttingExportPrintAtlasType,
  orderCuttingExportProductType,
  orderCuttingExportStepDetailParamType,
  orderCuttingExportStepDetailType,
  orderCuttingExportTextLayerSpecType,
  orderCuttingExportType,
};
