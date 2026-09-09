import { getShopifyAdminAccessToken, getShopifyAdminClientId, getShopifyAdminClientSecret, getShopifyAdminStoreDomain } from '@shopify/config';

type cachedAdminTokenType = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: cachedAdminTokenType | null = null;

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const DEFAULT_TOKEN_TTL_SECONDS = 24 * 60 * 60;

type clientCredentialsResponseType = {
  access_token?: string;
  expires_in?: number;
};

const fetchClientCredentialsToken = async (storeDomain: string, clientId: string, clientSecret: string): Promise<cachedAdminTokenType> => {
  const response = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`[shopify] Failed to mint Admin API access token: HTTP ${response.status}${details ? ` — ${details}` : ''}`);
  }

  const data = (await response.json()) as clientCredentialsResponseType;
  if (!data.access_token) {
    throw new Error('[shopify] client_credentials token response missing access_token.');
  }

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? DEFAULT_TOKEN_TTL_SECONDS) * 1000,
  };
};

type resolveShopifyAdminAccessTokenOptionsType = {
  forceRefresh?: boolean;
};

const resolveShopifyAdminAccessToken = async (options: resolveShopifyAdminAccessTokenOptionsType = {}): Promise<string> => {
  const clientId = getShopifyAdminClientId();
  const clientSecret = getShopifyAdminClientSecret();

  if (!clientId || !clientSecret) {
    const staticToken = getShopifyAdminAccessToken();
    if (!staticToken) {
      throw new Error(
        '[shopify] Missing Admin API credentials. Set SHOPIFY_ADMIN_ACCESS_TOKEN, or SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET. See .env.example.',
      );
    }
    return staticToken;
  }

  const storeDomain = getShopifyAdminStoreDomain();
  if (!storeDomain) {
    throw new Error('[shopify] Missing SHOPIFY_ADMIN_STORE_DOMAIN (or SHOPIFY_STORE_DOMAIN) for Admin API.');
  }

  if (!options.forceRefresh && cachedToken && cachedToken.expiresAt - TOKEN_REFRESH_MARGIN_MS > Date.now()) {
    return cachedToken.accessToken;
  }

  try {
    cachedToken = await fetchClientCredentialsToken(storeDomain, clientId, clientSecret);
    return cachedToken.accessToken;
  } catch (error) {
    const staticToken = getShopifyAdminAccessToken();
    if (!staticToken) throw error;

    console.warn(`${error instanceof Error ? error.message : String(error)} Falling back to SHOPIFY_ADMIN_ACCESS_TOKEN.`);
    return staticToken;
  }
};

export { resolveShopifyAdminAccessToken };
