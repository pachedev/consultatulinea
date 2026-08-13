import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

// El portal de consulta se movió de www.virginmobile.mx a mi.virginmobile.mx
// (front Angular en /v1/consultatulinea). El host viejo ahora responde 301 de
// Cloudflare hacia HTML, así que el .json() tronaba y todo caía en el catch.
// El path del API es el mismo; solo cambió el host. Verificado 2026-08-13.
const BASE = "https://mi.virginmobile.mx";

export async function loookupCURPInVirginMobile(
  curp: string,
): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}/api/v1/public/consulta-linea/findMsisdn`, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/json",
        Origin: BASE,
        Referer: `${BASE}/v1/consultatulinea`,
      },
      body: JSON.stringify({ tipo_documento: "CURP", id_documento: curp }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[virgin-mobile] ${res.status} ${res.statusText}`);
      return {
        company: "Virgin Mobile",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Virgin Mobile"
            : undefined,
      };
    }

    const data = (await res.json()) as {
      data?: { total_lineas?: number; lineas?: string[] };
    } | null;

    // Sin optional chaining, una respuesta sin `data` (mantenimiento, error de
    // negocio con otro shape) tiraba un TypeError que el catch convertía en
    // "temporaryUnavailable", escondiendo el problema real.
    if (!data?.data || (data.data.total_lineas ?? 0) === 0) {
      return { company: "Virgin Mobile", lines: [], isRegistered: false };
    }

    return {
      company: "Virgin Mobile",
      lines: data.data.lineas ?? [],
      isRegistered: true,
      rawApiResponse: data,
    };
  } catch (err) {
    const isTimeout = (err as Error)?.name === "AbortError";
    console.error("[virgin-mobile]", isTimeout ? "timeout" : err);
    return {
      company: "Virgin Mobile",
      lines: [],
      temporaryUnavailable: true,
    };
  } finally {
    clearTimeout(timer);
  }
}
