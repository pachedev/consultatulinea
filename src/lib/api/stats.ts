import { backendFetch } from "./backend";

export interface UsageStats {
  /** Veces que alguien consultó una CURP y la consulta terminó. */
  consultas: number;
  /** Peticiones reales a operadores (sin respuestas de caché). */
  verificacionesOperadores: number;
  consultas24h: number;
  /** Fecha del primer evento registrado (ISO), o null. */
  since: string | null;
  /** Momento en que el backend calculó estos números (ISO). */
  updatedAt: string | null;
}

/**
 * Métricas agregadas de uso. Devuelve `null` —no un objeto en ceros— cuando el
 * backend no responde: quien lo consuma debe decirlo en lugar de mostrar un
 * contador vacío o inventado. La consulta de líneas no depende de esto.
 *
 * Sin caché aquí: la única caché de la cadena es la del backend (30 s), y
 * `updatedAt` dice a qué momento corresponde el dato. Antes se apilaban tres
 * cachés y el número podía ir varios minutos atrasado sin que se notara.
 */
export async function fetchUsageStats(): Promise<UsageStats | null> {
  try {
    const res = await backendFetch("/stats", {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      consultas?: unknown;
      verificaciones_operadores?: unknown;
      consultas_24h?: unknown;
      since?: unknown;
      updated_at?: unknown;
    } | null;
    if (typeof data?.consultas !== "number") return null;
    return {
      consultas: data.consultas,
      verificacionesOperadores:
        typeof data.verificaciones_operadores === "number"
          ? data.verificaciones_operadores
          : 0,
      consultas24h:
        typeof data.consultas_24h === "number" ? data.consultas_24h : 0,
      since: typeof data.since === "string" ? data.since : null,
      updatedAt: typeof data.updated_at === "string" ? data.updated_at : null,
    };
  } catch {
    return null;
  }
}
