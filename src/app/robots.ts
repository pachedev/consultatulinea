import type { MetadataRoute } from "next";

const BASE = "https://consultatulinea.mx";

// Rastreadores de motores de respuesta con IA. Se listan explícitamente para
// dejar constancia de que el proyecto SÍ quiere aparecer en ChatGPT, Claude,
// Perplexity y demás: es tráfico de gente buscando justo lo que hacemos.
//
// OJO: Cloudflare puede anteponer su bloque "Managed robots.txt" a este
// archivo y ahí estos mismos agentes salen con `Disallow: /`, que gana. Si
// robots.txt en producción no coincide con lo de aquí, revisa AI Crawl Control
// en el panel de Cloudflare.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Bingbot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: "/api/",
      })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
