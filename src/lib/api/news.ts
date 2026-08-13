import { backendFetch } from "./backend";

export type NewsLevel = "info" | "warning" | "critical";

export interface NewsItem {
  id: number;
  title: string;
  body: string;
  level: NewsLevel;
  published_at: string | null;
  created_at: string;
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    // Este fetch vive en el layout raíz, así que su modo de caché contagia a
    // TODA la app: con `no-store` ninguna ruta se prerenderizaba y el sitio
    // salía con `Cache-Control: no-store`, obligando a Google a renderizar
    // cada página en cada rastreo. Con revalidate el layout vuelve a ser
    // estático y los avisos siguen apareciendo a lo mucho 60s tarde.
    const res = await backendFetch("/news", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()) as NewsItem[];
  } catch {
    return [];
  }
}
