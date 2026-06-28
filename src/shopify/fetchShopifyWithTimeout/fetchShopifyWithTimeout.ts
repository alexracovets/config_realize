const SHOPIFY_REQUEST_TIMEOUT_MS = 2_500;

const fetchShopifyWithTimeout = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SHOPIFY_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export { fetchShopifyWithTimeout, SHOPIFY_REQUEST_TIMEOUT_MS };
