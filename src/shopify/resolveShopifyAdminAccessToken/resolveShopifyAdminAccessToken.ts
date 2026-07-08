import { getShopifyAdminAccessToken, getShopifyAdminClientId, getShopifyAdminClientSecret, getShopifyStoreDomain } from '@shopify/config';

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
    throw new Error(`[shopify] Failed to mint Admin API access token: HTTP ${response.status}`);
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
  /** Bypasses the in-memory cache; used to recover from a 401 with a possibly-stale cached token. */
  forceRefresh?: boolean;
};

/**
 * Resolves an Admin API access token. Prefers the self-refreshing `client_credentials` flow
 * (SHOPIFY_ADMIN_CLIENT_ID/SHOPIFY_ADMIN_CLIENT_SECRET) since Dev Dashboard tokens expire after
 * ~24h; falls back to a static SHOPIFY_ADMIN_ACCESS_TOKEN (classic custom-app token, no expiry).
 */
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

  const storeDomain = getShopifyStoreDomain();
  if (!storeDomain) {
    throw new Error('[shopify] Missing SHOPIFY_STORE_DOMAIN for Admin API.');
  }

  if (!options.forceRefresh && cachedToken && cachedToken.expiresAt - TOKEN_REFRESH_MARGIN_MS > Date.now()) {
    return cachedToken.accessToken;
  }

  cachedToken = await fetchClientCredentialsToken(storeDomain, clientId, clientSecret);
  return cachedToken.accessToken;
};

export { resolveShopifyAdminAccessToken };
