import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { residentialFetch as proxyFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;
const BASE = "https://consultavinculacion.megamovil.mx";

// Debe coincidir con el nombre usado en operators.ts, _portals.ts y
// consultaUrls.ts: si no, ni el portal de consulta manual ni el override de
// estado del backend hacen match con las tarjetas de resultados.
const COMPANY = "Mega Móvil";

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

    const validationRes = await proxyFetch(`${BASE}/validaCURP?curp=${curp}`, {
      headers: { ...BROWSER_HEADERS, Cookie: cookies },
      signal: signal12s().signal,
    });

    if (!validationRes.ok) {
      const body = await validationRes.text().catch(() => "(unreadable)");
      console.error(
        `[megamovil] validation ${validationRes.status} ${validationRes.statusText} — ${body}`,
      );
      return {
        company: COMPANY,
        lines: [],
        temporaryUnavailable:
          validationRes.status === 403 || validationRes.status === 429,
        error:
          validationRes.status !== 403 && validationRes.status !== 429
            ? "Failed to validate CURP with Mega Móvil"
            : undefined,
      };
    }

    const data = (await validationRes.json()) as {
      message?: string;
      status?: string;
      code?: string;
    } | null;

    // status "ERROR" es rechazo de validación (CURP mal formada, error general
    // del portal): no hay nada que listar.
    if (data?.status === "ERROR") {
      return { company: COMPANY, lines: [], isRegistered: false };
    }

    // OJO: la semántica de `code` es al revés de lo que parece, y el portal la
    // cambió (app.js?220120260000). Su propio JS hace:
    //   code == "0" → window.location.href = 'list.jsp'   (SÍ hay líneas)
    //   else        → muestra el form que pide 10 dígitos (NO hay líneas por CURP)
    // Antes tratábamos code "0" como "sin registro" y pegábamos a list.jsp en el
    // caso contrario, que es justo cuando no hay sesión que listar: list.jsp
    // respondía 500 y cada consulta salía como "temporalmente no disponible".
    // Verificado 2026-08-13: CURP sin líneas → OK/code "1", list.jsp → 500.
    if (data?.code !== "0") {
      return { company: COMPANY, lines: [], isRegistered: false };
    }

    const listRes = await proxyFetch(`${BASE}/list.jsp`, {
      headers: { ...BROWSER_HEADERS, Cookie: cookies },
      signal: signal12s().signal,
    });

    // Aquí sí sabemos que hay líneas (code "0"), pero no cuáles: sin list.jsp no
    // podemos enumerarlas, así que reportamos indisponible con el portal oficial
    // en lugar de devolver un "sin registro" falso.
    if (!listRes.ok) {
      await listRes.body?.cancel().catch(() => {});
      console.error(
        `[megamovil] list.jsp ${listRes.status} ${listRes.statusText}`,
      );
      return { company: COMPANY, lines: [], temporaryUnavailable: true };
    }

    const html = await listRes.text().catch(() => "");
    const lines = html.match(/(\*{6}\d{4})/g) ?? [];

    console.log(
      "[megamovil] registered:",
      JSON.stringify(stripCURPs(data), null, 2),
    );

    // code "0" ya confirma vinculación; si el HTML cambió y no pudimos extraer
    // los números, marcamos registrada sin líneas (el front muestra
    // "Número oculto") en vez de perder el dato.
    return {
      company: COMPANY,
      lines,
      isRegistered: true,
      rawApiResponse: data,
    };
  } catch (err) {
    console.error(
      "[megamovil]",
      (err as Error)?.name === "AbortError" ? "timeout" : err,
    );
    return { company: COMPANY, lines: [], temporaryUnavailable: true };
  }
}
