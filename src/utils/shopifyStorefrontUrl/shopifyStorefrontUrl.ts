import { resolveEmbeddedContext } from '@utils/embeddedSession';

const SHOPIFY_STORE_PRODUCT_PREFIX = '/products/';

const buildStorefrontProductPath = (slug: string): string => `${SHOPIFY_STORE_PRODUCT_PREFIX}${slug}`;

const resolveStorefrontOrigin = (): string | null => {
  const { embedded, shopOrigin } = resolveEmbeddedContext();

  if (!embedded) {
    return null;
  }

  return shopOrigin;
};

export { buildStorefrontProductPath, resolveStorefrontOrigin, SHOPIFY_STORE_PRODUCT_PREFIX };
