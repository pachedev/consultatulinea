import { FormData } from "undici";
import { PROVIDER_TIMEOUT_MS } from "@/lib/data/content";
import { residentialFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const COMPANY = "Sorcel";
const ENDPOINT = "https://www.soriup.mx/consultaR.asp";

const NO_RECORDS = "No hay registros para esa RFC/CURP";

// Cloudflare descarta a Sorcel por reputación de IP de datacenter, no por
// fingerprint TLS: verificado el 2026-08-31 comparando `fetch` de undici contra
// `curl` desde una IP residencial — ambos 200, respuesta idéntica byte por byte.
// Por eso basta con salir por el proxy residencial; no hace falta impersonar el
// ClientHello de Chrome.
// FormData viene de undici, no del global: `residentialFetch` es el fetch de
// undici y su tipo de body no acepta el FormData de lib.dom.
export async function lookupCURPInSorcel(curp: string): Promise<LineResult> {
  const form = new FormData();
  form.append("curpa", curp);

  try {
    const res = await residentialFetch(ENDPOINT, {
      method: "POST",
      // NO mandar User-Agent aquí, a diferencia del resto de providers. El WAF
      // de Sorcel devuelve 403 a cualquier petición que se declare Chrome
      // cuando el fingerprint TLS no lo es — decir ser Chrome sin serlo es más
      // sospechoso que no decir nada. Medido contra el endpoint el 2026-08-31:
      // sin headers 200, con UA de Chrome 403, sólo UA 403, todos los headers
      // menos el UA 200. El resto sí conviene: Accept-Encoding recorta el
      // tráfico que pasa por el proxy residencial, facturado por GB.
      //
      // Sin Content-Type explícito: undici tiene que poner el boundary del
      // multipart él mismo.
      headers: {
        Accept: "text/html,*/*",
        "Accept-Language": "es-MX,es;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: form,
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`[sorcel] ${res.status} ${res.statusText}`);
      return {
        company: COMPANY,
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Sorcel"
            : undefined,
      };
    }

    const html = await res.text();

    // ORDEN IMPORTANTE: este chequeo va primero, y `isSorcelPage` después.
    // Ver el comentario de abajo.
    if (html.includes(NO_RECORDS)) {
      return { company: COMPANY, lines: [], isRegistered: false };
    }

    // Confirma que lo que llegó es la página de Sorcel y no una interposición
    // (challenge de Cloudflare, 5xx del hosting, portal cautivo). Antes, la
    // ausencia de NO_RECORDS bastaba para declarar `isRegistered: true`, y una
    // página de Cloudflare pasaba por un acierto: falso positivo confirmado
    // upstream con CURPs de usuarios reales.
    //
    // Ojo con el nombre: NO identifica un acierto. La plantilla de Sorcel
    // renderiza el armazón de la tabla también cuando no hay registros
    // (verificado: la página de "sin registros" contiene ambos marcadores), así
    // que esto sólo dice "esto es Sorcel". Distinguir acierto de no-acierto
    // depende del `includes(NO_RECORDS)` de arriba: si alguien invierte el orden
    // de los dos bloques, el falso positivo vuelve.
    const isSorcelPage =
      html.includes("Listado de líneas") && html.includes('<table class="esp"');

    if (!isSorcelPage) {
      // El snippet va a los logs del servidor: fuera el CURP por si la
      // página lo reflejara.
      console.error(
        "[sorcel] respuesta no reconocida:",
        stripCURPs(html.slice(0, 500)),
      );
      return { company: COMPANY, lines: [], temporaryUnavailable: true };
    }

    return {
      company: COMPANY,
      lines: [],
      isRegistered: true,
      rawApiResponse: { responseType: "html", snippet: html.slice(0, 500) },
    };
  } catch (err) {
    const name = (err as Error)?.name;
    const isTimeout = name === "TimeoutError" || name === "AbortError";
    console.error("[sorcel]", isTimeout ? "timeout" : err);
    return { company: COMPANY, lines: [], temporaryUnavailable: true };
  }
}
