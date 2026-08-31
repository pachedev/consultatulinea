import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACTIVE_LOOKUP_PROVIDERS } from "@/lib/data/content";
import { lookupCURPInABIB } from "@/lib/providers/abib";
import { lookupCURPInDialo } from "@/lib/providers/dialo";
import { lookupCURPInMegamovil } from "@/lib/providers/megamovil";
import { lookupCURPInMirlo } from "@/lib/providers/mirlo";
import { lookupCURPINNextorMovil } from "@/lib/providers/nextor-movil";
import { lookupCURPInSorcel } from "@/lib/providers/sorcel";
import { loookupCURPInTalentoNetMVNO } from "@/lib/providers/talentonet/mvno";
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

// ── Providers reactivados vía proxy residencial (2026-08-31) ────────────────
// Los tres salen por `residentialFetch`, que el mock de arriba redirige a
// `proxyFetch`.

const res = (init: {
  ok?: boolean;
  status?: number;
  json?: unknown;
  text?: string;
}) => ({
  ok: init.ok ?? true,
  status: init.status ?? (init.ok === false ? 500 : 200),
  statusText: init.ok === false ? "Error" : "OK",
  json: async () => init.json,
  text: async () => init.text ?? "",
});

describe("sorcel", () => {
  // La plantilla de Sorcel renderiza el armazón de la tabla SIEMPRE, también
  // cuando no hay registros. Verificado contra el endpoint real el 2026-08-31.
  const TABLE = 'Listado de líneas <table class="esp">';
  const NO_RECORDS = `${TABLE} No hay registros para esa RFC/CURP`;

  beforeEach(() => proxyFetch.mockReset());

  it("reporta sin registro con la página de 'no hay registros'", async () => {
    proxyFetch.mockResolvedValueOnce(res({ text: NO_RECORDS }));

    const result = await lookupCURPInSorcel(CURP);

    expect(result.isRegistered).toBe(false);
    expect(result.temporaryUnavailable).toBeUndefined();
  });

  it("reporta registro cuando llega la página sin el marcador de vacío", async () => {
    proxyFetch.mockResolvedValueOnce(
      res({ text: `${TABLE} <tr><td>555…</td></tr>` }),
    );

    expect((await lookupCURPInSorcel(CURP)).isRegistered).toBe(true);
  });

  // Este es el falso positivo que upstream reprodujo con CURPs de usuarios
  // reales: la página de Cloudflare no contiene "No hay registros", y sin la
  // guarda se declaraba `isRegistered: true`.
  it("NO afirma registro ante un challenge de Cloudflare", async () => {
    proxyFetch.mockResolvedValueOnce(
      res({
        text: "<html><title>Attention Required! | Cloudflare</title></html>",
      }),
    );

    const result = await lookupCURPInSorcel(CURP);

    expect(result.isRegistered).toBeUndefined();
    expect(result.temporaryUnavailable).toBe(true);
  });

  it("marca indisponible ante 403", async () => {
    proxyFetch.mockResolvedValueOnce(res({ ok: false, status: 403 }));

    const result = await lookupCURPInSorcel(CURP);

    expect(result.temporaryUnavailable).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("marca indisponible ante timeout", async () => {
    const timeout = Object.assign(new Error("timed out"), {
      name: "TimeoutError",
    });
    proxyFetch.mockRejectedValueOnce(timeout);

    expect((await lookupCURPInSorcel(CURP)).temporaryUnavailable).toBe(true);
  });
});

describe("nextor movil", () => {
  beforeEach(() => proxyFetch.mockReset());

  it("usa la misma conexión para iniciar y pre-check", async () => {
    proxyFetch
      .mockResolvedValueOnce(res({ json: { sessionId: "s-1" } }))
      .mockResolvedValueOnce(res({ json: { encontrado: false } }));

    await lookupCURPINNextorMovil(CURP);

    // Ambas por residentialFetch: mismo dispatcher singleton, misma IP de
    // salida. El sessionId queda ligado a la IP que lo pidió.
    expect(proxyFetch).toHaveBeenCalledTimes(2);
    expect(proxyFetch.mock.calls[1][1].headers["X-Session-Id"]).toBe("s-1");
  });

  it("trata el rate limit por IP como indisponibilidad, no como error", async () => {
    proxyFetch.mockResolvedValueOnce(
      res({ ok: false, status: 429, json: { code: "IP_RATE_LIMIT" } }),
    );

    const result = await lookupCURPINNextorMovil(CURP);

    expect(result.temporaryUnavailable).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("no consulta pre-check si iniciar no devuelve sessionId", async () => {
    proxyFetch.mockResolvedValueOnce(res({ json: {} }));

    const result = await lookupCURPINNextorMovil(CURP);

    expect(result.temporaryUnavailable).toBe(true);
    expect(result.isRegistered).toBeUndefined();
    expect(proxyFetch).toHaveBeenCalledTimes(1);
  });

  it("mapea encontrado true/false", async () => {
    proxyFetch
      .mockResolvedValueOnce(res({ json: { sessionId: "s" } }))
      .mockResolvedValueOnce(res({ json: { encontrado: true } }));
    expect((await lookupCURPINNextorMovil(CURP)).isRegistered).toBe(true);

    proxyFetch.mockReset();
    proxyFetch
      .mockResolvedValueOnce(res({ json: { sessionId: "s" } }))
      .mockResolvedValueOnce(res({ json: { encontrado: false } }));
    expect((await lookupCURPINNextorMovil(CURP)).isRegistered).toBe(false);
  });

  it("no afirma 'sin registro' si falta el campo encontrado", async () => {
    proxyFetch
      .mockResolvedValueOnce(res({ json: { sessionId: "s" } }))
      .mockResolvedValueOnce(res({ json: { mensaje: "ok" } }));

    const result = await lookupCURPINNextorMovil(CURP);

    expect(result.isRegistered).toBeUndefined();
    expect(result.temporaryUnavailable).toBe(true);
  });
});

describe("talentonet", () => {
  beforeEach(() => proxyFetch.mockReset());

  it("reporta sin registro sólo con el mensaje esperado en el 404", async () => {
    proxyFetch.mockResolvedValueOnce(
      res({
        ok: false,
        status: 404,
        json: { msg: "No se encontraron registros para esta CURP." },
      }),
    );

    const result = await loookupCURPInTalentoNetMVNO(CURP);

    expect(result.isRegistered).toBe(false);
    expect(result.possibleProviders).toEqual([
      "Newww",
      "RedAguila",
      "Link Movil",
    ]);
  });

  // Un 404 del WAF o de una ruta movida no es "esta CURP no tiene líneas".
  it("no afirma 'sin registro' ante un 404 con otro cuerpo", async () => {
    proxyFetch.mockResolvedValueOnce(
      res({ ok: false, status: 404, json: { error: "Not Found" } }),
    );

    const result = await loookupCURPInTalentoNetMVNO(CURP);

    expect(result.isRegistered).toBeUndefined();
    expect(result.temporaryUnavailable).toBe(true);
  });

  it("reporta registro con 200 y cuerpo legible", async () => {
    proxyFetch.mockResolvedValueOnce(res({ json: { lineas: 2 } }));

    expect((await loookupCURPInTalentoNetMVNO(CURP)).isRegistered).toBe(true);
  });

  it("marca indisponible ante 403", async () => {
    proxyFetch.mockResolvedValueOnce(res({ ok: false, status: 403 }));

    const result = await loookupCURPInTalentoNetMVNO(CURP);

    expect(result.temporaryUnavailable).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

// ── Endurecimiento de detección positiva (auditoría 2026-08-31) ─────────────
// Los tres derivaban isRegistered de la AUSENCIA de algo en vez de confirmar
// una forma esperada. Misma clase de bug que el falso positivo de Sorcel.

describe("dialo", () => {
  it("cuenta las líneas cuando total viene", async () => {
    mockFetch({ body: { data: [{ total: 2 }] } });
    expect((await lookupCURPInDialo(CURP)).isRegistered).toBe(true);

    mockFetch({ body: { data: [{ total: 0 }] } });
    expect((await lookupCURPInDialo(CURP)).isRegistered).toBe(false);
  });

  // Antes: `data.body.data[0].total > 0` con `total` undefined da false, así
  // que un sobre de error del Lambda se mostraba como "sin registro".
  it("no afirma 'sin registro' si falta total", async () => {
    mockFetch({ body: { data: [{}] } });

    const result = await lookupCURPInDialo(CURP);

    expect(result.isRegistered).toBeUndefined();
    expect(result.temporaryUnavailable).toBe(true);
  });

  it("no truena si el sobre viene sin body", async () => {
    mockFetch({ errorMessage: "internal" });

    const result = await lookupCURPInDialo(CURP);

    expect(result.temporaryUnavailable).toBe(true);
  });
});

describe("mirlo", () => {
  beforeEach(() => proxyFetch.mockReset());

  const ok = (json: unknown) => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => json,
  });

  it("reporta sin registro con el mensaje conocido", async () => {
    proxyFetch.mockResolvedValueOnce(
      ok({
        status: 404,
        message: "No se encontró titular con el CURP proporcionado",
      }),
    );

    expect((await lookupCURPInMirlo(CURP)).isRegistered).toBe(false);
  });

  // Espejo del falso positivo de Sorcel: cualquier otra cosa era un "sí".
  it("NO afirma registro ante un error con otro mensaje", async () => {
    proxyFetch.mockResolvedValueOnce(
      ok({ status: 500, message: "Servicio no disponible" }),
    );

    const result = await lookupCURPInMirlo(CURP);

    expect(result.isRegistered).toBeUndefined();
    expect(result.temporaryUnavailable).toBe(true);
  });

  it("sigue reportando registro con una respuesta normal", async () => {
    proxyFetch.mockResolvedValueOnce(ok({ status: 200, data: { lineas: 1 } }));

    expect((await lookupCURPInMirlo(CURP)).isRegistered).toBe(true);
  });
});

describe("abib", () => {
  beforeEach(() => proxyFetch.mockReset());

  const ok = (json: unknown) => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => json,
  });

  // Respuesta real capturada del API el 2026-08-31. No trae campo `status`:
  // el código anterior decidía con !data?.status, que aquí es siempre true, así
  // que ABIB reportaba "sin registro" para cualquier CURP.
  it("reconoce el 'sin registro' real del API", async () => {
    proxyFetch.mockResolvedValueOnce(
      ok({
        success: false,
        message: "La CURP no cuenta con números vinculados",
        error_code: "CLIENT_NOT_FOUND",
        data: [],
      }),
    );

    const result = await lookupCURPInABIB(CURP);

    expect(result.isRegistered).toBe(false);
    expect(result.temporaryUnavailable).toBeUndefined();
  });

  it("reporta registro cuando success es true", async () => {
    proxyFetch.mockResolvedValueOnce(ok({ success: true, data: [{}] }));

    expect((await lookupCURPInABIB(CURP)).isRegistered).toBe(true);
  });

  // Compatibilidad con la forma vieja, por si alguna ruta aún la devuelve.
  it("sigue aceptando el campo status heredado", async () => {
    proxyFetch.mockResolvedValueOnce(ok({ status: true }));

    expect((await lookupCURPInABIB(CURP)).isRegistered).toBe(true);
  });

  it("no afirma nada ante una forma desconocida", async () => {
    proxyFetch.mockResolvedValueOnce(ok({ mensaje: "mantenimiento" }));

    const result = await lookupCURPInABIB(CURP);

    expect(result.isRegistered).toBeUndefined();
    expect(result.temporaryUnavailable).toBe(true);
  });
});
