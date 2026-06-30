import { createHash } from "node:crypto";
import type { LineResult } from "@/types";

// Cache en memoria para evitar repetir consultas idénticas (mismo CURP+provider)
// dentro de una ventana corta. Reduce el ancho de banda del proxy residencial
// (facturado por GB) y la carga sobre las APIs de los operadores.
//
// - Clave hasheada (SHA-256): el CURP es PII y no se guarda en claro.
// - Solo cachea resultados DEFINITIVOS (sin error ni temporaryUnavailable), para
//   que los fallos transitorios se reintenten en la siguiente consulta.
// - Dedup de requests concurrentes: si llegan dos consultas idénticas a la vez,
//   comparten la misma llamada en vuelo en lugar de pegarle dos veces al proxy.
// - Solo en memoria (no disco), con TTL y tope de entradas.

const TTL_MS = Number(process.env.LOOKUP_CACHE_TTL_MS ?? 10 * 60 * 1000);
const MAX_ENTRIES = Number(process.env.LOOKUP_CACHE_MAX_ENTRIES ?? 5000);

type Value = LineResult | LineResult[];
type Entry = { value: Value; expires: number };

const store = new Map<string, Entry>();
const pending = new Map<string, Promise<Value>>();

function keyFor(provider: string, curp: string): string {
  const hash = createHash("sha256").update(curp).digest("hex");
  return `${provider}:${hash}`;
}

function isCacheable(value: Value): boolean {
  const arr = Array.isArray(value) ? value : [value];
  return arr.every((r) => !r.error && !r.temporaryUnavailable);
}

export async function cachedLookup(
  provider: string,
  curp: string,
  fn: (curp: string) => Promise<Value>,
): Promise<Value> {
  const key = keyFor(provider, curp);
  const now = Date.now();

  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value;
  if (hit) store.delete(key); // expirado

  // Dedup: reutiliza una consulta idéntica que ya está en vuelo.
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const value = await fn(curp);
    if (isCacheable(value)) {
      if (store.size >= MAX_ENTRIES) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { value, expires: Date.now() + TTL_MS });
    }
    return value;
  })();

  pending.set(key, promise);
  try {
    return await promise;
  } finally {
    pending.delete(key);
  }
}
