import { registerShopifyFiles } from '@shopify/registerShopifyFiles';
import type { shopifyFileContentType } from '@shopify/stagedUpload';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const MAX_FILES_PER_REQUEST = 50;

type rateLimitEntryType = {
  count: number;
  resetAt: number;
};

const rateLimitStoreKey = '__checkoutAssetsRegisterRateLimitStore__';
const globalRateLimitStore = globalThis as typeof globalThis & {
  [rateLimitStoreKey]?: Map<string, rateLimitEntryType>;
};
const rateLimitStore = globalRateLimitStore[rateLimitStoreKey] ?? new Map<string, rateLimitEntryType>();
globalRateLimitStore[rateLimitStoreKey] = rateLimitStore;

type registerRequestFileType = {
  id: string;
  resourceUrl: string;
  contentType: shopifyFileContentType;
};

const resolveClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (!forwardedFor) return 'unknown';
  const firstIp = forwardedFor.split(',')[0]?.trim();
  return firstIp || 'unknown';
};

const isTrustedOrigin = (request: Request): boolean => {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!forwardedHost) return false;

  const forwardedProto = request.headers.get('x-forwarded-proto') ?? (origin.startsWith('https://') ? 'https' : 'http');
  const expectedOrigin = `${forwardedProto}://${forwardedHost}`;

  return origin === expectedOrigin;
};

const isRateLimited = (identifier: string): boolean => {
  const now = Date.now();
  const current = rateLimitStore.get(identifier);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  return false;
};

const isValidRegisterFileInput = (file: registerRequestFileType): boolean => {
  if (!file.id?.trim() || !file.resourceUrl?.trim()) return false;
  if (!['IMAGE', 'FILE'].includes(file.contentType)) return false;

  try {
    const resourceUrl = new URL(file.resourceUrl);
    return resourceUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export async function POST(request: Request): Promise<Response> {
  if (!isTrustedOrigin(request)) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const identifier = resolveClientIp(request);
  if (isRateLimited(identifier)) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: { files?: registerRequestFileType[] };

  try {
    body = (await request.json()) as { files?: registerRequestFileType[] };
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const files = body.files ?? [];
  if (!files.length) {
    return Response.json({ error: 'Missing files.' }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return Response.json({ error: 'Too many files in one request.' }, { status: 400 });
  }

  const rejected = files.filter((file) => !isValidRegisterFileInput(file));
  if (rejected.length) {
    console.error(
      '[checkout/assets/register] Rejected file payload:',
      rejected.map((file) => ({ id: file.id, resourceUrl: file.resourceUrl, contentType: file.contentType })),
    );
    return Response.json({ error: 'Invalid file payload.' }, { status: 400 });
  }

  try {
    const urls = await registerShopifyFiles(
      files.map((file) => ({
        resourceUrl: file.resourceUrl,
        contentType: file.contentType,
      })),
    );

    return Response.json({
      files: files.map((file, index) => ({
        id: file.id,
        url: urls[index],
      })),
    });
  } catch (error) {
    console.error('[checkout/assets/register] Failed to register Shopify files.', error);
    return Response.json({ error: 'Failed to register Shopify files.' }, { status: 502 });
  }
}
