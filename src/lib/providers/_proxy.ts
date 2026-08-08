import { fetch as undiciFetch, ProxyAgent, Agent } from "undici";

/**
 * Crea un dispatcher (ProxyAgent si hay URL, Agent directo si no) y devuelve
 * un fetch que lo usa. Singleton por nivel para reutilizar conexiones TCP/TLS.
 * `rejectUnauthorized: false` cubre APIs con certs expirados/propietarios.
 */
// Mismo criterio que el dispatcher global de src/instrumentation.ts: varios
// operadores cierran su socket ocioso alrededor de los 30s mientras undici lo
// conserva hasta ~600s. Reutilizar uno ya muerto hace que la petición se cuelgue
// hasta agotar el timeout del provider. Desalojamos a los 10s.
const KEEP_ALIVE_MS = 10_000;

function makeProxyFetch(proxyUrl: string) {
  const dispatcher = proxyUrl
    ? new ProxyAgent({
        uri: proxyUrl,
        connect: { rejectUnauthorized: false },
        allowH2: false,
        keepAliveTimeout: KEEP_ALIVE_MS,
        keepAliveMaxTimeout: KEEP_ALIVE_MS,
      })
    : new Agent({
        connect: { rejectUnauthorized: false },
        allowH2: false,
        keepAliveTimeout: KEEP_ALIVE_MS,
        keepAliveMaxTimeout: KEEP_ALIVE_MS,
      });

  return function fetchWithDispatcher(
    url: string | URL,
    init?: Parameters<typeof undiciFetch>[1],
  ): ReturnType<typeof undiciFetch> {
    return undiciFetch(url, { ...init, dispatcher });
  };
}

// Nivel general: Tor (gratis, IP rotativa). Sirve para providers bloqueados por
// reputación de IP que NO bloquean nodos Tor: ABIB, Beneleit, IENTC, Mirlo.
const PROXY_URL = process.env.PROVIDER_PROXY_URL ?? "";
export const proxyFetch = makeProxyFetch(PROXY_URL);
export const hasProxy = Boolean(PROXY_URL);

// Nivel residencial: para providers cuyo WAF bloquea datacenter Y Tor, pero deja
// pasar IPs residenciales (Mega Móvil, Freedompop). En local apunta a Dante
// (sale por la IP del host). En prod requiere un proxy residencial comercial;
// si queda vacío, va directo y el provider fallará con temporaryUnavailable.
const RESIDENTIAL_PROXY_URL = process.env.RESIDENTIAL_PROXY_URL ?? "";
export const residentialFetch = makeProxyFetch(RESIDENTIAL_PROXY_URL);
export const hasResidentialProxy = Boolean(RESIDENTIAL_PROXY_URL);
