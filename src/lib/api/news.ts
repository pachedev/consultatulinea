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
    const res = await backendFetch("/news", { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as NewsItem[];
  } catch {
    return [];
  }
}
