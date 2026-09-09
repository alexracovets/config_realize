import { afterEach, describe, expect, it, vi } from 'vitest';

import { normalizeShopOrigin } from '@utils/embeddedSession/embeddedSession';
import { buildStorefrontProductPath, resolveStorefrontOrigin } from '@utils/shopifyStorefrontUrl/shopifyStorefrontUrl';

const createSessionStorage = () => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  };
};

const mountWindow = (search: string) => {
  vi.stubGlobal('window', {
    location: { search, origin: 'https://realize3d.unitry.io' },
    sessionStorage: createSessionStorage(),
  });

  vi.stubGlobal('sessionStorage', window.sessionStorage);
};

describe('normalizeShopOrigin', () => {
  it('reduces a storefront url to its origin', () => {
    expect(normalizeShopOrigin('https://www.realizesport.com/collections/all')).toBe('https://www.realizesport.com');
  });

  it('rejects values that are not absolute http(s) urls', () => {
    expect(normalizeShopOrigin('javascript:alert(1)')).toBeNull();
    expect(normalizeShopOrigin('www.realizesport.com')).toBeNull();
    expect(normalizeShopOrigin('')).toBeNull();
    expect(normalizeShopOrigin(null)).toBeNull();
  });
});

describe('buildStorefrontProductPath', () => {
  it('maps a configurator slug onto the storefront product route', () => {
    expect(buildStorefrontProductPath('federer-calcio')).toBe('/products/federer-calcio');
  });
});

describe('resolveStorefrontOrigin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null outside an embedded session', () => {
    mountWindow('?shop_origin=https%3A%2F%2Fwww.realizesport.com');

    expect(resolveStorefrontOrigin()).toBeNull();
  });

  it('returns null when the theme does not pass shop_origin yet', () => {
    mountWindow('?embedded=1&shop=realize-sport.myshopify.com');

    expect(resolveStorefrontOrigin()).toBeNull();
  });

  it('returns the storefront origin when embedded and shop_origin is present', () => {
    mountWindow('?embedded=1&shop=realize-sport.myshopify.com&shop_origin=https%3A%2F%2Fwww.realizesport.com');

    expect(resolveStorefrontOrigin()).toBe('https://www.realizesport.com');
  });

  it('persists shop_origin so later navigations inside the iframe keep it', () => {
    mountWindow('?embedded=1&shop_origin=https%3A%2F%2Fwww.realizesport.com');

    expect(resolveStorefrontOrigin()).toBe('https://www.realizesport.com');

    window.location.search = '';

    expect(resolveStorefrontOrigin()).toBe('https://www.realizesport.com');
  });

  it('ignores a malformed shop_origin instead of trusting it', () => {
    mountWindow('?embedded=1&shop_origin=javascript%3Aalert(1)');

    expect(resolveStorefrontOrigin()).toBeNull();
  });
});
