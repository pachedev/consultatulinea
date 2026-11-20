import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACTIVE_LOOKUP_PROVIDERS } from "@/lib/data/content";

/**
 * Pruebas del route completo con providers simulados: ninguna petición real,
 * ninguna CURP real. Cubren la puerta de Turnstile, la lista blanca del
 * stream y el evento de uso que registra el servidor.
 */

const CURP = "PABG960529HMCCTR00";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  backend: vi.fn(),
  telcel: vi.fn(),
  generic: vi.fn(),
}));

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: mocks.verify }));
vi.mock("@/lib/api/backend", () => ({ backendFetch: mocks.backend }));
vi.mock("@/lib/providers", () => ({
  lookupCURPInTelcel: mocks.telcel,
  lookupCURPINMobig: mocks.generic,
  lookupCURPInABIB: mocks.generic,
  lookupCURPInAltanMVNO: mocks.generic,
  lookupCURPInBeneleit: mocks.generic,
  lookupCURPInDialo: mocks.generic,
  lookupCURPInFreedompop: mocks.generic,
  lookupCURPInIENTC: mocks.generic,
  lookupCURPInLogisticaACN: mocks.generic,
  lookupCURPInMegamovil: mocks.generic,
  lookupCURPInMirlo: mocks.generic,
  loookupCURPINWeeex: mocks.generic,
  loookupCURPInVirginMobile: mocks.generic,
  lookupCURPInViasat: mocks.generic,
  lookupCURPInSorcel: mocks.generic,
}));

const ALLOWED_KEYS = new Set([
  "company",
  "lines",
  "isRegistered",
  "possibleProviders",
  "possibleDisclaimer",
  "notFoundProviders",
  "error",
  "temporaryUnavailable",
  "portalUrl",
]);

let ipCounter = 0;
const request = (body: unknown, raw = false) =>
  new Request("http://localhost/api/lookup", {
    method: "POST",
    // IP distinta por petición para no chocar con el límite por IP.
    headers: { "x-forwarded-for": `10.0.0.${++ipCounter}` },
    body: raw ? (body as string) : JSON.stringify(body),
  });

async function post(body: unknown, raw = false) {
  const { POST } = await import("@/app/api/lookup/route");
  // biome-ignore lint/suspicious/noExplicitAny: el route solo usa la API estándar de Request.
  return POST(request(body, raw) as any);
}

const rows = async (res: Response) =>
  (await res.text())
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

const eventSent = () => JSON.parse(mocks.backend.mock.calls[0][1].body);

beforeEach(() => {
  // Otra CURP por prueba haría falta para esquivar la caché; en su lugar se
  // recarga el módulo, que la deja vacía.
  vi.resetModules();
  mocks.verify.mockReset().mockResolvedValue({ success: true });
  mocks.backend.mockReset().mockResolvedValue({ ok: true });
  mocks.generic
    .mockReset()
    .mockResolvedValue({ company: "X", lines: [], isRegistered: false });
  mocks.telcel
    .mockReset()
    .mockResolvedValue({ company: "Telcel", lines: [], isRegistered: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/lookup — validación", () => {
  it("400 con body que no es JSON", async () => {
    const res = await post("{no es json", true);
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid_body");
  });

  it("400 sin CURP o con CURP mal formada", async () => {
    expect((await (await post({})).json()).code).toBe("curp_required");
    expect((await (await post({ curp: "ABC" })).json()).code).toBe(
      "invalid_curp",
    );
    expect(mocks.verify).not.toHaveBeenCalled();
  });
});

describe("POST /api/lookup — Turnstile", () => {
  it("sin verificación válida no se consulta ningún operador", async () => {
    mocks.verify.mockResolvedValue({
      success: false,
      status: 403,
      code: "verification_required",
      error: "Completa de nuevo la verificación.",
    });
    const res = await post({ curp: CURP, turnstileToken: "malo" });

    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("verification_required");
    expect(mocks.telcel).not.toHaveBeenCalled();
    expect(mocks.generic).not.toHaveBeenCalled();
    expect(mocks.backend).not.toHaveBeenCalled();
  });

  it("pasa el token recibido al verificador", async () => {
    await (await post({ curp: CURP, turnstileToken: "tok-123" })).text();
    expect(mocks.verify).toHaveBeenCalledWith("tok-123");
  });
});

describe("POST /api/lookup — stream", () => {
  it("solo emite campos de la lista blanca, sin datos crudos del operador", async () => {
    mocks.telcel.mockResolvedValue({
      company: "Telcel",
      lines: ["Telcel: 5512340414"],
      isRegistered: true,
      rawApiResponse: { nombre: "PERSONA DE PRUEBA", dn: "5512340414" },
      otroCampoCrudo: { curp: CURP },
    });

    const res = await post({ curp: CURP, turnstileToken: "ok" });
    const text = await res.clone().text();
    const parsed = await rows(res);

    expect(res.status).toBe(200);
    expect(parsed).toHaveLength(ACTIVE_LOOKUP_PROVIDERS);
    for (const row of parsed) {
      expect(Object.keys(row).sort()).toEqual(["provider", "result"]);
      for (const key of Object.keys(row.result)) {
        expect(ALLOWED_KEYS.has(key), `campo inesperado: ${key}`).toBe(true);
      }
    }
    expect(text).not.toContain("5512340414");
    expect(text).not.toContain("PERSONA DE PRUEBA");
    expect(text).not.toContain(CURP);
    expect(text).toContain("******0414");
  });

  it("un proveedor que lanza error vuelve como tarjeta de error, no rompe el stream", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.telcel.mockRejectedValue(new Error("boom"));

    const parsed = await rows(await post({ curp: CURP, turnstileToken: "ok" }));
    const telcel = parsed.find((r) => r.provider === "Telcel");

    expect(parsed).toHaveLength(ACTIVE_LOOKUP_PROVIDERS);
    expect(telcel.result.error).toContain("boom");
  });
});

describe("POST /api/lookup — evento de uso", () => {
  it("el servidor registra UNA consulta al terminar, solo con conteos", async () => {
    mocks.telcel.mockResolvedValue({
      company: "Telcel",
      lines: ["Telcel: ******0414"],
      isRegistered: true,
    });

    await (await post({ curp: CURP, turnstileToken: "ok" })).text();

    expect(mocks.backend).toHaveBeenCalledTimes(1);
    expect(mocks.backend.mock.calls[0][0]).toBe("/events");
    const event = eventSent();
    expect(event).toMatchObject({
      outcome: "completed",
      providers_queried: ACTIVE_LOOKUP_PROVIDERS,
      provider_requests: ACTIVE_LOOKUP_PROVIDERS,
      cache_hits: 0,
      scanned_count: ACTIVE_LOOKUP_PROVIDERS,
      confirmed_count: 1,
      has_results: true,
    });
    for (const value of Object.values(event)) {
      expect(["number", "boolean", "string"]).toContain(typeof value);
    }
    expect(JSON.stringify(event)).not.toContain(CURP);
    expect(JSON.stringify(event)).not.toContain("0414");
  });

  it("una segunda consulta idéntica sale de caché y no cuenta peticiones a operadores", async () => {
    await (await post({ curp: CURP, turnstileToken: "ok" })).text();
    await (await post({ curp: CURP, turnstileToken: "ok" })).text();

    const second = JSON.parse(mocks.backend.mock.calls[1][1].body);
    expect(second.cache_hits).toBe(ACTIVE_LOOKUP_PROVIDERS);
    expect(second.provider_requests).toBe(0);
    expect(mocks.telcel).toHaveBeenCalledTimes(1);
  });

  it("si el backend falla, la consulta responde igual", async () => {
    mocks.backend.mockRejectedValue(new Error("backend caído"));
    const res = await post({ curp: CURP, turnstileToken: "ok" });
    expect(res.status).toBe(200);
    expect(await rows(res)).toHaveLength(ACTIVE_LOOKUP_PROVIDERS);
  });
});
