import type { MetadataRoute } from "next";
import { getIndexableOperatorSlugs } from "@/lib/data/operatorProfiles";

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

  // Solo las fichas con contenido propio. Publicar las 108 metía al índice un
  // centenar de páginas casi idénticas, que es lo que abarata el dominio
  // entero; las demás se sirven con `noindex, follow`.
  const operatorRoutes: MetadataRoute.Sitemap = getIndexableOperatorSlugs().map(
    (slug) => ({
      url: `${BASE}/operadores/${slug}`,
      lastModified: now,
      priority: 0.5,
      changeFrequency: "monthly",
    }),
  );

  return [...staticRoutes, ...operatorRoutes];
}
