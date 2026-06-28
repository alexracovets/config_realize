const EMBEDDED_STORAGE_KEY = 'realize:embedded';
const SHOP_STORAGE_KEY = 'realize:shop';

type embeddedSessionType = {
  embedded: boolean;
  shop: string | null;
};

const readEmbeddedSession = (): embeddedSessionType => {
  if (typeof window === 'undefined') {
    return { embedded: false, shop: null };
  }

  return {
    embedded: sessionStorage.getItem(EMBEDDED_STORAGE_KEY) === '1',
    shop: sessionStorage.getItem(SHOP_STORAGE_KEY),
  };
};

const persistEmbeddedSession = (embedded: boolean, shop: string | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!embedded) {
    return;
  }

  sessionStorage.setItem(EMBEDDED_STORAGE_KEY, '1');

  if (shop) {
    sessionStorage.setItem(SHOP_STORAGE_KEY, shop);
  } else {
    sessionStorage.removeItem(SHOP_STORAGE_KEY);
  }
};

const resolveEmbeddedContext = (): embeddedSessionType => {
  if (typeof window === 'undefined') {
    return { embedded: false, shop: null };
  }

  const params = new URLSearchParams(window.location.search);
  const urlEmbedded = params.get('embedded') === '1';
  const urlShop = params.get('shop');

  if (urlEmbedded) {
    persistEmbeddedSession(true, urlShop);
  }

  const session = readEmbeddedSession();

  return {
    embedded: urlEmbedded || session.embedded,
    shop: urlShop ?? session.shop,
  };
};

const isEmbeddedSession = (): boolean => resolveEmbeddedContext().embedded;

const buildEmbeddedSearchParams = (): URLSearchParams | null => {
  const { embedded, shop } = resolveEmbeddedContext();

  if (!embedded) {
    return null;
  }

  const params = new URLSearchParams({ embedded: '1' });

  if (shop) {
    params.set('shop', shop);
  }

  return params;
};

const buildAppPath = (pathname: string): string => {
  const params = buildEmbeddedSearchParams();

  if (!params) {
    return pathname;
  }

  return `${pathname}?${params.toString()}`;
};

export { buildAppPath, persistEmbeddedSession, readEmbeddedSession, resolveEmbeddedContext, isEmbeddedSession };
