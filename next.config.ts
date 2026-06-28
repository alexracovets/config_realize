import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  turbopack: {},
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
