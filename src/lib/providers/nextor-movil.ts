import { PROVIDER_TIMEOUT_MS } from "@/lib/data/content";
import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { residentialFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const COMPANY = "Nextor Movil";
const BASE = "https://vinculacion.nextormovil.mx/api/consulta";

// Su API limita por IP de forma agresiva y rechaza rangos de datacenter, así que
// sale por el proxy residencial.
//
// Las dos peticiones (iniciar + pre-check) comparten `residentialFetch`, que es
// un dispatcher singleton: reutilizan conexión y salen por la misma IP. Eso es
// un requisito, no una optimización — el `sessionId` que devuelve /iniciar queda
// ligado a la IP que lo pidió, y presentarlo desde otra invalida la sesión.
export async function lookupCURPINNextorMovil(
  curp: string,
): Promise<LineResult> {
  try {
    const authRes = await residentialFetch(`${BASE}/iniciar`, {
      method: "POST",
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    if (!authRes.ok) {
      const data = (await authRes.json().catch(() => null)) as {
        code?: string;
      } | null;

      // Un rate limit no es una consulta fallida: es una consulta que nunca
      // ocurrió. Como `error` se mostraba igual que un 500 del operador.
      if (data?.code === "IP_RATE_LIMIT") {
        console.warn("[nextor-movil] rate limit por IP", data);
        return { company: COMPANY, lines: [], temporaryUnavailable: true };
      }

      console.error(
        `[nextor-movil] iniciar ${authRes.status} ${authRes.statusText}`,
      );
      return {
        company: COMPANY,
        lines: [],
        temporaryUnavailable: authRes.status === 403 || authRes.status === 429,
        error:
          authRes.status !== 403 && authRes.status !== 429
            ? "Failed to initiate session with Nextor Movil"
            : undefined,
      };
    }

    const authData = (await authRes.json().catch(() => null)) as {
      sessionId?: string;
    } | null;

    // Sin sessionId no hay consulta que hacer. Seguir adelante mandaría un
    // header vacío y el 4xx resultante se leería como "sin registro".
    if (!authData?.sessionId) {
      console.error("[nextor-movil] iniciar respondió 200 sin sessionId");
      return { company: COMPANY, lines: [], temporaryUnavailable: true };
    }

    const res = await residentialFetch(`${BASE}/pre-check`, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/json",
        "X-Session-Id": authData.sessionId,
      },
      body: JSON.stringify({ tipo: "curp", valor: curp }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(
        `[nextor-movil] pre-check ${res.status} ${res.statusText} — ${body}`,
      );
      return {
        company: COMPANY,
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Nextor Movil"
            : undefined,
      };
    }

    const data = (await res.json().catch(() => null)) as {
      encontrado?: boolean;
    } | null;

    // Detección positiva: `encontrado` tiene que venir y ser booleano. Si la
    // forma cambia, un `undefined` se leería como "no encontrado" y le diríamos
    // al usuario que no tiene líneas sin haberlo comprobado.
    if (typeof data?.encontrado !== "boolean") {
      console.error(
        "[nextor-movil] respuesta sin campo `encontrado`:",
        stripCURPs(data),
      );
      return { company: COMPANY, lines: [], temporaryUnavailable: true };
    }

    if (data.encontrado) {
      console.log(
        "[nextor-movil] registered response:",
        JSON.stringify(stripCURPs(data), null, 2),
      );
      return {
        company: COMPANY,
        lines: [],
        isRegistered: true,
        rawApiResponse: data,
      };
    }

    return { company: COMPANY, lines: [], isRegistered: false };
  } catch (err) {
    const name = (err as Error)?.name;
    const isTimeout = name === "TimeoutError" || name === "AbortError";
    console.error("[nextor-movil]", isTimeout ? "timeout" : err);
    return { company: COMPANY, lines: [], temporaryUnavailable: true };
  }
}
