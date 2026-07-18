import type { NextConfig } from "next";
import path from "node:path";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    // Static assets
    {
      urlPattern: /^https?.*\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 120,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    // API Endpoints (Strict NetworkFirst)
    {
      urlPattern: /^https?:\/\/.*\/api\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 4,
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    // Authenticated Pages (Strict NetworkFirst to prevent session leak)
    {
      urlPattern: /^https?:\/\/.*\/(?:staff|customer)\/?.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "auth-pages-cache",
        networkTimeoutSeconds: 4,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    // Public Pages (StaleWhileRevalidate)
    {
      urlPattern: /^https?:\/\/.*$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "public-pages-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
  ],
})(nextConfig);