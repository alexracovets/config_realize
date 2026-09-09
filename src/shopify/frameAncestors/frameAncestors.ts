const SHOPIFY_THEME_EDITOR_ORIGIN = 'https://admin.shopify.com';
const SHOPIFY_THEME_PREVIEW_ORIGIN = 'https://online-store-web.shopifyapps.com';
const SHOPIFY_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const FRAME_ANCESTOR_WILDCARD_PATTERN = /\*/;

const HOSTNAME_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(:\d{1,5})?$/;

const readEnv = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const normalizeShopDomain = (shop: string | null | undefined): string | null => {
  if (!shop) {
    return null;
  }

  const trimmed = shop.trim().toLowerCase();
  return SHOPIFY_DOMAIN_PATTERN.test(trimmed) ? trimmed : null;
};

const normalizeFrameAncestor = (origin: string): string | null => {
  const trimmed = origin.trim();

  if (!trimmed || trimmed === "'self'" || FRAME_ANCESTOR_WILDCARD_PATTERN.test(trimmed)) {
    return null;
  }

  if (trimmed.startsWith('http')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const normalizeLiveHost = (host: string | null | undefined): string | null => {
  if (!host) {
    return null;
  }

  const trimmed = host
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  return HOSTNAME_PATTERN.test(trimmed) ? trimmed : null;
};

const addLiveHostOrigin = (origins: Set<string>, host: string | null | undefined): void => {
  const liveHost = normalizeLiveHost(host);
  if (liveHost) {
    origins.add(`https://${liveHost}`);
  }
};

const addHostsFromCsv = (origins: Set<string>, raw: string | undefined): void => {
  if (!raw) {
    return;
  }

  for (const entry of raw.split(',')) {
    addLiveHostOrigin(origins, entry);
  }
};

const addConfiguredStoreHosts = (origins: Set<string>): void => {
  const storeDomain = readEnv('SHOPIFY_STORE_DOMAIN');
  const shopDomain = normalizeShopDomain(storeDomain);
  if (shopDomain) {
    origins.add(`https://${shopDomain}`);
  } else {
    addLiveHostOrigin(origins, storeDomain);
  }

  addHostsFromCsv(origins, readEnv('SHOPIFY_HOSTS'));

  const shops = readEnv('SHOPIFY_SHOPS');
  if (shops) {
    for (const shop of shops.split(',')) {
      const key = shop
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      if (!key) {
        continue;
      }

      addHostsFromCsv(origins, readEnv(`SHOPIFY_SHOP_${key}_HOSTS`));

      const shopStoreDomain = readEnv(`SHOPIFY_SHOP_${key}_STORE_DOMAIN`);
      const shopMyshopify = normalizeShopDomain(shopStoreDomain);
      if (shopMyshopify) {
        origins.add(`https://${shopMyshopify}`);
      } else {
        addLiveHostOrigin(origins, shopStoreDomain);
      }
    }
  }

  const rawFrameAncestors = readEnv('SHOPIFY_FRAME_ANCESTORS');
  if (rawFrameAncestors) {
    for (const entry of rawFrameAncestors.split(',')) {
      const normalized = normalizeFrameAncestor(entry);
      if (normalized) {
        origins.add(normalized);
      }
    }
  }
};

const buildShopifyFrameAncestors = (shop?: string | null, host?: string | null): string[] => {
  const origins = new Set<string>(["'self'", SHOPIFY_THEME_EDITOR_ORIGIN, SHOPIFY_THEME_PREVIEW_ORIGIN]);

  const shopFromRequest = normalizeShopDomain(shop);
  if (shopFromRequest) {
    origins.add(`https://${shopFromRequest}`);
  }

  addLiveHostOrigin(origins, host);
  addConfiguredStoreHosts(origins);

  return [...origins];
};

const buildShopifyFrameAncestorsHeader = (shop?: string | null, host?: string | null): string => {
  return `frame-ancestors ${buildShopifyFrameAncestors(shop, host).join(' ')};`;
};

export {
  buildShopifyFrameAncestors,
  buildShopifyFrameAncestorsHeader,
  normalizeLiveHost,
  normalizeShopDomain,
  SHOPIFY_THEME_EDITOR_ORIGIN,
  SHOPIFY_THEME_PREVIEW_ORIGIN,
};
