import { FormData } from "undici";
import { PROVIDER_TIMEOUT_MS } from "@/lib/data/content";
import { newResidentialSession } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const COMPANY = "Sorcel";
const ENDPOINT = "https://www.soriup.mx/consultaR.asp";

const NO_RECORDS = "No hay registros para esa RFC/CURP";

// Cloudflare bloquea algunas IPs de salida del proxy ("Attention Required") o
// les pone un challenge ("Just a moment..."). Cada intento abre una conexión
// nueva y el proxy rota la IP por conexión, así que reintentar suele caer en una
// salida limpia en vez de perder la tarjeta. Portado de MisLíneas (5178b43).
const MAX_ATTEMPTS = 3;
const CLOUDFLARE_BLOCK =
  /Attention Required! \| Cloudflare|Just a moment\.\.\.|challenge-platform/;
// Estados con los que Cloudflare o el WAF rechazan una IP concreta.
const BLOCK_STATUSES = new Set([403, 429, 503]);

const BLOCKED = Symbol("blocked");

type Fetch = ReturnType<typeof newResidentialSession>["fetch"];

// Cloudflare descarta a Sorcel por reputación de IP de datacenter, no por
// fingerprint TLS: verificado el 2026-08-31 comparando `fetch` de undici contra
// `curl` desde una IP residencial — ambos 200, respuesta idéntica byte por byte.
// Por eso basta con salir por el proxy residencial; no hace falta impersonar el
// ClientHello de Chrome.
// FormData viene de undici, no del global: el fetch del proxy es el de undici y
// su tipo de body no acepta el FormData de lib.dom.
async function attempt(
  fetchFn: Fetch,
  curp: string,
  signal: AbortSignal,
): Promise<LineResult | typeof BLOCKED> {
  // El body se consume en cada envío: FormData nuevo por intento.
  const form = new FormData();
  form.append("curpa", curp);

  const res = await fetchFn(ENDPOINT, {
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
    signal,
  });

  if (!res.ok) {
    console.error(`[sorcel] ${res.status} ${res.statusText}`);
    if (BLOCK_STATUSES.has(res.status)) {
      await res.body?.cancel().catch(() => {});
      return BLOCKED;
    }
    return {
      company: COMPANY,
      lines: [],
      error: "Failed to validate CURP with Sorcel",
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

  if (isSorcelPage) {
    return { company: COMPANY, lines: [], isRegistered: true };
  }

  if (CLOUDFLARE_BLOCK.test(html)) return BLOCKED;

  // El snippet va a los logs del servidor: fuera CURP y teléfonos por si la
  // página los reflejara.
  console.error(
    "[sorcel] respuesta no reconocida:",
    stripCURPs(html.slice(0, 500)),
  );
  return { company: COMPANY, lines: [], temporaryUnavailable: true };
}

export async function lookupCURPInSorcel(curp: string): Promise<LineResult> {
  // Un solo presupuesto para todos los intentos: el route corta al proveedor
  // en PROVIDER_TIMEOUT_MS de todos modos, así que los reintentos tienen que
  // caber dentro, no sumarse.
  const signal = AbortSignal.timeout(PROVIDER_TIMEOUT_MS);

  try {
    for (let n = 1; n <= MAX_ATTEMPTS; n++) {
      const session = newResidentialSession();
      try {
        const outcome = await attempt(session.fetch, curp, signal);
        if (outcome !== BLOCKED) return outcome;
        console.warn(`[sorcel] bloqueo de Cloudflare en el intento ${n}`);
      } finally {
        void session.close();
      }
    }
    return { company: COMPANY, lines: [], temporaryUnavailable: true };
  } catch (err) {
    const name = (err as Error)?.name;
    const isTimeout = name === "TimeoutError" || name === "AbortError";
    console.error("[sorcel]", isTimeout ? "timeout" : err);
    return { company: COMPANY, lines: [], temporaryUnavailable: true };
  }
}
