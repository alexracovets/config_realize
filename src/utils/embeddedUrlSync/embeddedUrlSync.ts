import { isEmbeddedSession } from '@utils/embeddedSession';

const EMBEDDED_URL_SYNC_SOURCE_APP = 'realize-configurator' as const;
const EMBEDDED_URL_SYNC_SOURCE_SHOPIFY = 'realize-shopify' as const;
const EMBEDDED_URL_SYNC_TYPE = 'navigate' as const;

type embeddedUrlSyncMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_APP | typeof EMBEDDED_URL_SYNC_SOURCE_SHOPIFY;
  type: typeof EMBEDDED_URL_SYNC_TYPE;
  pathname: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isEmbeddedUrlSyncMessage = (data: unknown): data is embeddedUrlSyncMessage => {
  if (!isRecord(data)) {
    return false;
  }

  const { source, type, pathname } = data;

  return (
    (source === EMBEDDED_URL_SYNC_SOURCE_APP || source === EMBEDDED_URL_SYNC_SOURCE_SHOPIFY) &&
    type === EMBEDDED_URL_SYNC_TYPE &&
    typeof pathname === 'string' &&
    pathname.startsWith('/')
  );
};

const EMBEDDED_CHECKOUT_REDIRECT_TYPE = 'checkout-redirect' as const;

const postEmbeddedUrlToParent = (pathname: string): void => {
  if (!isEmbeddedSession() || window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      source: EMBEDDED_URL_SYNC_SOURCE_APP,
      type: EMBEDDED_URL_SYNC_TYPE,
      pathname,
    },
    '*',
  );
};

const postEmbeddedCheckoutRedirect = (url: string): void => {
  if (!isEmbeddedSession() || window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      source: EMBEDDED_URL_SYNC_SOURCE_APP,
      type: EMBEDDED_CHECKOUT_REDIRECT_TYPE,
      url,
    },
    '*',
  );
};

/** Opens a blank tab synchronously (must run inside the click handler, before any await). */
const openPendingCheckoutWindow = (): Window | null => {
  if (!isEmbeddedSession() || window.parent === window) {
    return null;
  }

  const pendingWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');
  if (pendingWindow) {
    pendingWindow.opener = null;
  }

  return pendingWindow;
};

/**
 * Navigates to Shopify checkout. In embedded mode asks the theme to redirect the top window
 * and also navigates a pending tab opened synchronously on click (avoids popup blockers).
 */
const redirectToShopifyCheckout = (checkoutUrl: string, pendingWindow: Window | null): void => {
  if (isEmbeddedSession() && window.parent !== window) {
    postEmbeddedCheckoutRedirect(checkoutUrl);
  }

  if (pendingWindow) {
    pendingWindow.location.href = checkoutUrl;
    return;
  }

  window.location.assign(checkoutUrl);
};

export {
  EMBEDDED_CHECKOUT_REDIRECT_TYPE,
  EMBEDDED_URL_SYNC_SOURCE_APP,
  EMBEDDED_URL_SYNC_SOURCE_SHOPIFY,
  EMBEDDED_URL_SYNC_TYPE,
  isEmbeddedUrlSyncMessage,
  openPendingCheckoutWindow,
  postEmbeddedCheckoutRedirect,
  postEmbeddedUrlToParent,
  redirectToShopifyCheckout,
};
export type { embeddedUrlSyncMessage };
