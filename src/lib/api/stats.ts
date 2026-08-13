import { backendFetch } from "./backend";

export interface UsageStats {
  total_lookups: number;
  total_events: number;
  total_operators_covered: number;
  since: string | null;
}

/**
 * Métricas agregadas de uso. Devuelve `null` —no un objeto en ceros— cuando el
 * backend no responde: quien lo consuma debe ocultar la sección por completo en
 * lugar de mostrar un contador vacío o inventado. La consulta de líneas no
 * depende de esto, así que un backend caído no rompe nada del home.
 */
export async function fetchUsageStats(): Promise<UsageStats | null> {
  try {
    // A diferencia de /status y /news, aquí sí cacheamos: el número no cambia
    // de forma relevante en un minuto y evita pegarle al backend en cada visita.
    const res = await backendFetch("/stats", { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<UsageStats> | null;
    if (typeof data?.total_lookups !== "number") return null;
    return {
      total_lookups: data.total_lookups,
      total_events: data.total_events ?? 0,
      total_operators_covered: data.total_operators_covered ?? 0,
      since: data.since ?? null,
    };
  } catch {
    return null;
  }
}
