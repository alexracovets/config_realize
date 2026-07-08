export const dynamic = 'force-dynamic';

/** Only files we uploaded to Shopify Files may be proxied — anything else would make this an open proxy. */
const ALLOWED_DOWNLOAD_HOSTS = new Set(['cdn.shopify.com']);
const isAllowedDownloadHost = (hostname: string) =>
  ALLOWED_DOWNLOAD_HOSTS.has(hostname) || hostname.endsWith('.shopifycdn.com');

const sanitizeDownloadFilename = (filename: string) =>
  filename.replace(/[\\/:*?"<>|\r\n]/g, '').trim() || 'download';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const filename = sanitizeDownloadFilename(searchParams.get('filename') ?? '');

  if (!fileUrl) {
    return Response.json({ error: 'Missing "url" parameter.' }, { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return Response.json({ error: 'Invalid "url" parameter.' }, { status: 400 });
  }

  if (parsedUrl.protocol !== 'https:' || !isAllowedDownloadHost(parsedUrl.hostname)) {
    return Response.json({ error: 'URL host is not allowed.' }, { status: 400 });
  }

  const upstream = await fetch(parsedUrl, { cache: 'no-store' });

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: 'File is not available.' }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=0',
    },
  });
}
