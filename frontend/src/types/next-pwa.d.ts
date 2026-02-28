declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  function withPWAInit(config: {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    [key: string]: unknown;
  }): (nextConfig: NextConfig) => NextConfig;

  export default withPWAInit;
}
