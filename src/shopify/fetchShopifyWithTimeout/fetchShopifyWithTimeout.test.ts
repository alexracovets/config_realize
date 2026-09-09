import { fetchShopifyWithTimeout, formatShopifyRequestError, isShopifyAbortError, SHOPIFY_REQUEST_TIMEOUT_MS } from '@shopify/fetchShopifyWithTimeout';
import { afterEach, describe, expect, it, vi } from 'vitest';

const createAbortError = () => {
  const error = new Error('This operation was aborted');
  error.name = 'AbortError';
  return error;
};

describe('formatShopifyRequestError', () => {
  it('summarizes abort errors without dumping DOMException fields', () => {
    expect(formatShopifyRequestError(createAbortError())).toBe(`timed out after ${SHOPIFY_REQUEST_TIMEOUT_MS}ms`);
  });

  it('keeps ordinary error messages', () => {
    expect(formatShopifyRequestError(new Error('HTTP 500'))).toBe('HTTP 500');
  });
});

describe('isShopifyAbortError', () => {
  it('detects abort and timeout errors', () => {
    expect(isShopifyAbortError(createAbortError())).toBe(true);
    const timeout = new Error('Timeout');
    timeout.name = 'TimeoutError';
    expect(isShopifyAbortError(timeout)).toBe(true);
    expect(isShopifyAbortError(new Error('boom'))).toBe(false);
  });
});

describe('fetchShopifyWithTimeout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retries once after an abort and then succeeds', async () => {
    const response = new Response('ok', { status: 200 });
    const fetchMock = vi.fn().mockRejectedValueOnce(createAbortError()).mockResolvedValueOnce(response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchShopifyWithTimeout('https://example.test')).resolves.toBe(response);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-abort failures', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('HTTP 503'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchShopifyWithTimeout('https://example.test')).rejects.toThrow('HTTP 503');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
