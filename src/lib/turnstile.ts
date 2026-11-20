/**
 * Verificación server-side de Cloudflare Turnstile.
 *
 * Se llama ANTES de consultar a cualquier operador. La falta de configuración
 * nunca abre la puerta: sin clave o sin lista de hostnames se responde 503.
 * La única excepción es `next dev` sin clave, para no exigir un widget al
 * desarrollar en local.
 *
 * No se envía la CURP ni la IP del usuario a Cloudflare, y no se registran
 * tokens ni claves.
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerification =
  | { success: true }
  | {
      success: false;
      status: 403 | 503;
      code: "verification_required" | "verification_unavailable";
      error: string;
    };

const UNAVAILABLE = {
  success: false,
  status: 503,
  code: "verification_unavailable",
  error: "La verificación de seguridad no está disponible. Intenta más tarde.",
} as const;

const REJECTED = {
  success: false,
  status: 403,
  code: "verification_required",
  error: "Completa de nuevo la verificación de seguridad para consultar.",
} as const;

export async function verifyTurnstile(
  token: unknown,
  action = "lookup",
): Promise<TurnstileVerification> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Solo con las claves dummy de Cloudflare, que no devuelven el hostname ni
  // la acción reales. Nunca activar en producción.
  const testing = process.env.TURNSTILE_TESTING === "true";
  const hostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean);

  if (!secret) {
    return process.env.NODE_ENV === "development"
      ? { success: true }
      : UNAVAILABLE;
  }
  if (!testing && hostnames.length === 0) return UNAVAILABLE;
  if (typeof token !== "string" || !token.trim() || token.length > 2048) {
    return REJECTED;
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) return UNAVAILABLE;

    const result = (await response.json()) as {
      success?: unknown;
      hostname?: unknown;
      action?: unknown;
    } | null;
    if (!result || typeof result !== "object") return UNAVAILABLE;
    if (result.success !== true) return REJECTED;
    if (testing) return { success: true };

    return typeof result.hostname === "string" &&
      hostnames.includes(result.hostname) &&
      result.action === action
      ? { success: true }
      : REJECTED;
  } catch {
    return UNAVAILABLE;
  }
}
