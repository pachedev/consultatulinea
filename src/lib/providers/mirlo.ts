import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { proxyFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

export async function lookupCURPInMirlo(curp: string): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await proxyFetch(
      `https://apib.mirlo.com/api/v1/regulation/query/by-curp/${curp}`,
      {
        headers: { ...BROWSER_HEADERS, Accept: "application/json" },
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      console.error(`[mirlo] ${res.status} ${res.statusText}`);
      return {
        company: "Mirlo",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Mirlo"
            : undefined,
      };
    }

    const data = (await res.json().catch(() => null)) as {
      status?: number;
      message?: string;
    } | null;

    // Un cuerpo ilegible (página de error HTML con 200, respuesta vacía) no
    // confirma nada.
    if (data === null || typeof data !== "object") {
      console.error("[mirlo] 200 con cuerpo no parseable");
      return { company: "Mirlo", lines: [], temporaryUnavailable: true };
    }

    if (
      data.status === 404 &&
      data.message === "No se encontró titular con el CURP proporcionado"
    ) {
      return { company: "Mirlo", lines: [], isRegistered: false };
    }

    // Espejo exacto del falso positivo que upstream arregló en Sorcel: antes,
    // cualquier respuesta que no fuera ese mensaje literal se declaraba
    // acierto. Un error del API con otro texto (o el mensaje reescrito por
    // ellos) convertía un fallo en "tienes una línea a tu nombre".
    if (typeof data.status === "number" && data.status >= 400) {
      console.error(
        "[mirlo] error no reconocido:",
        JSON.stringify(stripCURPs(data)),
      );
      return { company: "Mirlo", lines: [], temporaryUnavailable: true };
    }

    console.log(
      "[mirlo] registered:",
      JSON.stringify(stripCURPs(data), null, 2),
    );
    return {
      company: "Mirlo",
      lines: [],
      isRegistered: true,
      rawApiResponse: data,
    };
  } catch (err) {
    console.error(
      "[mirlo]",
      (err as Error)?.name === "AbortError" ? "timeout" : err,
    );
    return { company: "Mirlo", lines: [], temporaryUnavailable: true };
  } finally {
    clearTimeout(timer);
  }
}
