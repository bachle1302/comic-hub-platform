import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/me",
          "/me/*",
          "/api",
          "/api/*",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
