import { getShopifyAdminStoreDomain, getShopifyApiVersion } from '@shopify/config';
import { shopifyAdminGraphql } from '@shopify/adminClient';
import { resolveShopifyAdminAccessToken } from '@shopify/resolveShopifyAdminAccessToken';

const ORDER_BY_ID_QUERY = `#graphql
  query OrderById($id: ID!) {
    order(id: $id) {
      id
      legacyResourceId
      name
      note
      email
      phone
      createdAt
      updatedAt
      processedAt
      cancelledAt
      cancelReason
      closed
      closedAt
      confirmed
      currencyCode
      displayFinancialStatus
      displayFulfillmentStatus
      tags
      test
      customAttributes {
        key
        value
      }
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      subtotalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalTaxSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalDiscountsSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalShippingPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalRefundedSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      shippingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        provinceCode
        country
        countryCodeV2
        zip
        phone
        company
      }
      billingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        provinceCode
        country
        countryCodeV2
        zip
        phone
        company
      }
      shippingLine {
        title
        originalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
      }
      discountApplications(first: 20) {
        edges {
          node {
            allocationMethod
            targetSelection
            targetType
            value {
              ... on MoneyV2 {
                amount
                currencyCode
              }
              ... on PricingPercentageValue {
                percentage
              }
            }
          }
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
      lineItems(first: 100) {
        edges {
          node {
            id
            title
            name
            quantity
            sku
            vendor
            variantTitle
            originalUnitPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            discountedUnitPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customAttributes {
              key
              value
            }
          }
        }
      }
      fulfillments(first: 20) {
        id
        status
        createdAt
        trackingInfo {
          number
          url
          company
        }
      }
      transactions(first: 20) {
        id
        kind
        status
        amountSet {
          shopMoney {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const SCOPES_AND_SHOP_QUERY = `#graphql
  query DiagnoseAccess {
    shop {
      name
      myshopifyDomain
    }
    currentAppInstallation {
      accessScopes {
        handle
      }
    }
  }
`;

type shopifyOrderFullResponseType = {
  order: Record<string, unknown> | null;
};

const logDiagnostics = async (orderId: string) => {
  try {
    const storeDomain = getShopifyAdminStoreDomain();
    console.log('[fetchOrderById] Using Admin store domain:', storeDomain);

    const diagData = await shopifyAdminGraphql<{
      shop: { name: string; myshopifyDomain: string };
      currentAppInstallation: { accessScopes: { handle: string }[] };
    }>(SCOPES_AND_SHOP_QUERY);

    console.log('[fetchOrderById] Connected shop:', diagData.shop);
    console.log(
      '[fetchOrderById] Access scopes:',
      diagData.currentAppInstallation.accessScopes.map((scope) => scope.handle),
    );
  } catch (error) {
    console.error('[fetchOrderById] Diagnostics query failed.', error);
  }

  try {
    const storeDomain = getShopifyAdminStoreDomain();
    const apiVersion = getShopifyApiVersion();
    const accessToken = await resolveShopifyAdminAccessToken();

    const restResponse = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/orders/${orderId}.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken },
      cache: 'no-store',
    });

    console.log('[fetchOrderById] REST /orders/{id}.json status:', restResponse.status);
    const restBody = await restResponse.text();
    console.log('[fetchOrderById] REST /orders/{id}.json body:', restBody);
  } catch (error) {
    console.error('[fetchOrderById] REST diagnostics failed.', error);
  }
};

const fetchOrderById = async (orderId: string): Promise<Record<string, unknown> | null> => {
  const globalId = orderId.startsWith('gid://') ? orderId : `gid://shopify/Order/${orderId}`;

  await logDiagnostics(orderId);

  const data = await shopifyAdminGraphql<shopifyOrderFullResponseType>(ORDER_BY_ID_QUERY, { id: globalId });

  return data.order;
};

export { fetchOrderById };
