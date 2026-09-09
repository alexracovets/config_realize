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

const EMBEDDED_HEADER_HEIGHT_TYPE = 'header-height' as const;

type embeddedHeaderHeightMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_SHOPIFY;
  type: typeof EMBEDDED_HEADER_HEIGHT_TYPE;
  height: number;
};

const isEmbeddedHeaderHeightMessage = (data: unknown): data is embeddedHeaderHeightMessage => {
  if (!isRecord(data)) {
    return false;
  }

  const { source, type, height } = data;

  return (
    source === EMBEDDED_URL_SYNC_SOURCE_SHOPIFY && type === EMBEDDED_HEADER_HEIGHT_TYPE && typeof height === 'number' && Number.isFinite(height) && height >= 0
  );
};

const EMBEDDED_STORE_HEADER_TYPE = 'store-header' as const;

type storeHeaderMenuItem = {
  title: string;
  url: string;
  active?: boolean;
  children?: { title: string; url: string }[];
};

type storeHeaderData = {
  shopName?: string;
  logoUrl?: string;
  language?: string;
  cartCount?: number;
  accountUrl?: string;
  cartUrl?: string;
  searchUrl?: string;
  homeUrl?: string;
  social?: { type: string; url: string }[];
  announcements?: { text: string; url: string }[];
  menu?: storeHeaderMenuItem[];
};

type embeddedStoreHeaderMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_SHOPIFY;
  type: typeof EMBEDDED_STORE_HEADER_TYPE;
  data: storeHeaderData;
};

const isEmbeddedStoreHeaderMessage = (data: unknown): data is embeddedStoreHeaderMessage => {
  if (!isRecord(data)) {
    return false;
  }

  const { source, type, data: payload } = data;

  return source === EMBEDDED_URL_SYNC_SOURCE_SHOPIFY && type === EMBEDDED_STORE_HEADER_TYPE && isRecord(payload);
};

const EMBEDDED_CHECKOUT_REDIRECT_TYPE = 'checkout-redirect' as const;

const EMBEDDED_HEADER_ACTION_TYPE = 'header-action' as const;

const EMBEDDED_HEADER_ACTIONS = ['menu', 'search', 'cart', 'account', 'home', 'navigate', 'language'] as const;

type embeddedHeaderAction = (typeof EMBEDDED_HEADER_ACTIONS)[number];

type embeddedHeaderActionMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_APP;
  type: typeof EMBEDDED_HEADER_ACTION_TYPE;
  action: embeddedHeaderAction;
  href?: string;
};

const isEmbeddedHeaderActionMessage = (data: unknown): data is embeddedHeaderActionMessage => {
  if (!isRecord(data)) {
    return false;
  }

  const { source, type, action } = data;

  return (
    source === EMBEDDED_URL_SYNC_SOURCE_APP &&
    type === EMBEDDED_HEADER_ACTION_TYPE &&
    typeof action === 'string' &&
    (EMBEDDED_HEADER_ACTIONS as readonly string[]).includes(action)
  );
};

const postEmbeddedHeaderAction = (action: embeddedHeaderAction, href?: string): void => {
  if (!isEmbeddedSession() || window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      source: EMBEDDED_URL_SYNC_SOURCE_APP,
      type: EMBEDDED_HEADER_ACTION_TYPE,
      action,
      ...(href ? { href } : {}),
    },
    '*',
  );
};

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

const redirectToShopifyCheckout = (checkoutUrl: string): void => {
  if (isEmbeddedSession() && window.parent !== window) {
    postEmbeddedCheckoutRedirect(checkoutUrl);
  }

  const anchor = document.createElement('a');
  anchor.href = checkoutUrl;
  anchor.target = '_top';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

export {
  EMBEDDED_CHECKOUT_REDIRECT_TYPE,
  EMBEDDED_HEADER_ACTION_TYPE,
  EMBEDDED_HEADER_ACTIONS,
  EMBEDDED_HEADER_HEIGHT_TYPE,
  EMBEDDED_STORE_HEADER_TYPE,
  EMBEDDED_URL_SYNC_SOURCE_APP,
  EMBEDDED_URL_SYNC_SOURCE_SHOPIFY,
  EMBEDDED_URL_SYNC_TYPE,
  isEmbeddedHeaderActionMessage,
  isEmbeddedHeaderHeightMessage,
  isEmbeddedStoreHeaderMessage,
  isEmbeddedUrlSyncMessage,
  postEmbeddedCheckoutRedirect,
  postEmbeddedHeaderAction,
  postEmbeddedUrlToParent,
  redirectToShopifyCheckout,
};
export type {
  embeddedHeaderAction,
  embeddedHeaderActionMessage,
  embeddedHeaderHeightMessage,
  embeddedStoreHeaderMessage,
  embeddedUrlSyncMessage,
  storeHeaderData,
  storeHeaderMenuItem,
};
