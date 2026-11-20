import { fetchNews } from "@/lib/api/news";
import { AlertBannerClient } from "./AlertBannerClient";

/** Avisos de /news. Se usa en el inicio y en /operadores. */
export async function AlertBanner({ className }: { className?: string }) {
  const news = await fetchNews();
  if (!news.length) return null;
  return <AlertBannerClient items={news} className={className} />;
}
