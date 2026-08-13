import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

// El portal viejo (miespacio.weex.mx) ya no consulta líneas. El actual es
// weex.mx/consultalineas.html, un React que pega a este ServiceLayer sin auth,
// sin cookies y sin captcha. Verificado 2026-08-13.
const ENDPOINT =
  "https://app.weex.mx/ServiceLayer/Legislacion?ex=getDnActiveLines";

// documentType del portal: 1 = CURP, 2 = pasaporte, 3 = RFC.
const DOCUMENT_TYPE_CURP = 1;

type WeexResponse = {
  obj?: {
    dnActiveByCurpRfc?: Array<{
      msisdn?: string;
      provider?: string;
      id?: number | string;
      searchData?: string;
    }>;
  };
  error?: { code?: number; message?: string; retry?: number };
};

export async function loookupCURPINWeeex(curp: string): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/json",
        Origin: "https://weex.mx",
        Referer: "https://weex.mx/consultalineas.html",
      },
      body: JSON.stringify({
        documentType: DOCUMENT_TYPE_CURP,
        searchData: curp,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[weex] ${res.status} ${res.statusText}`);
      return {
        company: "Weex",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Weex"
            : undefined,
      };
    }

    const data = (await res.json()) as WeexResponse | null;

    // El portal trata cualquier error.code distinto de 0 como fallo del
    // servicio, no como "sin líneas": no podemos afirmar que no hay registro.
    if (data?.error?.code !== undefined && data.error.code !== 0) {
      console.error(
        `[weex] error de negocio ${data.error.code}: ${data.error.message ?? ""}`,
      );
      return { company: "Weex", lines: [], temporaryUnavailable: true };
    }

    const found = data?.obj?.dnActiveByCurpRfc ?? [];

    if (found.length === 0) {
      return { company: "Weex", lines: [], isRegistered: false };
    }

    // El API devuelve el número completo: lo enmascaramos aquí para no
    // exponerlo nunca al cliente (misma convención que Logistica ACN).
    const lines = found.map(
      (e) => `${e.provider ?? "Weex"}: ******${(e.msisdn ?? "").slice(-4)}`,
    );

    return { company: "Weex", lines, isRegistered: true };
  } catch (err) {
    const isTimeout = (err as Error)?.name === "AbortError";
    console.error("[weex]", isTimeout ? "timeout" : err);
    return { company: "Weex", lines: [], temporaryUnavailable: true };
  } finally {
    clearTimeout(timer);
  }
}
