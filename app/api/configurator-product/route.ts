import { resolveConfiguratorProduct } from '@shopify';

export const dynamic = 'force-dynamic';

/**
 * Resolves the full configurator product hydration (model id + Shopify business, including the
 * size chart + `printReferenceCm`) for a product slug. Used by the client to lazily enrich cart
 * items added via the catalog, which otherwise carry only placeholder business data.
 */
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
