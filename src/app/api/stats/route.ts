import { NextResponse } from "next/server";
import { fetchUsageStats } from "@/lib/api/stats";

/**
 * Contador de consultas para el cliente.
 *
 * El home se prerenderiza (ver `revalidate` en app/page.tsx) y ese prerender
 * ocurre durante `docker compose build`, cuando el backend todavía no existe:
 * si el número se resolviera en el servidor, la primera visita tras cada build
 * vería el home sin contador hasta la primera revalidación. Pidiéndolo desde el
 * cliente el HTML sigue siendo estático y el número siempre es el de ahora.
 *
 * La API key del backend no sale de aquí: esta ruta es el proxy.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await fetchUsageStats();
  if (!stats) {
    return NextResponse.json({ total_lookups: null }, { status: 503 });
  }
  return NextResponse.json(
    { total_lookups: stats.total_lookups },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } },
  );
}
