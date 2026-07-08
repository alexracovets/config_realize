import { shopifyAdminGraphql } from '@shopify/adminClient';
import { getShopifyApiMode, getShopifyHomeCollectionHandles } from '@shopify/config';
import { shopifyGraphql } from '@shopify/graphqlClient';
import { resolveLocalPreviewByModelId } from '@shopify/resolveLocalPreviewByModelId';
import type { homePageCollectionType } from '@types';
const CONFIGURATOR_COLLECTION_TYPE = 'configurator';
const FRONTPAGE_HANDLE = 'frontpage';

const FILE_REFERENCE_FIELDS = `
  reference {
    ... on MediaImage {
      image {
        url
      }
    }
    ... on GenericFile {
      url
    }
  }
`;

const ADMIN_COLLECTION_LIST_QUERY = `#graphql
  query ConfiguratorCollectionList {
    collections(first: 50) {
      nodes {
        id
        title
        handle
        image {
          url
        }
        typeMetafield: metafield(namespace: "custom", key: "type") {
          value
        }
      }
    }
  }
`;

const STOREFRONT_COLLECTION_LIST_QUERY = `#graphql
  query ConfiguratorCollectionList {
    collections(first: 50) {
      nodes {
        id
        title
        handle
        image {
          url
        }
        typeMetafield: metafield(namespace: "custom", key: "type") {
          value
        }
      }
    }
  }
`;

const ADMIN_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query ConfiguratorCollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      image {
        url
      }
      typeMetafield: metafield(namespace: "custom", key: "type") {
        value
      }
    }
  }
`;

const STOREFRONT_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query ConfiguratorCollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      image {
        url
      }
      typeMetafield: metafield(namespace: "custom", key: "type") {
        value
      }
    }
  }
`;

const ADMIN_COLLECTION_PRODUCTS_QUERY = `#graphql
  query ConfiguratorCollectionProducts($id: ID!) {
    collection(id: $id) {
      products(first: 25) {
        nodes {
          id
          title
          handle
          status
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          modelMetafield: metafield(namespace: "custom", key: "id") {
            value
          }
          featuredImage {
            url
          }
          viewImage: metafield(namespace: "custom", key: "view_image") {
            ${FILE_REFERENCE_FIELDS}
          }
          activeViewImage: metafield(namespace: "custom", key: "active_view_image") {
            ${FILE_REFERENCE_FIELDS}
          }
        }
      }
    }
  }
`;

const STOREFRONT_COLLECTION_PRODUCTS_QUERY = `#graphql
  query ConfiguratorCollectionProducts($id: ID!) {
    collection(id: $id) {
      products(first: 25) {
        nodes {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          modelMetafield: metafield(namespace: "custom", key: "id") {
            value
          }
          featuredImage {
            url
          }
          viewImage: metafield(namespace: "custom", key: "view_image") {
            ${FILE_REFERENCE_FIELDS}
          }
          activeViewImage: metafield(namespace: "custom", key: "active_view_image") {
            ${FILE_REFERENCE_FIELDS}
          }
        }
      }
    }
  }
`;

type productMetafieldReferenceType = {
  reference?: {
    image?: { url?: string | null } | null;
    url?: string | null;
  } | null;
};

type shopifyProductNodeType = {
  id: string;
  title: string;
  handle: string;
  status?: string;
  priceRangeV2?: {
    minVariantPrice?: { amount?: string | null; currencyCode?: string | null } | null;
  } | null;
  priceRange?: {
    minVariantPrice?: { amount?: string | null; currencyCode?: string | null } | null;
  } | null;
  modelMetafield?: { value: string } | null;
  featuredImage: { url: string } | null;
  viewImage: productMetafieldReferenceType | null;
  activeViewImage: productMetafieldReferenceType | null;
};

type shopifyCollectionListNodeType = {
  id: string;
  title: string;
  handle: string;
  image?: { url?: string | null } | null;
  typeMetafield?: { value: string } | null;
};

type mappedHomeProductType = homePageCollectionType['products'][number];

const resolveMetafieldFileUrl = (metafield?: productMetafieldReferenceType | null) => {
  const reference = metafield?.reference;
  if (!reference) return null;

  return reference.image?.url ?? reference.url ?? null;
};

const mapShopifyProduct = (product: shopifyProductNodeType): mappedHomeProductType => {
  const modelId = product.modelMetafield?.value?.trim() || null;
  const viewImageSrc = resolveMetafieldFileUrl(product.viewImage);
  const activeViewImageSrc = resolveMetafieldFileUrl(product.activeViewImage);
  const featuredImageSrc = product.featuredImage?.url ?? null;
  const localPreview = resolveLocalPreviewByModelId(modelId);
  const minVariantPrice = product.priceRangeV2?.minVariantPrice ?? product.priceRange?.minVariantPrice;
  const priceAmount = minVariantPrice?.amount;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    status: product.status ?? 'ACTIVE',
    modelId,
    price: priceAmount != null ? Number(priceAmount) : null,
    currencyCode: minVariantPrice?.currencyCode ?? null,
    previewSrc: featuredImageSrc ?? viewImageSrc ?? localPreview.previewSrc,
    flipPreviewSrc: viewImageSrc ?? featuredImageSrc ?? localPreview.previewSrc,
    activePreviewSrc: activeViewImageSrc ?? viewImageSrc ?? featuredImageSrc ?? localPreview.activePreviewSrc,
  };
};

const fetchCollectionProducts = async (collectionId: string) => {
  const isStorefront = getShopifyApiMode() === 'storefront';
  const query = isStorefront ? STOREFRONT_COLLECTION_PRODUCTS_QUERY : ADMIN_COLLECTION_PRODUCTS_QUERY;
  const request = isStorefront ? shopifyGraphql : shopifyAdminGraphql;

  const data = await request<{
    collection?: {
      products?: {
        nodes?: shopifyProductNodeType[];
      };
    } | null;
  }>(query, { id: collectionId });

  return data.collection?.products?.nodes?.map(mapShopifyProduct) ?? [];
};

const isConfiguratorCollection = (collection: shopifyCollectionListNodeType, products: mappedHomeProductType[]) => {
  if (collection.typeMetafield?.value === CONFIGURATOR_COLLECTION_TYPE) {
    return true;
  }

  if (collection.typeMetafield?.value && collection.typeMetafield.value !== CONFIGURATOR_COLLECTION_TYPE) {
    return false;
  }

  return products.some((product) => product.modelId);
};

const buildHomeCollection = async (collection: shopifyCollectionListNodeType): Promise<homePageCollectionType | null> => {
  const products = await fetchCollectionProducts(collection.id);
  const visibleProducts = collection.typeMetafield?.value === CONFIGURATOR_COLLECTION_TYPE ? products : products.filter((product) => product.modelId);

  if (!isConfiguratorCollection(collection, visibleProducts)) {
    return null;
  }

  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    imageSrc: collection.image?.url ?? null,
    products: visibleProducts,
  };
};

const fetchCollectionSummaryByHandle = async (handle: string): Promise<homePageCollectionType | null> => {
  const isStorefront = getShopifyApiMode() === 'storefront';
  const query = isStorefront ? STOREFRONT_COLLECTION_BY_HANDLE_QUERY : ADMIN_COLLECTION_BY_HANDLE_QUERY;
  const request = isStorefront ? shopifyGraphql : shopifyAdminGraphql;

  const data = await request<{
    collection?: shopifyCollectionListNodeType | null;
    collectionByHandle?: shopifyCollectionListNodeType | null;
  }>(query, { handle });

  const collection = data.collection ?? data.collectionByHandle;
  if (!collection) return null;

  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    imageSrc: collection.image?.url ?? null,
    products: [],
  };
};

const fetchCollectionByHandle = async (handle: string): Promise<homePageCollectionType | null> => {
  const isStorefront = getShopifyApiMode() === 'storefront';
  const query = isStorefront ? STOREFRONT_COLLECTION_BY_HANDLE_QUERY : ADMIN_COLLECTION_BY_HANDLE_QUERY;
  const request = isStorefront ? shopifyGraphql : shopifyAdminGraphql;

  const data = await request<{
    collection?: shopifyCollectionListNodeType | null;
    collectionByHandle?: shopifyCollectionListNodeType | null;
  }>(query, { handle });

  const collection = data.collection ?? data.collectionByHandle;
  if (!collection) return null;

  return buildHomeCollection(collection);
};

const fetchConfiguratorCollections = async (): Promise<homePageCollectionType[]> => {
  const explicitHandles = getShopifyHomeCollectionHandles();
  const collections = await Promise.all(explicitHandles.map((handle) => fetchCollectionByHandle(handle)));
  const resolved = collections.filter((collection): collection is homePageCollectionType => collection != null);

  if (resolved.length > 0) {
    return resolved;
  }

  if (explicitHandles.length > 0) {
    console.warn(`[shopify] No home collections resolved for handles: ${explicitHandles.join(', ')}. Falling back to auto-discovery.`);
  }

  const isStorefront = getShopifyApiMode() === 'storefront';
  const listQuery = isStorefront ? STOREFRONT_COLLECTION_LIST_QUERY : ADMIN_COLLECTION_LIST_QUERY;
  const request = isStorefront ? shopifyGraphql : shopifyAdminGraphql;

  const listData = await request<{
    collections?: {
      nodes?: shopifyCollectionListNodeType[];
    };
  }>(listQuery);

  const candidates = listData.collections?.nodes?.filter((collection) => collection.handle !== FRONTPAGE_HANDLE) ?? [];

  const discoveredCollections = await Promise.all(candidates.map((collection) => buildHomeCollection(collection)));

  return discoveredCollections.filter((collection): collection is homePageCollectionType => collection != null);
};

const fetchConfiguratorCollectionSummaries = async (): Promise<homePageCollectionType[]> => {
  const explicitHandles = getShopifyHomeCollectionHandles();
  const collections = await Promise.all(explicitHandles.map((handle) => fetchCollectionSummaryByHandle(handle)));
  const resolved = collections.filter((collection): collection is homePageCollectionType => collection != null);

  if (resolved.length > 0) {
    return resolved;
  }

  if (explicitHandles.length > 0) {
    console.warn(`[shopify] No home collection summaries resolved for handles: ${explicitHandles.join(', ')}. Falling back to auto-discovery.`);
  }

  const isStorefront = getShopifyApiMode() === 'storefront';
  const listQuery = isStorefront ? STOREFRONT_COLLECTION_LIST_QUERY : ADMIN_COLLECTION_LIST_QUERY;
  const request = isStorefront ? shopifyGraphql : shopifyAdminGraphql;

  const listData = await request<{
    collections?: {
      nodes?: shopifyCollectionListNodeType[];
    };
  }>(listQuery);

  const candidates = listData.collections?.nodes?.filter((collection) => collection.handle !== FRONTPAGE_HANDLE) ?? [];

  return candidates.map((collection) => ({
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    imageSrc: collection.image?.url ?? null,
    products: [],
  }));
};

export { fetchCollectionByHandle, fetchConfiguratorCollectionSummaries, fetchConfiguratorCollections };
