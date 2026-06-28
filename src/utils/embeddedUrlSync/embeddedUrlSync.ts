import { isEmbeddedSession } from '@utils/embeddedSession';

const EMBEDDED_URL_SYNC_SOURCE_APP = 'realize-configurator' as const;
const EMBEDDED_URL_SYNC_SOURCE_SHOPIFY = 'realize-shopify' as const;
const EMBEDDED_URL_SYNC_TYPE = 'navigate' as const;

type embeddedUrlSyncMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_APP | typeof EMBEDDED_URL_SYNC_SOURCE_SHOPIFY;
  type: typeof EMBEDDED_URL_SYNC_TYPE;
  pathname: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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

export {
  EMBEDDED_URL_SYNC_SOURCE_APP,
  EMBEDDED_URL_SYNC_SOURCE_SHOPIFY,
  EMBEDDED_URL_SYNC_TYPE,
  isEmbeddedUrlSyncMessage,
  postEmbeddedUrlToParent,
};
export type { embeddedUrlSyncMessage };
