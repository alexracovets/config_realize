import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { buildShopifyFrameAncestorsHeader } from '@shopify';

export function proxy(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');
  const host = request.nextUrl.searchParams.get('host');

  // The configurator SSR needs to know, on the server, whether it is being rendered
  // inside the storefront iframe so the standalone <Header /> is kept out of the
  // initial HTML (see app/[collectionHandle]/[slug]/layout.tsx). It reads
  // Sec-Fetch-Dest for that — but Netlify strips the Sec-Fetch-* request headers
  // before the SSR handler runs. The proxy still sees them, so mirror the signal onto
  // a plain x-embedded header the layout can always read, and also honour the
  // ?embedded=1 the storefront mount puts on every iframe src.
  const embedded = request.headers.get('sec-fetch-dest') === 'iframe' || request.nextUrl.searchParams.get('embedded') === '1';

  const requestHeaders = new Headers(request.headers);
  if (embedded) {
    requestHeaders.set('x-embedded', '1');
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', buildShopifyFrameAncestorsHeader(shop, host));

  return response;
}

export const config = {
  matcher: '/:path*',
};
