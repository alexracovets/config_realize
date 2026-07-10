import { shopifyAdminGraphql } from '@shopify/adminClient';
import { getShopifyApiMode } from '@shopify/config';
import { shopifyGraphql } from '@shopify/graphqlClient';
import {
  mapShopifyProductBusiness,
  PRODUCT_BUSINESS_FIELDS,
  resolveProductModelId,
  type shopifyProductBusinessNodeType,
} from '@shopify/mapShopifyProductBusiness';
import type { sizeChartMetafieldsNodeType } from '@shopify/mapSizeChartContent';
import type { configuratorProductHydrationType } from '@configurator/types';

const STOREFRONT_SIZE_CHART_FIELDS = `#graphql
  headingMetafield: metafield(namespace: "custom", key: "tabella_taglie_heading") {
    value
  }
  descriptionMetafield: metafield(namespace: "custom", key: "tabella_taglie_description") {
    value
    type
  }
  imageMetafield: metafield(namespace: "custom", key: "tabella_taglie_image") {
    reference {
      ... on MediaImage {
        image {
          url
          altText
        }
      }
    }
  }
  tableMetafield: metafield(namespace: "custom", key: "tabella_taglie_table") {
    value
  }
  noteMetafield: metafield(namespace: "custom", key: "tabella_taglie_note") {
    value
    type
  }
`;

const ADMIN_PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ConfiguratorProductByHandle($handle: String!) {
    productByIdentifier(identifier: { handle: $handle }) {
      ${PRODUCT_BUSINESS_FIELDS}
    }
  }
`;

const ADMIN_PRODUCTS_LOOKUP_QUERY = `#graphql
  query ConfiguratorProductsLookup {
    products(first: 100) {
      nodes {
        ${PRODUCT_BUSINESS_FIELDS}
      }
    }
  }
`;

/** Single field selection reused by every Storefront query — add new fields once here, not per-query. */
const STOREFRONT_PRODUCT_FIELDS = `#graphql
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
  bonusCountMetafield: metafield(namespace: "custom", key: "bonus_count") {
    value
  }
  bonusDiscountMetafield: metafield(namespace: "custom", key: "bonus_discount") {
    value
  }
  minimumCountMetafield: metafield(namespace: "custom", key: "minimum_count") {
    value
  }
  ${STOREFRONT_SIZE_CHART_FIELDS}
`;

const STOREFRONT_PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ConfiguratorProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${STOREFRONT_PRODUCT_FIELDS}
    }
  }
`;

const STOREFRONT_PRODUCTS_LOOKUP_QUERY = `#graphql
  query ConfiguratorProductsLookup {
    products(first: 100) {
      nodes {
        ${STOREFRONT_PRODUCT_FIELDS}
      }
    }
  }
`;

type adminProductByHandleResponseType = {
  productByIdentifier?: shopifyProductBusinessNodeType | null;
};

type adminProductsLookupResponseType = {
  products?: {
    nodes?: shopifyProductBusinessNodeType[];
  };
};

/** Base (non-metafield) fields shared by every Storefront node — kept in one place alongside `STOREFRONT_PRODUCT_FIELDS`. */
type storefrontProductBaseNodeType = {
  id: string;
  title: string;
  handle: string;
  priceRange?: {
    minVariantPrice?: { amount?: string | null; currencyCode?: string | null } | null;
  } | null;
  modelMetafield?: { value: string } | null;
  bonusCountMetafield?: { value: string } | null;
  bonusDiscountMetafield?: { value: string } | null;
  minimumCountMetafield?: { value: string } | null;
};

type storefrontProductNodeType = storefrontProductBaseNodeType & sizeChartMetafieldsNodeType;

type storefrontProductByHandleResponseType = {
  product?: storefrontProductNodeType | null;
};

type storefrontProductsLookupResponseType = {
  products?: {
    nodes?: storefrontProductNodeType[];
  };
};

/**
 * Reshapes a Storefront node into the Admin-shaped `shopifyProductBusinessNodeType`.
 * Metafields (`sizeChartMetafieldsNodeType` and beyond) pass through via spread — adding a new
 * metafield only needs `STOREFRONT_PRODUCT_FIELDS` + the shared node type, not a new line here.
 */
const mapStorefrontProductNode = ({ priceRange, ...node }: storefrontProductNodeType): shopifyProductBusinessNodeType => ({
  ...node,
  priceRangeV2: {
    minVariantPrice: {
      amount: priceRange?.minVariantPrice?.amount,
      currencyCode: priceRange?.minVariantPrice?.currencyCode,
    },
  },
});

const toConfiguratorProduct = (node: shopifyProductBusinessNodeType): configuratorProductHydrationType | null => {
  const modelId = resolveProductModelId(node);
  if (!modelId) return null;

  return {
    modelId,
    business: mapShopifyProductBusiness(node),
  };
};

const findAdminProductByModelId = async (modelId: string): Promise<shopifyProductBusinessNodeType | null> => {
  const data = await shopifyAdminGraphql<adminProductsLookupResponseType>(ADMIN_PRODUCTS_LOOKUP_QUERY);
  const normalizedModelId = modelId.trim();

  return data.products?.nodes?.find((product) => product.modelMetafield?.value?.trim() === normalizedModelId) ?? null;
};

const findStorefrontProductByModelId = async (modelId: string): Promise<shopifyProductBusinessNodeType | null> => {
  const data = await shopifyGraphql<storefrontProductsLookupResponseType>(STOREFRONT_PRODUCTS_LOOKUP_QUERY);
  const normalizedModelId = modelId.trim();

  const node = data.products?.nodes?.find((product) => product.modelMetafield?.value?.trim() === normalizedModelId);
  return node ? mapStorefrontProductNode(node) : null;
};

/**
 * Resolves a configurator product from the URL slug (`/:slug`).
 * Tries Shopify product handle first, then `custom.id` metafield (model id).
 */
const fetchConfiguratorProductByHandle = async (slug: string): Promise<configuratorProductHydrationType | null> => {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  if (getShopifyApiMode() === 'storefront') {
    const byHandle = await shopifyGraphql<storefrontProductByHandleResponseType>(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, {
      handle: normalizedSlug,
    });

    if (byHandle.product) {
      return toConfiguratorProduct(mapStorefrontProductNode(byHandle.product));
    }

    const byModelId = await findStorefrontProductByModelId(normalizedSlug);
    if (byModelId) {
      return toConfiguratorProduct(byModelId);
    }

    return null;
  }

  const byHandle = await shopifyAdminGraphql<adminProductByHandleResponseType>(ADMIN_PRODUCT_BY_HANDLE_QUERY, {
    handle: normalizedSlug,
  });

  if (byHandle.productByIdentifier) {
    return toConfiguratorProduct(byHandle.productByIdentifier);
  }

  const byModelId = await findAdminProductByModelId(normalizedSlug);
  if (byModelId) {
    return toConfiguratorProduct(byModelId);
  }

  return null;
};

export { fetchConfiguratorProductByHandle };
