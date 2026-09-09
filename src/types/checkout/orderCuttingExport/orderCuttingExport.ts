import type { configuratorStepValueType } from '@configurator/types';
import type { cartItemConfigurationType, checkoutProductType, modelIdType, uvBoundsType, uvPointType } from '@types';

type orderCuttingExportComposeKindType = 'design-layer' | 'design-mix' | 'color-atlas' | 'gradient-atlas' | 'text-layer' | 'complex-atlas';

type orderCuttingExportStepKeyType = configuratorStepValueType | 'complex';

type orderCuttingExportDesignComposeKindType = orderCuttingExportComposeKindType;

interface orderCuttingExportDesignLayerSpecType {
  maskSrc: string;
  color: string;
}

interface orderCuttingExportGradientSpecType {
  color2: string;

  rotation: number;
  position: number;
  softness: number;
  opacity: number;

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

  uv: uvPointType;

  rotation: number;
  lineHeight?: number;
  letterSpacing?: number;
}

interface orderCuttingExportLogoStampSpecType {
  src: string;
  label?: string;
  fileName?: string;
  uv: uvPointType;
  rotation: number;
  opacity: number;
  scale: number;
  naturalWidth: number;
  naturalHeight: number;
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
  logoStamps?: orderCuttingExportLogoStampSpecType[];
  defaultLogosSrc?: string;
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

  params?: orderCuttingExportStepDetailParamType[];
}

interface orderCuttingExportConfigurationStepType {
  step: number;
  key: orderCuttingExportStepKeyType;
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
  orderCuttingExportLogoStampSpecType,
  orderCuttingExportPrintAtlasType,
  orderCuttingExportProductType,
  orderCuttingExportStepDetailParamType,
  orderCuttingExportStepDetailType,
  orderCuttingExportStepKeyType,
  orderCuttingExportTextLayerSpecType,
  orderCuttingExportType,
};

type shopifyAddressType = {
  name?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  zip?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
};
