import { PROVIDER_TIMEOUT_MS } from "@/lib/data/content";
import { describeShape, maskMsisdn } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const COMPANY = "Viasat";

// Endpoint del portal viasatprepago.com.mx/vinculatulinea. Sin auth, sin
// captcha y sin proxy. Verificado el 2026-11-20 con una CURP ficticia:
// {"result":"success","code":1,"data":{"list":[]}}. Portado de MisLíneas
// (c9af90f) sin `rawApiResponse`.
const ENDPOINT = "https://viasatprepago.com.mx/services/service.php";

type ViasatLink = {
  DN?: string | number;
  linkStatus?: string;
};

type ViasatResponse = {
  result?: string;
  data?: { list?: ViasatLink[] | null };
};

const STATUS_SUFFIX: Record<string, string> = {
  IN_PROCESS: " (en proceso de validación)",
  REQUESTED: " (en proceso de validación)",
};

export async function lookupCURPInViasat(curp: string): Promise<LineResult> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://viasatprepago.com.mx",
        Referer: "https://viasatprepago.com.mx/vinculatulinea/",
      },
      body: new URLSearchParams({ RFC: "", CURP: curp, action: "checkDNLink" }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`[viasat] ${res.status} ${res.statusText}`);
      return {
        company: COMPANY,
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Viasat"
            : undefined,
      };
    }

    const data = (await res.json()) as ViasatResponse | null;
    const list = data?.data?.list;

    // Solo un éxito explícito con lista (aunque venga vacía) se toma como
    // respuesta. Cualquier otra forma no permite afirmar "sin registro".
    if (data?.result !== "success" || !Array.isArray(list)) {
      console.error("[viasat] respuesta no reconocida:", describeShape(data));
      return { company: COMPANY, lines: [], temporaryUnavailable: true };
    }

    // Un vínculo rechazado no es una línea activa.
    const active = list.filter((l) => l?.DN && l.linkStatus !== "REJECTED");

    if (active.length === 0) {
      return { company: COMPANY, lines: [], isRegistered: false };
    }

    // El DN llega completo: se enmascara aquí y no sale de esta línea.
    return {
      company: COMPANY,
      lines: active.map(
        (l) =>
          `Viasat: ${maskMsisdn(l.DN)}${STATUS_SUFFIX[l.linkStatus ?? ""] ?? ""}`,
      ),
      isRegistered: true,
    };
  } catch (err) {
    const name = (err as Error)?.name;
    const isTimeout = name === "TimeoutError" || name === "AbortError";
    console.error("[viasat]", isTimeout ? "timeout" : err);
    return { company: COMPANY, lines: [], temporaryUnavailable: true };
  }
}
