import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { buildShopifyFrameAncestorsHeader } from '@shopify';

export function proxy(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');
  const host = request.nextUrl.searchParams.get('host');
  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', buildShopifyFrameAncestorsHeader(shop, host));

  return response;
}

export const config = {
  matcher: '/:path*',
};
