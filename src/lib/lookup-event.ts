import { backendFetch } from "@/lib/api/backend";
import { transformApiResponse } from "@/lib/lookup";
import type { ProviderResponse } from "@/types";

export type LookupOutcome = "completed" | "aborted" | "timeout";

export type LookupEvent = {
  scanned_count: number;
  operators_covered: number;
  confirmed_count: number;
  possible_count: number;
  error_count: number;
  has_results: boolean;
  providers_queried: number;
  provider_requests: number;
  cache_hits: number;
  outcome: LookupOutcome;
  duration_ms: number;
};

/**
 * Resume una consulta en conteos ANÓNIMOS. Aquí no entra la CURP, la IP ni
 * ningún número: solo cuántas cosas pasaron.
 */
export function buildLookupEvent(
  responses: ProviderResponse[],
  meta: {
    providersQueried: number;
    cacheHits: number;
    outcome: LookupOutcome;
    durationMs: number;
  },
): LookupEvent {
  const confirmed = responses.filter(
    (r) => (r.result.lines?.length ?? 0) > 0,
  ).length;
  return {
    // Filas del stream. Se conserva por compatibilidad con el historial.
    scanned_count: responses.length,
    // Marcas que esas respuestas cubren: Red Altan resuelve decenas en una
    // sola petición, así que las filas por sí solas subestiman el alcance.
    operators_covered: transformApiResponse(responses).length,
    confirmed_count: confirmed,
    possible_count: responses.filter(
      (r) => (r.result.possibleProviders?.length ?? 0) > 0,
    ).length,
    error_count: responses.filter(
      (r) => !!r.result.error || r.result.temporaryUnavailable,
    ).length,
    has_results: confirmed > 0,
    providers_queried: meta.providersQueried,
    // Peticiones que SÍ salieron hacia un operador.
    provider_requests: Math.max(0, meta.providersQueried - meta.cacheHits),
    cache_hits: meta.cacheHits,
    outcome: meta.outcome,
    duration_ms: Math.max(0, Math.round(meta.durationMs)),
  };
}

/**
 * Envía el evento al backend sin bloquear ni romper la consulta: si el
 * backend no responde, el evento se pierde y el usuario no se entera.
 */
export function recordLookupEvent(event: LookupEvent): void {
  backendFetch("/events", {
    method: "POST",
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(5_000),
    cache: "no-store",
  }).catch(() => {});
}
