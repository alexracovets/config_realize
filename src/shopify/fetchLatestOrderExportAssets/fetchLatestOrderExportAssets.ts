import { shopifyAdminGraphql } from '@shopify/adminClient';
import { ORDER_METAFIELD_NAMESPACE } from '@shopify/setOrderMetafields';

const LAST_ORDER_EXPORT_ASSETS_QUERY = `
  query LastOrderExportAssets {
    orders(first: 1, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          email
          currencyCode
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          metafields(first: 100) {
            edges {
              node {
                id
                namespace
                key
                type
                value
              }
            }
          }
          customAttributes {
            key
            value
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                customAttributes {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

type orderMetafieldEntryType = {
  id: string;
  namespace: string;
  key: string;
  type: string;
  value: string;
};

type orderAttributeEntryType = { key: string; value: string | null };

type orderLineItemEntryType = {
  id: string;
  title: string;
  quantity: number;
  customAttributes: orderAttributeEntryType[];
};

type shopifyOrderNodeType = {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  email: string | null;
  currencyCode: string;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } } | null;
  metafields: { edges: { node: orderMetafieldEntryType }[] };
  customAttributes: orderAttributeEntryType[];
  lineItems: { edges: { node: orderLineItemEntryType }[] };
};

type shopifyLastOrderResponseType = {
  orders: { edges: { node: shopifyOrderNodeType }[] };
};

type uvImageEntryType = { cartItemId: string; label: string; url: string };

type latestOrderExportAssetsType = {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  email: string | null;
  totalPrice: string | null;
  currencyCode: string;
  orderPdfUrl: string | null;
  cuttingPdfUrl: string | null;
  configUrl: string | null;
  uvImages: uvImageEntryType[];
  raw: shopifyOrderNodeType;
};

const parseUvImages = (value: string | undefined): uvImageEntryType[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as uvImageEntryType[]) : [];
  } catch {
    return [];
  }
};

const fetchLatestOrderExportAssets = async (): Promise<latestOrderExportAssetsType | null> => {
  const data = await shopifyAdminGraphql<shopifyLastOrderResponseType>(LAST_ORDER_EXPORT_ASSETS_QUERY);
  const order = data.orders.edges[0]?.node;
  if (!order) return null;

  const configuratorMetafields = order.metafields.edges
    .map(({ node }) => node)
    .filter((metafield) => metafield.namespace === ORDER_METAFIELD_NAMESPACE);
  const metafieldByKey = new Map(configuratorMetafields.map((metafield) => [metafield.key, metafield.value]));

  return {
    id: order.id,
    name: order.name,
    createdAt: order.createdAt,
    financialStatus: order.displayFinancialStatus,
    fulfillmentStatus: order.displayFulfillmentStatus,
    email: order.email,
    totalPrice: order.totalPriceSet?.shopMoney.amount ?? null,
    currencyCode: order.totalPriceSet?.shopMoney.currencyCode ?? order.currencyCode,
    orderPdfUrl: metafieldByKey.get('order_pdf_url') ?? null,
    cuttingPdfUrl: metafieldByKey.get('cutting_pdf_url') ?? null,
    configUrl: metafieldByKey.get('config_url') ?? null,
    uvImages: parseUvImages(metafieldByKey.get('uv_image_urls')),
    raw: order,
  };
};

export { fetchLatestOrderExportAssets };
export type { latestOrderExportAssetsType, shopifyOrderNodeType, uvImageEntryType };
