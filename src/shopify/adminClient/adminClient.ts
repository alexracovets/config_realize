import { getShopifyApiVersion, getShopifyStoreDomain } from '@shopify/config';
import { fetchShopifyWithTimeout } from '@shopify/fetchShopifyWithTimeout';
import { resolveShopifyAdminAccessToken } from '@shopify/resolveShopifyAdminAccessToken';
type shopifyGraphqlResponseType<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

const requestShopifyAdminGraphql = async (endpoint: string, query: string, variables: Record<string, unknown> | undefined, forceRefresh: boolean) => {
  const accessToken = await resolveShopifyAdminAccessToken({ forceRefresh });

  return fetchShopifyWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
};

const shopifyAdminGraphql = async <TData>(query: string, variables?: Record<string, unknown>): Promise<TData> => {
  const storeDomain = getShopifyStoreDomain();
  const apiVersion = getShopifyApiVersion();

  if (!storeDomain) {
    throw new Error('[shopify] Missing SHOPIFY_STORE_DOMAIN for Admin API.');
  }

  const endpoint = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  let response = await requestShopifyAdminGraphql(endpoint, query, variables, false);
  if (response.status === 401) {
    response = await requestShopifyAdminGraphql(endpoint, query, variables, true);
  }

  if (!response.ok) {
    throw new Error(`[shopify] Admin API HTTP ${response.status}: ${response.statusText}`);
  }

  const payload = (await response.json()) as shopifyGraphqlResponseType<TData>;

  if (payload.errors?.length) {
    throw new Error(`[shopify] GraphQL error: ${payload.errors.map((error) => error.message).join('; ')}`);
  }

  if (!payload.data) {
    throw new Error('[shopify] GraphQL response missing data');
  }

  return payload.data;
};

export { shopifyAdminGraphql };
