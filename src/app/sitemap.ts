import type { MetadataRoute } from "next";
import { getOperatorSlugs } from "@/lib/operatorPages";

const BASE = "https://consultatulinea.mx";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: now,
      priority: 1,
      changeFrequency: "weekly",
    },
    {
      url: `${BASE}/operadores`,
      lastModified: now,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${BASE}/aviso-de-privacidad`,
      lastModified: now,
      priority: 0.3,
      changeFrequency: "yearly",
    },
  ];

  const operatorRoutes: MetadataRoute.Sitemap = getOperatorSlugs().map(
    (slug) => ({
      url: `${BASE}/operadores/${slug}`,
      lastModified: now,
      priority: 0.5,
      changeFrequency: "monthly",
    }),
  );

  return [...staticRoutes, ...operatorRoutes];
}
