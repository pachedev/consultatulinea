import { PROVIDER_TIMEOUT_MS } from "@/lib/data/content";
import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { residentialFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const COMPANY = "Newww";
const possibleProviders = ["Newww", "RedAguila", "Link Movil"];

// core.newww.mx rechazaba la conexión desde la IP del servidor
// (ConnectTimeoutError, no un 403): un descarte por reputación de rango, no por
// fingerprint. Sale por el proxy residencial, igual que Nextor Movil.
export async function loookupCURPInTalentoNetMVNO(
  curp: string,
): Promise<LineResult> {
  try {
    const res = await residentialFetch(
      `https://core.newww.mx/api/core/consulta_lineas_vinculacion?curp=${curp}`,
      {
        headers: { ...BROWSER_HEADERS, Accept: "application/json" },
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      },
    );

    // Su 404 significa dos cosas distintas y sólo el cuerpo las separa: "esta
    // CURP no tiene líneas" o "esta ruta no existe / el WAF te cortó". Sin
    // mirar `msg` estaríamos afirmando "sin registro" a partir de un status
    // code, que es justo el error que produce falsos negativos.
    if (res.status === 404) {
      const data = (await res.json().catch(() => null)) as {
        msg?: string;
      } | null;

      if (data?.msg === "No se encontraron registros para esta CURP.") {
        return {
          company: COMPANY,
          lines: [],
          possibleProviders,
          isRegistered: false,
        };
      }

      console.error(
        "[talentonet] 404 con cuerpo inesperado:",
        stripCURPs(data),
      );
      return {
        company: COMPANY,
        lines: [],
        possibleProviders,
        temporaryUnavailable: true,
      };
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[talentonet] ${res.status} ${res.statusText} — ${body}`);
      return {
        company: COMPANY,
        lines: [],
        possibleProviders,
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Newww"
            : undefined,
      };
    }

    const data = await res.json().catch(() => null);

    // Un 200 con cuerpo ilegible no confirma nada; no lo convertimos en un "sí".
    if (data === null) {
      console.error("[talentonet] 200 con cuerpo no parseable");
      return {
        company: COMPANY,
        lines: [],
        possibleProviders,
        temporaryUnavailable: true,
      };
    }

    console.log(
      "[talentonet] registered response:",
      JSON.stringify(stripCURPs(data), null, 2),
    );
    return {
      company: COMPANY,
      lines: [],
      possibleProviders,
      isRegistered: true,
      rawApiResponse: data,
    };
  } catch (err) {
    const name = (err as Error)?.name;
    const isTimeout = name === "TimeoutError" || name === "AbortError";
    console.error("[talentonet]", isTimeout ? "timeout" : err);
    return {
      company: COMPANY,
      lines: [],
      possibleProviders,
      temporaryUnavailable: true,
    };
  }
}
