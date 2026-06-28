const SHOPIFY_THEME_EDITOR_ORIGIN = 'https://admin.shopify.com';
const SHOPIFY_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

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

const normalizeFrameAncestor = (origin: string): string => {
  const trimmed = origin.trim();

  if (!trimmed || trimmed === "'self'" || trimmed.startsWith('http')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

/** Builds frame-ancestors sources for Shopify storefront + Theme Editor embeds. */
const buildShopifyFrameAncestors = (shop?: string | null): string[] => {
  const origins = new Set<string>(["'self'", SHOPIFY_THEME_EDITOR_ORIGIN]);

  const shopFromRequest = normalizeShopDomain(shop);
  if (shopFromRequest) {
    origins.add(`https://${shopFromRequest}`);
  }

  const storeDomain = normalizeShopDomain(readEnv('SHOPIFY_STORE_DOMAIN'));
  if (storeDomain) {
    origins.add(`https://${storeDomain}`);
  }

  const raw = readEnv('SHOPIFY_FRAME_ANCESTORS');
  if (raw) {
    for (const entry of raw.split(',')) {
      const normalized = normalizeFrameAncestor(entry);
      if (normalized) {
        origins.add(normalized);
      }
    }
  }

  return [...origins];
};

const buildShopifyFrameAncestorsHeader = (shop?: string | null): string => {
  return `frame-ancestors ${buildShopifyFrameAncestors(shop).join(' ')};`;
};

export {
  buildShopifyFrameAncestors,
  buildShopifyFrameAncestorsHeader,
  normalizeShopDomain,
  SHOPIFY_THEME_EDITOR_ORIGIN,
};
