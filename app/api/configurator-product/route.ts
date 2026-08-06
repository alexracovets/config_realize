import { resolveConfiguratorProduct } from '@shopify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug')?.trim();
  const collectionHandle = searchParams.get('collectionHandle')?.trim() || undefined;

  if (!slug) {
    return Response.json({ error: 'Missing slug.' }, { status: 400 });
  }

  try {
    const product = await resolveConfiguratorProduct(slug, collectionHandle);
    return Response.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return Response.json({ error: message }, { status: 502 });
  }
}
