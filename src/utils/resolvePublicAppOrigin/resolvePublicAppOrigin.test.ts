import { afterEach, describe, expect, it } from 'vitest';

import { buildPublicAssetDownloadUrl, parsePublicAppOrigin, resolvePublicAppOrigin } from '@utils/resolvePublicAppOrigin/resolvePublicAppOrigin';

const originalAppOrigin = process.env.APP_ORIGIN;
const originalAppUrl = process.env.APP_URL;

afterEach(() => {
  if (originalAppOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = originalAppOrigin;

  if (originalAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = originalAppUrl;
});

describe('parsePublicAppOrigin', () => {
  it('accepts a public https origin', () => {
    expect(parsePublicAppOrigin('https://configurator.example.com')).toBe('https://configurator.example.com');
  });

  it('rejects Docker bind addresses', () => {
    expect(parsePublicAppOrigin('https://0.0.0.0:80')).toBeNull();
    expect(parsePublicAppOrigin('http://127.0.0.1:3000')).toBeNull();
    expect(parsePublicAppOrigin('http://localhost:3000')).toBeNull();
  });
});

describe('resolvePublicAppOrigin', () => {
  it('prefers APP_ORIGIN over request url', () => {
    process.env.APP_ORIGIN = 'https://configurator.example.com';

    const request = new Request('https://0.0.0.0:80/api/webhooks/orders-create');

    expect(resolvePublicAppOrigin(request)).toBe('https://configurator.example.com');
  });

  it('uses forwarded host instead of 0.0.0.0 request origin', () => {
    delete process.env.APP_ORIGIN;
    delete process.env.APP_URL;

    const request = new Request('https://0.0.0.0:80/api/webhooks/orders-create', {
      headers: {
        'x-forwarded-host': 'configurator.example.com',
        'x-forwarded-proto': 'https',
      },
    });

    expect(resolvePublicAppOrigin(request)).toBe('https://configurator.example.com');
  });

  it('returns null when only the Docker bind address is available', () => {
    delete process.env.APP_ORIGIN;
    delete process.env.APP_URL;

    const request = new Request('https://0.0.0.0:80/api/webhooks/orders-create', {
      headers: { host: '0.0.0.0:80' },
    });

    expect(resolvePublicAppOrigin(request)).toBeNull();
  });

  it('builds a download URL on the public app origin, not 0.0.0.0', () => {
    process.env.APP_ORIGIN = 'https://realize3d.unitry.io';

    const request = new Request('https://0.0.0.0:80/api/webhooks/orders-create', {
      headers: { host: '0.0.0.0:80' },
    });
    const fileUrl = 'https://cdn.shopify.com/s/files/1/0501/5840/3742/files/color_uv_atlas.png?v=1';
    const downloadUrl = buildPublicAssetDownloadUrl(resolvePublicAppOrigin(request), fileUrl, 'UV Color.png');
    const parsed = new URL(downloadUrl);

    expect(parsed.origin).toBe('https://realize3d.unitry.io');
    expect(parsed.pathname).toBe('/api/download');
    expect(parsed.searchParams.get('url')).toBe(fileUrl);
    expect(parsed.searchParams.get('filename')).toBe('UV Color.png');
  });

  it('falls back to the source file URL when origin is a Docker bind address', () => {
    const fileUrl = 'https://cdn.shopify.com/s/files/1/0501/5840/3742/files/color_uv_atlas.png';

    expect(buildPublicAssetDownloadUrl('https://0.0.0.0:80', fileUrl, 'UV Color.png')).toBe(fileUrl);
  });
});
