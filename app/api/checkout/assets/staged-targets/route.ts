import { createStagedUploadTargets } from '@shopify/createStagedUploadTargets';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const MAX_FILES_PER_REQUEST = 50;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPE_PREFIXES = ['image/', 'application/pdf', 'application/json'];

type rateLimitEntryType = {
  count: number;
  resetAt: number;
};

const rateLimitStoreKey = '__checkoutAssetsStagedTargetsRateLimitStore__';
const globalRateLimitStore = globalThis as typeof globalThis & {
  [rateLimitStoreKey]?: Map<string, rateLimitEntryType>;
};
const rateLimitStore = globalRateLimitStore[rateLimitStoreKey] ?? new Map<string, rateLimitEntryType>();
globalRateLimitStore[rateLimitStoreKey] = rateLimitStore;

type stagedTargetRequestFileType = {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
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

const isValidFileInput = (file: stagedTargetRequestFileType): boolean => {
  if (!file.id?.trim() || !file.filename?.trim()) return false;
  if (!Number.isFinite(file.fileSize) || file.fileSize <= 0 || file.fileSize > MAX_FILE_SIZE_BYTES) return false;
  return ALLOWED_MIME_TYPE_PREFIXES.some((prefix) => file.mimeType.startsWith(prefix));
};

export async function POST(request: Request): Promise<Response> {
  if (!isTrustedOrigin(request)) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const identifier = resolveClientIp(request);
  if (isRateLimited(identifier)) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: { files?: stagedTargetRequestFileType[] };

  try {
    body = (await request.json()) as { files?: stagedTargetRequestFileType[] };
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

  const rejected = files.filter((file) => !isValidFileInput(file));
  if (rejected.length) {
    console.error(
      '[checkout/assets/staged-targets] Rejected file payload:',
      rejected.map((file) => ({ id: file.id, filename: file.filename, mimeType: file.mimeType, fileSize: file.fileSize })),
    );
    return Response.json({ error: 'Invalid file payload.' }, { status: 400 });
  }

  try {
    const targets = await createStagedUploadTargets(
      files.map((file) => ({
        filename: file.filename,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
      })),
    );

    return Response.json({
      targets: files.map((file, index) => ({
        id: file.id,
        target: targets[index],
      })),
    });
  } catch (error) {
    console.error('[checkout/assets/staged-targets] Failed to create staged targets.', error);
    return Response.json({ error: 'Failed to create staged upload targets.' }, { status: 502 });
  }
}
