import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // chat sessions are per-link and not meant to be indexed
      disallow: "/chat/",
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
