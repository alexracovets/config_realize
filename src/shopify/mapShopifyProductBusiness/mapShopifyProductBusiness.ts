import type { garmentBusinessType } from '@types';

import { mapSizeChartContent, resolveSizeReferenceCm, type sizeChartMetafieldsNodeType } from '@shopify/mapSizeChartContent';

/** GraphQL fields needed to build `garmentBusinessType` from a Shopify product node. */
const PRODUCT_BUSINESS_FIELDS = `#graphql
  id
  title
  handle
  priceRangeV2 {
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

type shopifyProductBusinessNodeType = {
  id: string;
  title: string;
  handle: string;
  priceRangeV2?: {
    minVariantPrice?: { amount?: string | null; currencyCode?: string | null } | null;
  } | null;
  modelMetafield?: { value: string } | null;
  bonusCountMetafield?: { value: string } | null;
  bonusDiscountMetafield?: { value: string } | null;
  minimumCountMetafield?: { value: string } | null;
} & sizeChartMetafieldsNodeType;

const toNumber = (value?: string | null): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveProductModelId = (node: shopifyProductBusinessNodeType): string | null => node.modelMetafield?.value?.trim() || null;

const mapShopifyProductBusiness = (node: shopifyProductBusinessNodeType): garmentBusinessType => ({
  shopifyProductId: node.id,
  handle: node.handle,
  name: node.title,
  price: toNumber(node.priceRangeV2?.minVariantPrice?.amount),
  currencyCode: node.priceRangeV2?.minVariantPrice?.currencyCode ?? 'EUR',
  minimumCount: toNumber(node.minimumCountMetafield?.value),
  bonusDiscount: toNumber(node.bonusDiscountMetafield?.value),
  bonusCount: toNumber(node.bonusCountMetafield?.value),
  sizeChart: mapSizeChartContent(node) ?? undefined,
  printReferenceCm: resolveSizeReferenceCm(node) ?? undefined,
});

export { mapShopifyProductBusiness, PRODUCT_BUSINESS_FIELDS, resolveProductModelId };
export type { shopifyProductBusinessNodeType };
