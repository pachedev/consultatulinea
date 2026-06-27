import { fetchNews } from "@/lib/api/news";
import { AlertBannerClient } from "./AlertBannerClient";

export async function AlertBanner() {
  const news = await fetchNews();
  if (!news.length) return null;
  return <AlertBannerClient items={news} />;
}
