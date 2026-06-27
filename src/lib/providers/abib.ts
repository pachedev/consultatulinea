import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

export async function lookupCURPInABIB(curp: string): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`https://erp.abib.com.mx/api/lineas/${curp}`, {
      headers: { ...BROWSER_HEADERS, Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[abib] ${res.status} ${res.statusText}`);
      return {
        company: "ABIB",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error: res.status !== 403 && res.status !== 429 ? "Failed to validate CURP with ABIB" : undefined,
      };
    }

    const data = await res.json();

    if (!data.status) {
      return { company: "ABIB", lines: [], isRegistered: false };
    }

    console.log("[abib] registered:", JSON.stringify(stripCURPs(data), null, 2));
    return { company: "ABIB", lines: [], isRegistered: true, rawApiResponse: data };
  } catch (err) {
    console.error("[abib]", (err as Error)?.name === "AbortError" ? "timeout" : err);
    return { company: "ABIB", lines: [], temporaryUnavailable: true };
  } finally {
    clearTimeout(timer);
  }
}
