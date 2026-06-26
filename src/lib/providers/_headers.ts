// Algunos portales (p. ej. AT&T) tienen un WAF que bloquea peticiones sin un
// User-Agent de navegador real. El fetch del servidor (undici) no envía uno por
// defecto, así que lo agregamos para que las consultas no sean rechazadas (403).
export const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-MX,es;q=0.9",
};
