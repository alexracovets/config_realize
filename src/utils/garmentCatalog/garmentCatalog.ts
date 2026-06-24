import type { garmentBusinessType, garmentConfigType, modelIdType } from '@types';

import baggioData from '../../data/baggio_calcio/baggio_calcio.json';
import bernardiData from '../../data/bernardi_calcio/bernardi_calcio.json';
import cruijffData from '../../data/cruijff_calcio/cruijff_calcio.json';
import federerData from '../../data/federer_calcio/federer_calcio.json';

/**
 * Geometry-only model catalog, keyed by model id.
 * The model id equals the data folder name and the Shopify product `custom.id` metafield —
 * this is the join key between a Shopify product (business data) and its local 3D geometry.
 */
const MODELS: Record<modelIdType, garmentConfigType> = {
  // WIP geometry JSON — schema is still being finalized (e.g. testoPositions), so cast through unknown.
  baggio_calcio: baggioData as unknown as garmentConfigType,
  bernardi_calcio: bernardiData as unknown as garmentConfigType,
  federer_calcio: federerData as unknown as garmentConfigType,
  cruijff_calcio: cruijffData as unknown as garmentConfigType,
};

const DEFAULT_MODEL_ID: modelIdType = 'federer_calcio';

const getModel = (modelId: modelIdType): garmentConfigType | undefined => MODELS[modelId];

const hasModel = (modelId: modelIdType): boolean => modelId in MODELS;

const resolveProductPreviewSrc = (product: garmentConfigType) => (product.previewImage ? `${product.path}${product.previewImage}` : '');

const DEFAULT_CURRENCY_CODE = 'EUR';

/**
 * Fallback business data sourced from a model's legacy local JSON fields.
 * Used when there is no Shopify context (in-configurator product catalog, default cart item).
 * The Shopify-driven flow overrides this with real product data via `garmentBusinessType`.
 */
const deriveLocalBusiness = (modelId: modelIdType): garmentBusinessType => {
  const product = getModel(modelId);

  return {
    shopifyProductId: '',
    handle: '',
    name: product?.name ?? modelId,
    price: product?.price ?? 0,
    currencyCode: DEFAULT_CURRENCY_CODE,
    bonusCount: product?.bonus_count ?? 0,
    bonusDiscount: product?.bonus_discount ?? 0,
    minimumCount: product?.minimum_count ?? 0,
  };
};

export { DEFAULT_CURRENCY_CODE, DEFAULT_MODEL_ID, deriveLocalBusiness, getModel, hasModel, MODELS, resolveProductPreviewSrc };
