import type { garmentBusinessType, garmentConfigType, modelIdType } from '@types';

import baggioData from '@data/baggio_calcio/baggio_calcio.json';
import bernardiCalcioData from '@data/bernardi_calcio/bernardi_calcio.json';
import bernardiPallavoloData from '@data/bernardi_pallavolo/bernardi_pallavolo.json';
import canottaMagikBasketData from '@data/canotta_magik_basket/canotta_magik_basket.json';
import cruijffCalcioData from '@data/cruijff_calcio/cruijff_calcio.json';
import cruijffCompletoData from '@data/cruijff_completo/cruijff_completo.json';
import cruijffPallavoloData from '@data/cruijff_pallavolo/cruijff_pallavolo.json';
import federerCalcioData from '@data/federer_calcio/federer_calcio.json';
import federerCompletoData from '@data/federer_completo/federer_completo.json';
import federerPallavoloData from '@data/federer_pallavolo/federer_pallavolo.json';
import lolloPallavoloData from '@data/lollo_pallavolo/lollo_pallavolo.json';
import maloneBasketData from '@data/malone_basket/malone_basket.json';
import malonePallavoloData from '@data/malone_pallavolo/malone_pallavolo.json';
import picciPallavoloData from '@data/picci_pallavolo/picci_pallavolo.json';
import syllaPallavoloData from '@data/sylla_pallavolo/sylla_pallavolo.json';
/**
 * Geometry-only model catalog, keyed by model id.
 * The model id equals the data folder name and the Shopify product `custom.id` metafield —
 * this is the join key between a Shopify product (business data) and its local 3D geometry.
 */
const MODELS: Record<modelIdType, garmentConfigType> = {
  // WIP geometry JSON — schema is still being finalized (e.g. testoPositions), so cast through unknown.
  baggio_calcio: baggioData as unknown as garmentConfigType,
  canotta_magik_basket: canottaMagikBasketData as unknown as garmentConfigType,
  bernardi_calcio: bernardiCalcioData as unknown as garmentConfigType,
  bernardi_pallavolo: bernardiPallavoloData as unknown as garmentConfigType,
  federer_calcio: federerCalcioData as unknown as garmentConfigType,
  federer_completo: federerCompletoData as unknown as garmentConfigType,
  federer_pallavolo: federerPallavoloData as unknown as garmentConfigType,
  cruijff_calcio: cruijffCalcioData as unknown as garmentConfigType,
  cruijff_completo: cruijffCompletoData as unknown as garmentConfigType,
  cruijff_pallavolo: cruijffPallavoloData as unknown as garmentConfigType,
  lollo_pallavolo: lolloPallavoloData as unknown as garmentConfigType,
  malone_basket: maloneBasketData as unknown as garmentConfigType,
  malone_pallavolo: malonePallavoloData as unknown as garmentConfigType,
  picci_pallavolo: picciPallavoloData as unknown as garmentConfigType,
  sylla_pallavolo: syllaPallavoloData as unknown as garmentConfigType,
};

const DEFAULT_MODEL_ID: modelIdType = 'federer_calcio';

const getModel = (modelId: modelIdType): garmentConfigType | undefined => MODELS[modelId];

const hasModel = (modelId: string): modelId is modelIdType => modelId in MODELS;

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
