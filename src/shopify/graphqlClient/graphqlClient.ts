import { assertShopifyConfigured } from '@shopify/config';
import { fetchShopifyWithTimeout } from '@shopify/fetchShopifyWithTimeout';
type shopifyGraphqlResponseType<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

const shopifyGraphql = async <TData>(query: string, variables?: Record<string, unknown>): Promise<TData> => {
  const { storeDomain, apiVersion, mode, accessToken } = assertShopifyConfigured();

  const endpoint =
    mode === 'storefront' ? `https://${storeDomain}/api/${apiVersion}/graphql.json` : `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (mode === 'storefront') {
    headers['X-Shopify-Storefront-Access-Token'] = accessToken;
  } else {
    headers['X-Shopify-Access-Token'] = accessToken;
  }

  const response = await fetchShopifyWithTimeout(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`[shopify] ${mode} API HTTP ${response.status}: ${response.statusText}`);
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

export { shopifyGraphql };
