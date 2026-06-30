import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { residentialFetch as proxyFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;
const BASE = "https://consultavinculacion.megamovil.mx";

function signal12s(): AbortController {
  const c = new AbortController();
  setTimeout(() => c.abort(), TIMEOUT_MS);
  return c;
}

export async function lookupCURPInMegamovil(curp: string): Promise<LineResult> {
  try {
    const sessionRes = await proxyFetch(BASE, {
      headers: BROWSER_HEADERS,
      signal: signal12s().signal,
    });
    const cookies = sessionRes.headers.getSetCookie().join(";");
    // Solo necesitamos el Set-Cookie: descartamos el HTML de la home sin
    // descargarlo entero → ahorra ancho de banda del proxy residencial.
    await sessionRes.body?.cancel().catch(() => {});

    const validationRes = await proxyFetch(
      `${BASE}/validaCURP?curp=${curp}`,
      {
        headers: { ...BROWSER_HEADERS, Cookie: cookies },
        signal: signal12s().signal,
      },
    );

    if (!validationRes.ok) {
      const body = await validationRes.text().catch(() => "(unreadable)");
      console.error(`[megamovil] validation ${validationRes.status} ${validationRes.statusText} — ${body}`);
      return {
        company: "Megamovil",
        lines: [],
        temporaryUnavailable: validationRes.status === 403 || validationRes.status === 429,
        error: validationRes.status !== 403 && validationRes.status !== 429
          ? "Failed to validate CURP with Megamovil"
          : undefined,
      };
    }

    const data = await validationRes.json() as { message?: string; status?: string } | null;

    if (
      data?.message === "La CURP ingresada no cuenta con líneas Mega móvil vinculadas." ||
      data?.status === "ERROR"
    ) {
      return { company: "Megamovil", lines: [], isRegistered: false };
    }

    const listRes = await proxyFetch(`${BASE}/list.jsp`, {
      headers: { ...BROWSER_HEADERS, Cookie: cookies },
      signal: signal12s().signal,
    });
    const html = await listRes.text().catch(() => "");
    const lines = html.match(/(\*{6}\d{4})/g) ?? [];

    console.log("[megamovil] registered:", JSON.stringify(stripCURPs(data), null, 2));
    return { company: "Megamovil", lines, isRegistered: true, rawApiResponse: data };
  } catch (err) {
    console.error("[megamovil]", (err as Error)?.name === "AbortError" ? "timeout" : err);
    return { company: "Megamovil", lines: [], temporaryUnavailable: true };
  }
}
