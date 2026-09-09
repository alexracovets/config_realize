const BIND_HOSTNAMES = new Set(['0.0.0.0', '::', '[::]', 'localhost', '127.0.0.1', '::1']);

const readEnv = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value || undefined;
};

const isPublicHostname = (hostname: string): boolean => {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || BIND_HOSTNAMES.has(host)) return false;
  if (host.endsWith('.localhost')) return false;
  return true;
};

const parsePublicAppOrigin = (value: string | null | undefined): string | null => {
  if (!value) return null;

  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!isPublicHostname(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
};

const firstHeaderValue = (value: string | null): string | null => {
  const first = value?.split(',')[0]?.trim();
  return first || null;
};

const originFromEnv = (): string | null => parsePublicAppOrigin(readEnv('APP_ORIGIN') ?? readEnv('APP_URL'));

const resolvePublicAppOrigin = (request: Request): string | null => {
  const fromEnv = originFromEnv();
  if (fromEnv) return fromEnv;

  const requestUrl = new URL(request.url);
  const proto = firstHeaderValue(request.headers.get('x-forwarded-proto')) ?? requestUrl.protocol.replace(':', '') ?? 'https';

  const forwardedHost = firstHeaderValue(request.headers.get('x-forwarded-host'));
  if (forwardedHost) {
    const origin = parsePublicAppOrigin(`${proto}://${forwardedHost}`);
    if (origin) return origin;
  }

  const host = firstHeaderValue(request.headers.get('host'));
  if (host) {
    const origin = parsePublicAppOrigin(`${proto}://${host}`);
    if (origin) return origin;
  }

  return parsePublicAppOrigin(requestUrl.origin);
};

const buildPublicAssetDownloadUrl = (origin: string | null, fileUrl: string, filename: string): string => {
  const publicOrigin = parsePublicAppOrigin(origin);
  if (!publicOrigin) return fileUrl;

  const url = new URL('/api/download', publicOrigin);
  url.searchParams.set('url', fileUrl);
  url.searchParams.set('filename', filename);
  return url.toString();
};

export { buildPublicAssetDownloadUrl, parsePublicAppOrigin, resolvePublicAppOrigin };
