import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

export async function loookupCURPInVirginMobile(
  curp: string,
): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      "https://www.virginmobile.mx/api/v1/public/consulta-linea/findMsisdn",
      {
        method: "POST",
        headers: {
          ...BROWSER_HEADERS,
          "Content-Type": "application/json",
          Origin: "https://www.virginmobile.mx",
          Referer: "https://www.virginmobile.mx/",
        },
        body: JSON.stringify({ tipo_documento: "CURP", id_documento: curp }),
        signal: controller.signal,
      },
    );

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

    const data = await res.json();

    if (data.data.total_lineas === 0) {
      return { company: "Virgin Mobile", lines: [], isRegistered: false };
    }

    return {
      company: "Virgin Mobile",
      lines: data.data?.lineas ?? [],
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
