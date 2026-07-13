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
          metafields(first: 20, namespace: "${ORDER_METAFIELD_NAMESPACE}") {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

type shopifyOrderNodeType = {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  metafields: { edges: { node: { key: string; value: string } }[] };
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
  orderPdfUrl: string | null;
  cuttingPdfUrl: string | null;
  configUrl: string | null;
  uvImages: uvImageEntryType[];
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

/** Fetches the most recently created Shopify order and its `configurator.*` export metafields (PDF/config/UV image URLs). */
const fetchLatestOrderExportAssets = async (): Promise<latestOrderExportAssetsType | null> => {
  const data = await shopifyAdminGraphql<shopifyLastOrderResponseType>(LAST_ORDER_EXPORT_ASSETS_QUERY);
  const order = data.orders.edges[0]?.node;
  if (!order) return null;

  const metafieldByKey = new Map(order.metafields.edges.map(({ node }) => [node.key, node.value]));

  return {
    id: order.id,
    name: order.name,
    createdAt: order.createdAt,
    financialStatus: order.displayFinancialStatus,
    orderPdfUrl: metafieldByKey.get('order_pdf_url') ?? null,
    cuttingPdfUrl: metafieldByKey.get('cutting_pdf_url') ?? null,
    configUrl: metafieldByKey.get('config_url') ?? null,
    uvImages: parseUvImages(metafieldByKey.get('uv_image_urls')),
  };
};

export { fetchLatestOrderExportAssets };
export type { latestOrderExportAssetsType, uvImageEntryType };
