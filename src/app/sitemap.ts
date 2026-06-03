import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = APP_URL;
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/app`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
