import path from 'node:path';
import type { NextConfig } from 'next';

const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST;
const customRemotePattern = (() => {
  if (!imageHost) return null;
  try {
    const raw =
      imageHost.startsWith('http://') || imageHost.startsWith('https://')
        ? imageHost
        : `http://${imageHost}`;
    const parsed = new URL(raw);
    return {
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: '/**',
    };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ojs/types'],
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      ...(customRemotePattern ? [customRemotePattern] : []),
    ],
  },
};

export default nextConfig;
