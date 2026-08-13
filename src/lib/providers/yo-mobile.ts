import type { LineResult } from "@/types";

// Yo Mobile movió su consulta a mx.yomobile.com/consulta (Next.js). El API real
// es GET play.prod.yomobile.xyz/api/v1.0/crm/lines/by-personal-id/{CURP}/ con
// header X-PLATFORM: yo y sin auth, pero el host está detrás de un Managed
// Challenge de Cloudflare: responde 403 con `cf-mitigated: challenge` incluso
// con headers de navegador y HTTP/2. No es bloqueo por IP — es fingerprint TLS
// + JS, así que ningún proxy lo resuelve; haría falta curl-impersonate o un
// navegador headless. Verificado 2026-08-13.
// Mientras tanto el usuario consulta manualmente en el portal (ver _portals.ts).
export async function lookupCURPINYoMobile(_curp: string): Promise<LineResult> {
  return {
    company: "Yo Mobile",
    lines: [],
    error:
      "Yo Mobile bloquea las consultas automáticas con un desafío de Cloudflare. Consulta directamente en su portal.",
  };
}
