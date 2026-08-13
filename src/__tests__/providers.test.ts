import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACTIVE_LOOKUP_PROVIDERS } from "@/lib/data/content";
import { lookupCURPInMegamovil } from "@/lib/providers/megamovil";
import { loookupCURPInVirginMobile } from "@/lib/providers/virgin-mobile";
import { loookupCURPINWeeex } from "@/lib/providers/weex";

// Mega Móvil sale por el proxy residencial, no por el fetch global.
const proxyFetch = vi.hoisted(() => vi.fn());
vi.mock("@/lib/providers/_proxy", () => ({
  residentialFetch: proxyFetch,
  proxyFetch,
  hasProxy: false,
  hasResidentialProxy: false,
}));

const CURP = "PABG960529HMCCTR00";

function mockFetch(
  body: unknown,
  init: { ok?: boolean; status?: number } = {},
) {
  const ok = init.ok ?? true;
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: init.status ?? (ok ? 200 : 500),
    statusText: ok ? "OK" : "Error",
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ACTIVE_LOOKUP_PROVIDERS", () => {
  // La barra de progreso divide entre esta constante. Si alguien agrega o
  // comenta un provider en la ruta y no la actualiza, el avance miente.
  it("coincide con los providers activos de /api/lookup", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/lookup/route.ts"),
      "utf8",
    );
    const active = source
      .split("\n")
      .filter((line) => /^\s{4}provider: "/.test(line)).length;

    expect(active).toBe(ACTIVE_LOOKUP_PROVIDERS);
  });
});

describe("weex", () => {
  // Respuesta real capturada del portal (2026-08-13).
  it("reporta sin registro cuando no hay líneas", async () => {
    mockFetch({ obj: { dnActiveByCurpRfc: [] }, error: { code: 0, retry: 0 } });

    const result = await loookupCURPINWeeex(CURP);

    expect(result.isRegistered).toBe(false);
    expect(result.lines).toEqual([]);
    expect(result.error).toBeUndefined();
  });

  it("enmascara los números que devuelve el API", async () => {
    mockFetch({
      obj: {
        dnActiveByCurpRfc: [
          { msisdn: "5551234567", provider: "Weex", id: 1, searchData: CURP },
        ],
      },
      error: { code: 0, retry: 0 },
    });

    const result = await loookupCURPINWeeex(CURP);

    expect(result.isRegistered).toBe(true);
    expect(result.lines).toEqual(["Weex: ******4567"]);
    // El número completo nunca debe salir del provider.
    expect(JSON.stringify(result)).not.toContain("5551234567");
  });

  it("no afirma 'sin registro' ante un error de negocio", async () => {
    mockFetch({ obj: {}, error: { code: 99, message: "falla" } });

    const result = await loookupCURPINWeeex(CURP);

    expect(result.temporaryUnavailable).toBe(true);
    expect(result.isRegistered).toBeUndefined();
  });
});

describe("mega móvil", () => {
  // El portal responde `code` al revés de lo que sugiere el nombre:
  // "0" = hay líneas vinculadas, cualquier otro = no hay (pide un número).
  const session = {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: { getSetCookie: () => ["JSESSIONID=abc"] },
    body: { cancel: async () => {} },
  };

  const jsonRes = (json: unknown) => ({ ...session, json: async () => json });
  const htmlRes = (html: string, ok = true) => ({
    ...session,
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? "OK" : "Server Error",
    text: async () => html,
  });

  beforeEach(() => {
    proxyFetch.mockReset();
  });

  it("no consulta list.jsp cuando el código dice que no hay líneas", async () => {
    proxyFetch
      .mockResolvedValueOnce(session)
      .mockResolvedValueOnce(jsonRes({ status: "OK", message: "", code: "1" }));

    const result = await lookupCURPInMegamovil(CURP);

    expect(result.isRegistered).toBe(false);
    expect(result.temporaryUnavailable).toBeUndefined();
    // home + validaCURP, sin list.jsp: pegarle ahí devuelve 500 y ensuciaba el
    // resultado con un "temporalmente no disponible" falso.
    expect(proxyFetch).toHaveBeenCalledTimes(2);
  });

  it("lista las líneas cuando el código es 0", async () => {
    proxyFetch
      .mockResolvedValueOnce(session)
      .mockResolvedValueOnce(jsonRes({ status: "OK", message: "", code: "0" }))
      .mockResolvedValueOnce(htmlRes("<td>******4567</td><td>******8899</td>"));

    const result = await lookupCURPInMegamovil(CURP);

    expect(result.company).toBe("Mega Móvil");
    expect(result.isRegistered).toBe(true);
    expect(result.lines).toEqual(["******4567", "******8899"]);
  });

  it("marca indisponible si list.jsp falla tras confirmar vinculación", async () => {
    proxyFetch
      .mockResolvedValueOnce(session)
      .mockResolvedValueOnce(jsonRes({ status: "OK", message: "", code: "0" }))
      .mockResolvedValueOnce(htmlRes("<html>error</html>", false));

    const result = await lookupCURPInMegamovil(CURP);

    expect(result.temporaryUnavailable).toBe(true);
    expect(result.isRegistered).toBeUndefined();
  });

  it("trata status ERROR como sin registro", async () => {
    proxyFetch
      .mockResolvedValueOnce(session)
      .mockResolvedValueOnce(
        jsonRes({ status: "ERROR", message: "CURP inválida", code: "2" }),
      );

    const result = await lookupCURPInMegamovil(CURP);

    expect(result.isRegistered).toBe(false);
  });
});

describe("virgin mobile", () => {
  it("consulta el host nuevo (mi.virginmobile.mx)", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: { id_documento: CURP, lineas: [], total_lineas: 0 },
    });

    const result = await loookupCURPInVirginMobile(CURP);

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://mi.virginmobile.mx/api/v1/public/consulta-linea/findMsisdn",
    );
    expect(result.isRegistered).toBe(false);
  });

  it("no truena si la respuesta viene sin data", async () => {
    mockFetch({ success: false, message: "en mantenimiento" });

    const result = await loookupCURPInVirginMobile(CURP);

    expect(result.isRegistered).toBe(false);
    expect(result.temporaryUnavailable).toBeUndefined();
  });

  it("devuelve las líneas cuando hay registro", async () => {
    mockFetch({
      success: true,
      data: { id_documento: CURP, lineas: ["******4567"], total_lineas: 1 },
    });

    const result = await loookupCURPInVirginMobile(CURP);

    expect(result.isRegistered).toBe(true);
    expect(result.lines).toEqual(["******4567"]);
  });
});
