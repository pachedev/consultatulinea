import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;
const AUTH_HEADER = "Basic N3U4ZThyNjF0OGwwbnRmZ3I5dmozaWhpN2U6a3FvYzNoYzIyZW9nYmVlazdyZWVzNnZqMW81cHFhMzlxcjg4aWVmZ3A3YTRudjd1aXFx";

function signal12s(): AbortController {
  const c = new AbortController();
  setTimeout(() => c.abort(), TIMEOUT_MS);
  return c;
}

export async function lookupCURPInIENTC(curp: string): Promise<LineResult> {
  try {
    const authForm = new FormData();
    authForm.append("grant_type", "client_credentials");

    const authRes = await fetch("https://api-iso-prod.ientc.dev/auth/jwt/token", {
      method: "POST",
      headers: { ...BROWSER_HEADERS, Authorization: AUTH_HEADER },
      body: authForm,
      signal: signal12s().signal,
    });

    if (!authRes.ok) {
      console.error(`[ientc] auth ${authRes.status} ${authRes.statusText}`);
      return {
        company: "IENTC",
        lines: [],
        temporaryUnavailable: authRes.status === 403 || authRes.status === 429,
        error: authRes.status !== 403 && authRes.status !== 429 ? "Failed to authenticate with IENTC" : undefined,
      };
    }

    const { access_token } = await authRes.json();

    const res = await fetch(
      `https://api-iso-prod.ientc.dev/vinculacion/number/get-phones?curp=${curp}`,
      {
        headers: { ...BROWSER_HEADERS, Authorization: `Bearer ${access_token}` },
        signal: signal12s().signal,
      },
    );

    if (res.status === 404) {
      const data = await res.json().catch(() => null);
      if (data?.detail?.code === "No hay usuarios con ese RFC o CURP") {
        return { company: "IENTC", lines: [], isRegistered: false };
      }
      console.error("[ientc] unexpected 404:", JSON.stringify(stripCURPs(data), null, 2));
      return { company: "IENTC", lines: [], error: "Unexpected error validating CURP with IENTC" };
    }

    if (!res.ok) {
      console.error(`[ientc] validation ${res.status} ${res.statusText}`);
      return {
        company: "IENTC",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error: res.status !== 403 && res.status !== 429 ? "Failed to validate CURP with IENTC" : undefined,
      };
    }

    const data = await res.json().catch(() => null);
    console.log("[ientc] registered:", JSON.stringify(stripCURPs(data), null, 2));
    return { company: "IENTC", lines: [], isRegistered: true, rawApiResponse: data };
  } catch (err) {
    console.error("[ientc]", (err as Error)?.name === "AbortError" ? "timeout" : err);
    return { company: "IENTC", lines: [], temporaryUnavailable: true };
  }
}
