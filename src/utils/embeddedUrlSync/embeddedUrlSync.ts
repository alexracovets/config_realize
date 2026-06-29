import { isEmbeddedSession } from '@utils/embeddedSession';

const EMBEDDED_URL_SYNC_SOURCE_APP = 'realize-configurator' as const;
const EMBEDDED_URL_SYNC_SOURCE_SHOPIFY = 'realize-shopify' as const;
const EMBEDDED_URL_SYNC_TYPE_NAVIGATE = 'navigate' as const;
const EMBEDDED_URL_SYNC_TYPE_DOCUMENT_METADATA = 'document-metadata' as const;
const EMBEDDED_URL_SYNC_TYPE_READY = 'ready' as const;
const EMBEDDED_URL_SYNC_TYPE_LOADING = 'loading' as const;

type embeddedNavigateMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_APP | typeof EMBEDDED_URL_SYNC_SOURCE_SHOPIFY;
  type: typeof EMBEDDED_URL_SYNC_TYPE_NAVIGATE;
  pathname: string;
};

type embeddedDocumentMetadataPayload = {
  title?: string;
  description?: string;
  url?: string;
  canonical?: string;
  image?: string;
  ogImage?: string;
};

type embeddedDocumentMetadataMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_APP;
  type: typeof EMBEDDED_URL_SYNC_TYPE_DOCUMENT_METADATA;
} & embeddedDocumentMetadataPayload;

type embeddedReadyMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_APP;
  type: typeof EMBEDDED_URL_SYNC_TYPE_READY;
};

type embeddedLoadingMessage = {
  source: typeof EMBEDDED_URL_SYNC_SOURCE_APP;
  type: typeof EMBEDDED_URL_SYNC_TYPE_LOADING;
};

type embeddedParentMessage =
  | embeddedNavigateMessage
  | embeddedDocumentMetadataMessage
  | embeddedReadyMessage
  | embeddedLoadingMessage;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isEmbeddedNavigateMessage = (data: unknown): data is embeddedNavigateMessage => {
  if (!isRecord(data)) {
    return false;
  }

  const { source, type, pathname } = data;

  return (
    (source === EMBEDDED_URL_SYNC_SOURCE_APP || source === EMBEDDED_URL_SYNC_SOURCE_SHOPIFY) &&
    type === EMBEDDED_URL_SYNC_TYPE_NAVIGATE &&
    typeof pathname === 'string' &&
    pathname.startsWith('/')
  );
};

const postEmbeddedMessageToParent = (message: embeddedParentMessage): void => {
  if (!isEmbeddedSession() || window.parent === window) {
    return;
  }

  window.parent.postMessage(message, '*');
};

const postEmbeddedUrlToParent = (pathname: string): void => {
  postEmbeddedMessageToParent({
    source: EMBEDDED_URL_SYNC_SOURCE_APP,
    type: EMBEDDED_URL_SYNC_TYPE_NAVIGATE,
    pathname,
  });
};

const postEmbeddedDocumentMetadataToParent = (metadata: embeddedDocumentMetadataPayload): void => {
  postEmbeddedMessageToParent({
    source: EMBEDDED_URL_SYNC_SOURCE_APP,
    type: EMBEDDED_URL_SYNC_TYPE_DOCUMENT_METADATA,
    ...metadata,
  });
};

const postEmbeddedReadyToParent = (): void => {
  postEmbeddedMessageToParent({
    source: EMBEDDED_URL_SYNC_SOURCE_APP,
    type: EMBEDDED_URL_SYNC_TYPE_READY,
  });
};

const postEmbeddedLoadingToParent = (): void => {
  postEmbeddedMessageToParent({
    source: EMBEDDED_URL_SYNC_SOURCE_APP,
    type: EMBEDDED_URL_SYNC_TYPE_LOADING,
  });
};

export {
  EMBEDDED_URL_SYNC_SOURCE_APP,
  EMBEDDED_URL_SYNC_SOURCE_SHOPIFY,
  EMBEDDED_URL_SYNC_TYPE_NAVIGATE as EMBEDDED_URL_SYNC_TYPE,
  isEmbeddedNavigateMessage as isEmbeddedUrlSyncMessage,
  postEmbeddedDocumentMetadataToParent,
  postEmbeddedLoadingToParent,
  postEmbeddedReadyToParent,
  postEmbeddedUrlToParent,
};
export type {
  embeddedDocumentMetadataPayload,
  embeddedNavigateMessage as embeddedUrlSyncMessage,
};
