import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

export async function lookupCURPInBeneleit(curp: string): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://core.beneleit.talentonet.com/api/core/consulta_lineas_vinculacion?curp=${curp}`,
      {
        headers: { ...BROWSER_HEADERS, Accept: "application/json" },
        signal: controller.signal,
      },
    );

    if (res.status === 404) {
      const data = await res.json().catch(() => null);
      if (data?.msg === "No se encontraron registros para esta CURP.") {
        return { company: "Beneleit Móvil", lines: [], isRegistered: false };
      }
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[beneleit] ${res.status} ${res.statusText} — ${body}`);
      return {
        company: "Beneleit Móvil",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error: res.status !== 403 && res.status !== 429 ? "Failed to validate CURP with Beneleit" : undefined,
      };
    }

    const data = await res.json().catch(() => null);
    console.log("[beneleit] registered:", JSON.stringify(stripCURPs(data), null, 2));
    return { company: "Beneleit Móvil", lines: [], isRegistered: true, rawApiResponse: data };
  } catch (err) {
    console.error("[beneleit]", (err as Error)?.name === "AbortError" ? "timeout" : err);
    return { company: "Beneleit Móvil", lines: [], temporaryUnavailable: true };
  } finally {
    clearTimeout(timer);
  }
}
