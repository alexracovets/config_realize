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
