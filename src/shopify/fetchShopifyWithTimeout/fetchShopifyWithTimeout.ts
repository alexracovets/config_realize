const SHOPIFY_REQUEST_TIMEOUT_MS = 8_000;
const SHOPIFY_REQUEST_MAX_ATTEMPTS = 2;

const isShopifyAbortError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError' || error.name === 'TimeoutError';
};

const formatShopifyRequestError = (error: unknown) => {
  if (isShopifyAbortError(error)) {
    return `timed out after ${SHOPIFY_REQUEST_TIMEOUT_MS}ms`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'unknown error';
};

const fetchShopifyAttempt = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SHOPIFY_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchShopifyWithTimeout = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= SHOPIFY_REQUEST_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fetchShopifyAttempt(input, init);
    } catch (error) {
      lastError = error;
      if (!isShopifyAbortError(error) || attempt === SHOPIFY_REQUEST_MAX_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw lastError;
};

export { fetchShopifyWithTimeout, formatShopifyRequestError, isShopifyAbortError, SHOPIFY_REQUEST_MAX_ATTEMPTS, SHOPIFY_REQUEST_TIMEOUT_MS };
