import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { proxyFetch } from "@/lib/providers/_proxy";
import { describeShape } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

export async function lookupCURPInBeneleit(curp: string): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await proxyFetch(
      `https://core.beneleit.talentonet.com/api/core/consulta_lineas_vinculacion?curp=${curp}`,
      {
        headers: { ...BROWSER_HEADERS, Accept: "application/json" },
        signal: controller.signal,
      },
    );

    if (res.status === 404) {
      const data = (await res.json().catch(() => null)) as {
        msg?: string;
      } | null;
      if (data?.msg === "No se encontraron registros para esta CURP.") {
        return { company: "Beneleit Móvil", lines: [], isRegistered: false };
      }
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      // Solo el tamaño: el cuerpo de error puede repetir datos del titular.
      console.error(
        `[beneleit] ${res.status} ${res.statusText} — cuerpo de ${body.length} caracteres`,
      );
      return {
        company: "Beneleit Móvil",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error:
          res.status !== 403 && res.status !== 429
            ? "Failed to validate CURP with Beneleit"
            : undefined,
      };
    }

    const data = await res.json().catch(() => null);
    console.log(
      "[beneleit] registered:",
      describeShape(data),
    );
    return { company: "Beneleit Móvil", lines: [], isRegistered: true };
  } catch (err) {
    console.error(
      "[beneleit]",
      (err as Error)?.name === "AbortError" ? "timeout" : err,
    );
    return { company: "Beneleit Móvil", lines: [], temporaryUnavailable: true };
  } finally {
    clearTimeout(timer);
  }
}
