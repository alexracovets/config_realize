import { assertShopifyConfigured } from './config';

type shopifyGraphqlResponseType<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

const shopifyAdminGraphql = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => {
  const { storeDomain, accessToken, apiVersion } = assertShopifyConfigured();

  const response = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

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
