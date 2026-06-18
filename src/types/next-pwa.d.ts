declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PwaConfig = {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    fallbacks?: Record<string, string>;
    runtimeCaching?: unknown[];
  };

  export default function withPWA(config: PwaConfig): (nextConfig: NextConfig) => NextConfig;
}
