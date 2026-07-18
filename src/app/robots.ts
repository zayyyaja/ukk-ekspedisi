import type { MetadataRoute } from "next";
import { env } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.APP_URL;

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/offline"],
      disallow: ["/api/", "/staff/", "/customer/dashboard/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
