import { shopifyAdminGraphql } from '@shopify/adminClient';
import { getShopifyApiMode } from '@shopify/config';
import { shopifyGraphql } from '@shopify/graphqlClient';
import {
  mapShopifyProductBusiness,
  PRODUCT_BUSINESS_FIELDS,
  resolveProductModelId,
  type shopifyProductBusinessNodeType,
} from '@shopify/mapShopifyProductBusiness';
import type { configuratorProductHydrationType } from '@configurator/types';
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

const STOREFRONT_PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ConfiguratorProductByHandle($handle: String!) {
    product(handle: $handle) {
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
    }
  }
`;

const STOREFRONT_PRODUCTS_LOOKUP_QUERY = `#graphql
  query ConfiguratorProductsLookup {
    products(first: 100) {
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
        bonusCountMetafield: metafield(namespace: "custom", key: "bonus_count") {
          value
        }
        bonusDiscountMetafield: metafield(namespace: "custom", key: "bonus_discount") {
          value
        }
        minimumCountMetafield: metafield(namespace: "custom", key: "minimum_count") {
          value
        }
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

type storefrontProductNodeType = {
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

type storefrontProductByHandleResponseType = {
  product?: storefrontProductNodeType | null;
};

type storefrontProductsLookupResponseType = {
  products?: {
    nodes?: storefrontProductNodeType[];
  };
};

const mapStorefrontProductNode = (node: storefrontProductNodeType): shopifyProductBusinessNodeType => ({
  id: node.id,
  title: node.title,
  handle: node.handle,
  priceRangeV2: {
    minVariantPrice: {
      amount: node.priceRange?.minVariantPrice?.amount,
      currencyCode: node.priceRange?.minVariantPrice?.currencyCode,
    },
  },
  modelMetafield: node.modelMetafield,
  bonusCountMetafield: node.bonusCountMetafield,
  bonusDiscountMetafield: node.bonusDiscountMetafield,
  minimumCountMetafield: node.minimumCountMetafield,
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
