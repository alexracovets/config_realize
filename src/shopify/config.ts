const readEnv = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

type shopifyApiModeType = 'admin' | 'storefront';

const isShopifyEnabled = (): boolean => readEnv('SHOPIFY_ENABLED') === 'true';

const getShopifyStoreDomain = (): string | undefined => readEnv('SHOPIFY_STORE_DOMAIN');

const getShopifyAdminAccessToken = (): string | undefined => readEnv('SHOPIFY_ADMIN_ACCESS_TOKEN');

const getShopifyStorefrontAccessToken = (): string | undefined => readEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

/** Home page gallery order: calcio, pallavolo, basket, completo. Override via SHOPIFY_HOME_COLLECTION_HANDLES. */
const DEFAULT_SHOPIFY_HOME_COLLECTION_HANDLES = [
  'completo-gara-calcio',
  'completo-gara-pallavolo',
  'completo-gara-basket',
  'completo',
] as const;

const getShopifyHomeCollectionHandles = (): string[] => {
  const raw = readEnv('SHOPIFY_HOME_COLLECTION_HANDLES');
  const handles = raw
    ? raw
        .split(',')
        .map((handle) => handle.trim())
        .filter(Boolean)
    : [...DEFAULT_SHOPIFY_HOME_COLLECTION_HANDLES];

  return handles;
};

const getShopifyApiVersion = (): string => readEnv('SHOPIFY_API_VERSION') ?? '2025-01';

const getShopifyApiMode = (): shopifyApiModeType => {
  const mode = readEnv('SHOPIFY_API_MODE');

  if (mode === 'admin' || mode === 'storefront') {
    return mode;
  }

  if (getShopifyStorefrontAccessToken()) {
    return 'storefront';
  }

  return 'admin';
};

const getShopifyFrameAncestors = (): string[] => {
  const raw = readEnv('SHOPIFY_FRAME_ANCESTORS');

  if (!raw) {
    return ['https://*.myshopify.com', 'https://admin.shopify.com'];
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const assertShopifyConfigured = (): {
  storeDomain: string;
  apiVersion: string;
  mode: shopifyApiModeType;
  accessToken: string;
} => {
  const storeDomain = getShopifyStoreDomain();
  const apiVersion = getShopifyApiVersion();
  const mode = getShopifyApiMode();
  const accessToken = mode === 'storefront' ? getShopifyStorefrontAccessToken() : getShopifyAdminAccessToken();

  if (!storeDomain || !accessToken) {
    throw new Error(
      mode === 'storefront'
        ? '[shopify] Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN. See .env.example.'
        : '[shopify] Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN. See .env.example.',
    );
  }

  return { storeDomain, apiVersion, mode, accessToken };
};

export {
  assertShopifyConfigured,
  DEFAULT_SHOPIFY_HOME_COLLECTION_HANDLES,
  getShopifyAdminAccessToken,
  getShopifyApiMode,
  getShopifyApiVersion,
  getShopifyFrameAncestors,
  getShopifyHomeCollectionHandles,
  getShopifyStoreDomain,
  getShopifyStorefrontAccessToken,
  isShopifyEnabled,
};

export type { shopifyApiModeType };
