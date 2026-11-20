const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

// Cleanup old entries every 5 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60_000).unref();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  /** Segundos hasta que se reinicia la ventana de esta IP. */
  retryAfter: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      retryAfter: WINDOW_MS / 1000,
    };
  }

  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, retryAfter };
}

/**
 * IP del cliente para el límite de peticiones.
 *
 * `x-forwarded-for` lo puede escribir el propio cliente si el proxy de borde
 * no lo sanea. Si el despliegue tiene un encabezado que solo fija el proxy
 * (por ejemplo `cf-connecting-ip` detrás de Cloudflare), declararlo en
 * TRUSTED_IP_HEADER hace que se use ese y se ignore el resto.
 */
export function clientIp(headers: Headers): string {
  const trusted = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (trusted) {
    const value = headers.get(trusted)?.trim();
    if (value) return value;
  }
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
