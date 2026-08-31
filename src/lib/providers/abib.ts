import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { proxyFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

export async function lookupCURPInABIB(curp: string): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await proxyFetch(`https://erp.abib.com.mx/api/lineas/${curp}`, {
      headers: { ...BROWSER_HEADERS, Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[abib] ${res.status} ${res.statusText}`);
      return {
        company: "ABIB",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with ABIB"
            : undefined,
      };
    }

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      error_code?: string;
      status?: unknown;
    } | null;

    if (data === null) {
      console.error("[abib] 200 con cuerpo no parseable");
      return { company: "ABIB", lines: [], temporaryUnavailable: true };
    }

    // Contrato real capturado del API el 2026-08-31:
    //   { success: false, message: "La CURP no cuenta con números vinculados",
    //     error_code: "CLIENT_NOT_FOUND", data: [] }
    // No trae ningún campo `status`, y el código anterior decidía con
    // `!data?.status` — que para esta forma es siempre true. O sea que sólo
    // podía reportar un acierto si alguna respuesta traía `status` truthy.
    // No tenemos capturada la respuesta de un CURP con líneas en ABIB, así que
    // no sabemos si eso llegaba a pasar; si el acierto usa el mismo sobre que
    // el "no encontrado", ABIB nunca reportó a nadie como registrado.
    // Ahora se decide sobre los campos que el API sí manda, y se conserva
    // `status` por si alguna ruta vieja todavía lo usa.
    if (data.error_code === "CLIENT_NOT_FOUND" || data.success === false) {
      return { company: "ABIB", lines: [], isRegistered: false };
    }

    if (data.success !== true && !data.status) {
      console.error("[abib] forma no reconocida:", stripCURPs(data));
      return { company: "ABIB", lines: [], temporaryUnavailable: true };
    }

    console.log(
      "[abib] registered:",
      JSON.stringify(stripCURPs(data), null, 2),
    );
    return {
      company: "ABIB",
      lines: [],
      isRegistered: true,
      rawApiResponse: data,
    };
  } catch (err) {
    console.error(
      "[abib]",
      (err as Error)?.name === "AbortError" ? "timeout" : err,
    );
    return { company: "ABIB", lines: [], temporaryUnavailable: true };
  } finally {
    clearTimeout(timer);
  }
}
