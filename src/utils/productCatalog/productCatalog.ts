import type { catalogProductEntryType, catalogProductRefType, configuratorProductHydrationType, productCollectionIdType } from '@types';
import { CATALOG_PRODUCT_ENTRIES, PRODUCT_COLLECTIONS } from '@constants';

import { DEFAULT_MODEL_ID, deriveLocalBusiness, getModel, hasModel, resolveProductPreviewSrc } from '../garmentCatalog/garmentCatalog';
import { resolveProductCatalogPreviewSrc } from '../resolveProductCatalogPreviewSrc/resolveProductCatalogPreviewSrc';

const getCatalogProductEntry = (collection: productCollectionIdType, slug: string): catalogProductEntryType | undefined =>
  CATALOG_PRODUCT_ENTRIES.find((entry) => entry.collection === collection && entry.slug === slug);

const getCatalogProductEntryBySlug = (slug: string): catalogProductEntryType | undefined =>
  CATALOG_PRODUCT_ENTRIES.find((entry) => entry.slug === slug);

const getCatalogProductEntryByModelId = (modelId: string): catalogProductEntryType | undefined =>
  CATALOG_PRODUCT_ENTRIES.find((entry) => entry.modelId === modelId);

const resolveConfiguratorProductBySlug = (slug: string): configuratorProductHydrationType | null => {
  const entry = getCatalogProductEntryBySlug(slug) ?? getCatalogProductEntryByModelId(slug);

  if (!entry?.modelId || !hasModel(entry.modelId)) {
    if (hasModel(slug)) {
      const business = deriveLocalBusiness(slug);

      return {
        modelId: slug,
        business: {
          ...business,
          handle: slug,
          name: business.name,
        },
      };
    }

    return null;
  }

  const business = deriveLocalBusiness(entry.modelId);

  return {
    modelId: entry.modelId,
    business: {
      ...business,
      handle: slug,
      name: entry.name,
    },
  };
};

const toCatalogProductRef = (entry: catalogProductEntryType): catalogProductRefType | undefined => {
  if (!entry.modelId) return undefined;

  const product = getModel(entry.modelId);
  if (!product) return undefined;

  const garmentPreviewSrc = resolveProductPreviewSrc(product);

  return {
    collection: entry.collection,
    slug: entry.slug,
    name: entry.name,
    modelId: entry.modelId,
    configurable: entry.configurable,
    previewSrc: resolveProductCatalogPreviewSrc(entry, garmentPreviewSrc),
    product,
  };
};

const createCatalogProductRefPlaceholder = (entry: catalogProductEntryType): catalogProductRefType => ({
  collection: entry.collection,
  slug: entry.slug,
  name: entry.name,
  modelId: DEFAULT_MODEL_ID,
  configurable: entry.configurable,
  previewSrc: resolveProductCatalogPreviewSrc(entry),
  product: getModel(DEFAULT_MODEL_ID)!,
});

const listCatalogProductsByCollection = (collection: productCollectionIdType): catalogProductRefType[] =>
  CATALOG_PRODUCT_ENTRIES.filter((entry) => entry.collection === collection).map(
    (entry) => toCatalogProductRef(entry) ?? createCatalogProductRefPlaceholder(entry),
  );

const listOtherProductCollections = (currentCollection: productCollectionIdType) =>
  PRODUCT_COLLECTIONS.filter((collection) => collection.id !== currentCollection);

const listCatalogProducts = (): catalogProductRefType[] =>
  CATALOG_PRODUCT_ENTRIES.map((entry) => toCatalogProductRef(entry) ?? createCatalogProductRefPlaceholder(entry));

export {
  getCatalogProductEntry,
  getCatalogProductEntryBySlug,
  listCatalogProducts,
  listCatalogProductsByCollection,
  listOtherProductCollections,
  resolveConfiguratorProductBySlug,
  toCatalogProductRef,
};
