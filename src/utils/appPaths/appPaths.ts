/**
 * In-app-only routes that must NOT be mirrored to the host (Shopify) URL. The embedded
 * theme treats `/checkout` as the real Shopify storefront checkout and redirects the top
 * window there; the configurator's internal checkout/summary view shares that pathname, so
 * syncing it would yank the parent to an (empty) Shopify checkout and bounce back to "/".
 */
const CHECKOUT_APP_PATH = '/checkout';

const isInternalAppPath = (pathname: string): boolean => pathname === CHECKOUT_APP_PATH || pathname.startsWith(`${CHECKOUT_APP_PATH}/`);

const buildCollectionPath = (collectionHandle: string): string => `/${collectionHandle}`;

const buildConfiguratorPath = (collectionHandle: string, slug: string): string => `/${collectionHandle}/${slug}`;

const isConfiguratorPath = (pathname: string): boolean => {
  if (isInternalAppPath(pathname)) {
    return false;
  }

  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 2;
};

export { buildCollectionPath, buildConfiguratorPath, isConfiguratorPath, isInternalAppPath };
