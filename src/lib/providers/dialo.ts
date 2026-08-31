import { PROVIDER_TIMEOUT_MS } from "@/lib/data/content";
import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const COMPANY = "Dialo";
const ENDPOINT =
  "https://p737drx1pj.execute-api.us-east-1.amazonaws.com/prod/gestion-lineas";

type DialoResponse = {
  body?: { data?: Array<{ total?: number }> };
};

export async function lookupCURPInDialo(curp: string): Promise<LineResult> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...BROWSER_HEADERS,
        Origin: "https://dialo.mx",
        Referer: "https://dialo.mx",
      },
      body: JSON.stringify({
        operation: "count",
        data: { tipo_info_personal: curp },
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`[dialo] ${res.status} ${res.statusText}`);
      return {
        company: COMPANY,
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Dialo"
            : undefined,
      };
    }

    const data = (await res.json().catch(() => null)) as DialoResponse | null;

    // Detección positiva: `total` tiene que llegar y ser un número. Antes esto
    // era `data.body.data[0].total > 0` sin guardas: un sobre de error del
    // Lambda hacía que `total` fuera undefined, y `undefined > 0` es false, así
    // que le decíamos al usuario "sin registro" sin haber consultado nada.
    // Además los tres accesos encadenados reventaban con TypeError si la forma
    // cambiaba.
    const total = data?.body?.data?.[0]?.total;

    if (typeof total !== "number") {
      console.error(
        "[dialo] respuesta sin `total` numérico:",
        stripCURPs(data),
      );
      return { company: COMPANY, lines: [], temporaryUnavailable: true };
    }

    if (total > 0) {
      console.log(
        "[dialo] registered response:",
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
    console.error("[dialo]", isTimeout ? "timeout" : err);
    return { company: COMPANY, lines: [], temporaryUnavailable: true };
  }
}
