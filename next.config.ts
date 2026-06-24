import type { NextConfig } from 'next';

import { getShopifyFrameAncestors } from './src/shopify/config';

const frameAncestors = getShopifyFrameAncestors().join(' ');

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  turbopack: {},
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' ${frameAncestors};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
