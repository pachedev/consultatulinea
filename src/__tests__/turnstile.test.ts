import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

const siteverify = (body: unknown, ok = true) =>
  vi.fn().mockResolvedValue({ ok, json: async () => body });

const VALID = { success: true, hostname: "sitio.mx", action: "lookup" };

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");
    vi.stubEnv("TURNSTILE_ALLOWED_HOSTNAMES", "sitio.mx, www.sitio.mx");
    vi.stubEnv("TURNSTILE_TESTING", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("acepta una respuesta válida con hostname y acción correctos", async () => {
    vi.stubGlobal("fetch", siteverify(VALID));
    expect(await verifyTurnstile("token")).toEqual({ success: true });
  });

  it("no envía la CURP ni la IP a Cloudflare", async () => {
    const fetchMock = siteverify(VALID);
    vi.stubGlobal("fetch", fetchMock);
    await verifyTurnstile("token");
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(Object.keys(sent).sort()).toEqual(["response", "secret"]);
  });

  it.each([
    ["success false", { ...VALID, success: false }],
    ["hostname ajeno", { ...VALID, hostname: "otro.com" }],
    ["acción de otro formulario", { ...VALID, action: "report" }],
    ["sin hostname ni acción", { success: true }],
  ])("rechaza con 403: %s", async (_name, body) => {
    vi.stubGlobal("fetch", siteverify(body));
    const result = await verifyTurnstile("token");
    expect(result).toMatchObject({
      success: false,
      status: 403,
      code: "verification_required",
    });
  });

  it.each([undefined, "", "   ", 42, "x".repeat(2049)])(
    "rechaza un token inválido sin llamar a Cloudflare: %s",
    async (token) => {
      const fetchMock = siteverify(VALID);
      vi.stubGlobal("fetch", fetchMock);
      expect(await verifyTurnstile(token)).toMatchObject({ status: 403 });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("sin clave secreta falla cerrado (503) fuera de desarrollo", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyTurnstile("token")).toMatchObject({
      success: false,
      status: 503,
      code: "verification_unavailable",
    });
  });

  it("sin lista de hostnames falla cerrado (503)", async () => {
    vi.stubEnv("TURNSTILE_ALLOWED_HOSTNAMES", "");
    expect(await verifyTurnstile("token")).toMatchObject({ status: 503 });
  });

  it("si Cloudflare no responde falla cerrado (503)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await verifyTurnstile("token")).toMatchObject({ status: 503 });
    vi.stubGlobal("fetch", siteverify({}, false));
    expect(await verifyTurnstile("token")).toMatchObject({ status: 503 });
  });

  it("solo en `next dev` y sin clave se omite la verificación", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyTurnstile(undefined)).toEqual({ success: true });
  });

  it("TURNSTILE_TESTING acepta las claves dummy, pero exige success", async () => {
    vi.stubEnv("TURNSTILE_TESTING", "true");
    vi.stubEnv("TURNSTILE_ALLOWED_HOSTNAMES", "");
    vi.stubGlobal("fetch", siteverify({ success: true }));
    expect(await verifyTurnstile("token")).toEqual({ success: true });
    vi.stubGlobal("fetch", siteverify({ success: false }));
    expect(await verifyTurnstile("token")).toMatchObject({ status: 403 });
  });
});
