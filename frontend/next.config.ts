import type { NextConfig } from "next";
import withPWAInit from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));
