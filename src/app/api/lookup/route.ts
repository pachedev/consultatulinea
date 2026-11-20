export const runtime = "nodejs";
export const maxDuration = 120;

import type { NextRequest } from "next/server";
import { PROVIDER_TIMEOUT_MS, QUERY_TIMEOUT_MS } from "@/lib/data/content";
import { buildLookupEvent, recordLookupEvent } from "@/lib/lookup-event";
import {
  lookupCURPINMobig,
  lookupCURPInAltanMVNO,
  lookupCURPInBeneleit,
  lookupCURPInFreedompop,
  lookupCURPInIENTC,
  lookupCURPInLogisticaACN,
  lookupCURPInMegamovil,
  lookupCURPInMirlo,
  lookupCURPInSorcel,
  lookupCURPInTelcel,
  lookupCURPInViasat,
  loookupCURPINWeeex,
  loookupCURPInVirginMobile,
} from "@/lib/providers";
import { cachedLookup } from "@/lib/providers/_cache";
import { getPortalUrl } from "@/lib/providers/_portals";
import { validateCURP } from "@/lib/providers/curp";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { stripCURPs, toPublicResult } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import type { LineResult, PublicLineResult } from "@/types";

// Disparar todos los providers a la vez son una docena de resoluciones DNS
// simultáneas, y cada host necesita registro A y AAAA. Bajo esa ráfaga el
// resolver empieza a contestar ENOTFOUND / EAI_AGAIN para hosts perfectamente
// alcanzables: un "ahorita no" indistinguible de "no existe", y el operador sano
// se reporta como fallido. Limitar cuántas consultas van en vuelo lo mantiene
// fuera de ese estado; los resultados siguen llegando en streaming conforme cada
// provider termina, así que la experiencia no cambia.
const LOOKUP_CONCURRENCY = 5;

// Reintentamos solo los fallos que una caché DNS tibia arregla. A propósito NO
// los timeouts: una petición que ya gastó todo su presupuesto es saturación o un
// socket muerto, y reintentarla dos veces convierte una consulta lenta en una de
// varios minutos.
const TRANSIENT_ERROR = /fetch failed|ENOTFOUND|EAI_AGAIN/i;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ProviderResponse = { provider: string; result: PublicLineResult };

// `code` es estable y pensado para el cliente; `error` es el texto que se
// muestra tal cual al usuario.
const fail = (
  status: number,
  code: string,
  error: string,
  headers?: Record<string, string>,
) => Response.json({ error, code }, { status, headers });

// Techo duro por proveedor. Compite contra la llamada, no la cancela: un
// proveedor que se pasa sigue corriendo en segundo plano hasta terminar solo.
// Lo que sí evita es que uno lento retenga el stream hasta que el watchdog del
// cliente aborte la consulta completa y se pierdan los resultados de todos.
const PROVIDER_TIMEOUT = "provider timeout";
const withProviderTimeout = <T>(promise: Promise<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(PROVIDER_TIMEOUT)),
      PROVIDER_TIMEOUT_MS,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

const providers: Array<{
  provider: string;
  lookupFunction: (curp: string) => Promise<LineResult | LineResult[]>;
}> = [
  // {
  //   provider: "AT&T",
  //   lookupFunction: lookupCURPInATT,
  //   // Deshabilitado: el portal usa Shape Security con challenge JS client-side.
  //   // Probado (2026-06-29) que devuelve 403 incluso desde IP residencial con un
  //   // cliente curl normal — NO es bloqueo por IP ni por fingerprint TLS, sino por
  //   // token anti-bot que solo genera un navegador ejecutando su JS. Ningún proxy
  //   // (Tor/Dante/residencial/comercial) lo resuelve. Requeriría Puppeteer stealth.
  //   // operators.ts lo marca como "paused" → el usuario consulta att.com.mx directo.
  //   //
  //   // Además, y más grave: según MisLíneas (88030e0, revisado 2026-11-16),
  //   // `validatecustomer` de att.com.mx/controlpersonal ahora devuelve la misma
  //   // respuesta enlatada (uuid fijo, 2 líneas terminadas en 4321) para
  //   // CUALQUIER entrada, incluso desde Chrome real en IP residencial.
  //   // Reactivarlo mostraría a todos dos líneas falsas. No reactivar hasta que
  //   // el endpoint vuelva a responder por CURP.
  // },
  {
    provider: "Telcel",
    lookupFunction: lookupCURPInTelcel,
  },
  {
    provider: "Altan MVNO",
    lookupFunction: lookupCURPInAltanMVNO,
  },
  // {
  //   provider: "ABIB",
  //   lookupFunction: lookupCURPInABIB,
  //   // Deshabilitado: erp.abib.com.mx/api/lineas responde 503 también sin
  //   // proxy (medido 2026-11-14). La referencia lo deshabilitó antes
  //   // (edc3484) porque el endpoint pasó a exigir autenticación. Cada
  //   // consulta solo producía una tarjeta "Error al consultar".
  // },
  {
    provider: "Beneleit Móvil",
    lookupFunction: lookupCURPInBeneleit,
  },
  // {
  //   provider: "Dialo",
  //   lookupFunction: lookupCURPInDialo,
  //   // Deshabilitado: su API Gateway
  //   // (p737drx1pj.execute-api.us-east-1.amazonaws.com) ya no existe en DNS
  //   // (NXDOMAIN, medido 2026-11-14) y dialo.mx no expone el reemplazo.
  //   // Reactivar cuando se encuentre el endpoint nuevo.
  // },
  {
    provider: "IENTC",
    lookupFunction: lookupCURPInIENTC,
  },
  {
    provider: "Logistica ACN (FedeGo!, Flash Mobile, Dua)",
    lookupFunction: lookupCURPInLogisticaACN,
  },
  {
    provider: "Mega Móvil",
    lookupFunction: lookupCURPInMegamovil,
  },
  {
    provider: "Mirlo",
    lookupFunction: lookupCURPInMirlo,
  },
  {
    provider: "MoBig",
    lookupFunction: lookupCURPINMobig,
  },
  // {
  //   provider: "Nextor Movil",
  //   lookupFunction: lookupCURPINNextorMovil,
  //   // Deshabilitado: la conexión falla por el proxy residencial (timeout).
  //   // Medido el 2026-08-31 contra el endpoint real: responde 200 desde una
  //   // IP doméstica mexicana, pero por el proxy contratado falla siempre. La
  //   // zona es ISP, no residencial, y sus rangos (WS Telecom Inc, AS209372 y
  //   // AS213541) están fichados. Forzar salida mexicana con -country-mx da
  //   // una IP MX legítima y tampoco pasa.
  // },
  {
    provider: "Sorcel",
    lookupFunction: lookupCURPInSorcel,
    // Reactivado el 2026-11-20: en producción el proxy residencial sí pasa.
    // Cloudflare todavía bloquea algunas IPs de salida, así que el provider
    // reintenta hasta 3 veces con una conexión nueva (otra IP) dentro del
    // mismo presupuesto de PROVIDER_TIMEOUT_MS (MisLíneas 5178b43). Sin
    // RESIDENTIAL_PROXY_URL sale directo y suele volver como
    // temporaryUnavailable con el enlace a su portal.
  },
  // {
  //   provider: "TalentoNet (Newww, Red Aguila, Link Móvil)",
  //   lookupFunction: loookupCURPInTalentoNetMVNO,
  //   // Deshabilitado: 1 acierto de cada 4 intentos por el proxy, y el acierto
  //   // llegó a 8.7s sobre un presupuesto de 12s. No es fiable.
  //   // Medido el 2026-08-31 contra el endpoint real: responde 200 desde una
  //   // IP doméstica mexicana, pero por el proxy contratado falla siempre. La
  //   // zona es ISP, no residencial, y sus rangos (WS Telecom Inc, AS209372 y
  //   // AS213541) están fichados. Forzar salida mexicana con -country-mx da
  //   // una IP MX legítima y tampoco pasa.
  // },
  {
    provider: "Virgin Mobile",
    lookupFunction: loookupCURPInVirginMobile,
  },
  {
    provider: "Weex",
    lookupFunction: loookupCURPINWeeex,
  },
  {
    provider: "Viasat",
    lookupFunction: lookupCURPInViasat,
  },
  // Vinoc (MisLíneas fa86318) no se porta: desde el 2026-11-20 kyc.n3t.mx
  // exige reCAPTCHA Enterprise en cada llamada (header X-Recaptcha-Token) y
  // responde 403 ERR_KYC_BOT_CHECK sin él. operators.ts lo marca "paused".
  {
    provider: "Freedompop",
    lookupFunction: lookupCURPInFreedompop,
  },
  // {
  //   provider: "Yo Mobile",
  //   lookupFunction: lookupCURPINYoMobile,
  //   // Deshabilitado: su API (play.prod.yomobile.xyz) está detrás de un Managed
  //   // Challenge de Cloudflare — responde 403 con `cf-mitigated: challenge`
  //   // incluso con headers de navegador y HTTP/2. Es fingerprint TLS + JS, no
  //   // reputación de IP, así que ningún proxy lo evita. Verificado 2026-08-13.
  //   // Confirmado de forma independiente por MisLíneas (f04f5d7, 2026-08-19):
  //   // mismo 403 desde su servidor directo, desde su proxy residencial y desde
  //   // una red doméstica ajena. A diferencia de Sorcel, aquí el proxy no ayuda.
  //   // Mantenerlo activo solo producía una tarjeta "Error al consultar" que
  //   // además duplicaba a la operadora: operators.ts ya la marca como "paused",
  //   // así que aparece en la sección de consulta manual con su portal correcto.
  // },
];

export async function POST(req: NextRequest) {
  const { allowed, remaining, retryAfter } = checkRateLimit(
    clientIp(req.headers),
  );

  if (!allowed) {
    return fail(
      429,
      "rate_limited",
      "Demasiadas consultas seguidas. Espera un momento e intenta de nuevo.",
      { "Retry-After": String(retryAfter) },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_body", "La solicitud no es válida.");
  }
  const curp =
    body && typeof body === "object" && "curp" in body ? body.curp : undefined;

  if (!curp || typeof curp !== "string") {
    return fail(400, "curp_required", "Ingresa tu CURP para consultar.");
  }
  if (!validateCURP(curp)) {
    return fail(400, "invalid_curp", "El formato de la CURP no es válido.");
  }

  // Ninguna operadora se consulta sin verificación válida.
  const verification = await verifyTurnstile(
    body && typeof body === "object" && "turnstileToken" in body
      ? body.turnstileToken
      : undefined,
  );
  if (!verification.success) {
    return fail(verification.status, verification.code, verification.error);
  }

  const startedAt = Date.now();
  const emitted: ProviderResponse[] = [];
  let providersQueried = 0;
  let cacheHits = 0;
  let cancelled = false;
  let reported = false;

  // El servidor es quien cuenta la consulta, una sola vez: al terminar el
  // stream o cuando el cliente lo corta. El navegador no reporta nada.
  const report = (outcome: "completed" | "aborted" | "timeout") => {
    if (reported) return;
    reported = true;
    recordLookupEvent(
      buildLookupEvent(emitted, {
        providersQueried,
        cacheHits,
        outcome,
        durationMs: Date.now() - startedAt,
      }),
    );
  };

  // Use a streaming response to return results as soon as they resolve
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const lookupWithRetry = async (
        p: (typeof providers)[number],
      ): Promise<ProviderResponse[]> => {
        let cached = true;
        try {
          for (let attempt = 0; ; attempt += 1) {
            try {
              // Se sanea ANTES de cachear: la caché solo debe retener lo
              // mismo que ve el navegador, nunca la respuesta cruda.
              const lookup = await withProviderTimeout(
                cachedLookup(p.provider, curp, async (c) => {
                  const raw = await p.lookupFunction(c);
                  return Array.isArray(raw)
                    ? raw.map(toPublicResult)
                    : toPublicResult(raw);
                }),
              );
              if (!lookup.cached) cached = false;
              const results = Array.isArray(lookup.value)
                ? lookup.value
                : [lookup.value];

              // Un fallo transitorio de red suele volver como campo `error`
              // poblado en lugar de un throw, así que hay que detectarlo
              // también en el camino "exitoso". La caché no guarda resultados
              // con error, así que el reintento sí vuelve a pegarle al
              // operador.
              const transient = results.some(
                (r) => r?.error && TRANSIENT_ERROR.test(r.error),
              );
              if (transient && attempt < MAX_RETRIES) {
                await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
                continue;
              }

              return results.map((r) => ({ provider: p.provider, result: r }));
            } catch (error) {
              cached = false;
              const message =
                error instanceof Error ? error.message : "Unknown error";

              if (message === PROVIDER_TIMEOUT) {
                // No se reintenta: ya gastó todo su presupuesto. Vuelve como
                // "no disponible" para que sea una tarjeta de ese proveedor y
                // no un error de toda la consulta.
                console.warn(`Lookup timed out for ${p.provider}`);
                return [
                  {
                    provider: p.provider,
                    result: {
                      company: p.provider,
                      lines: [],
                      temporaryUnavailable: true,
                    },
                  },
                ];
              }

              if (TRANSIENT_ERROR.test(message) && attempt < MAX_RETRIES) {
                await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
                continue;
              }

              console.error(`Lookup failed for ${p.provider}:`, error);
              return [
                {
                  provider: p.provider,
                  result: {
                    company: p.provider,
                    lines: [],
                    error: `Lookup failed: ${message}`,
                  },
                },
              ];
            }
          }
        } finally {
          providersQueried += 1;
          if (cached) cacheHits += 1;
        }
      };

      const emit = (response: ProviderResponse) => {
        // Última barrera antes del navegador: lista blanca de campos. Cubre
        // también los resultados de error que se arman en este archivo.
        const r = toPublicResult(response.result);
        // Si la consulta falló, adjunta el portal oficial (si existe)
        // para que el usuario consulte manualmente.
        if ((r.temporaryUnavailable || r.error) && !r.portalUrl) {
          const portal = getPortalUrl(response.provider);
          if (portal) r.portalUrl = portal;
        }
        const sanitized = stripCURPs({
          provider: response.provider,
          result: r,
        }) as ProviderResponse;
        emitted.push(sanitized);
        controller.enqueue(encoder.encode(`${JSON.stringify(sanitized)}\n`));
      };

      const queue = [...providers];
      const worker = async () => {
        for (;;) {
          // Si el cliente ya se fue, no se arrancan más proveedores.
          if (cancelled) return;
          const p = queue.shift();
          if (!p) return;

          for (const response of await lookupWithRetry(p)) {
            if (cancelled) return;
            emit(response);
          }
        }
      };

      await Promise.all(
        Array.from(
          { length: Math.min(LOOKUP_CONCURRENCY, providers.length) },
          worker,
        ),
      );
      if (cancelled) return;
      controller.close();
      report("completed");
    },
    cancel() {
      cancelled = true;
      // El watchdog del cliente corta a los QUERY_TIMEOUT_MS * 2; un corte a
      // esa altura es un timeout, antes es el usuario que se fue o relanzó.
      report(
        Date.now() - startedAt >= QUERY_TIMEOUT_MS * 2 - 1_000
          ? "timeout"
          : "aborted",
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
