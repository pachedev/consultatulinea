import { describe, expect, it } from "vitest";
import { getRiskLevel, transformApiResponse } from "@/lib/lookup";
import type { ProviderResponse } from "@/types";

// Helpers
function confirmed(provider: string, lines: string[]): ProviderResponse {
  return { provider, result: { company: provider, lines, isRegistered: true } };
}
function notFound(provider: string): ProviderResponse {
  return { provider, result: { company: provider, lines: [], isRegistered: false } };
}
function unavailable(provider: string): ProviderResponse {
  return { provider, result: { company: provider, lines: [], temporaryUnavailable: true } };
}
function withError(provider: string): ProviderResponse {
  return { provider, result: { company: provider, lines: [], error: "Error genérico" } };
}

describe("transformApiResponse", () => {
  it("returns empty array for empty input", () => {
    expect(transformApiResponse([])).toEqual([]);
  });

  it("maps confirmed lines", () => {
    const lines = transformApiResponse([confirmed("Telcel", ["5551234567"])]);
    expect(lines).toHaveLength(1);
    expect(lines[0].operadora).toBe("Telcel");
    expect(lines[0].numero).toBe("5551234567");
    expect(lines[0].isPossible).toBe(false);
    expect(lines[0].isNotFound).toBeFalsy();
    expect(lines[0].isError).toBeFalsy();
  });

  it("splits 'Brand: number' format into operadora + numero", () => {
    const lines = transformApiResponse([confirmed("Altán", ["Sky: 5559999000"])]);
    expect(lines[0].operadora).toBe("Sky");
    expect(lines[0].numero).toBe("5559999000");
  });

  it("maps not-found result", () => {
    const lines = transformApiResponse([notFound("AT&T")]);
    expect(lines[0].isNotFound).toBe(true);
    expect(lines[0].numero).toBe("Sin registro");
  });

  it("maps temporaryUnavailable result", () => {
    const lines = transformApiResponse([unavailable("Movistar")]);
    expect(lines[0].isUnavailable).toBe(true);
    expect(lines[0].numero).toBe("Temporalmente no disponible");
  });

  it("maps error result", () => {
    const lines = transformApiResponse([withError("Freedompop")]);
    expect(lines[0].isError).toBe(true);
    expect(lines[0].numero).toBe("Error al consultar");
  });

  it("maps isRegistered without lines as hidden number", () => {
    const resp: ProviderResponse = {
      provider: "Telcel",
      result: { company: "Telcel", lines: [], isRegistered: true },
    };
    const lines = transformApiResponse([resp]);
    expect(lines[0].numero).toBe("Número oculto");
    expect(lines[0].isPossible).toBe(false);
  });

  it("maps possibleProviders", () => {
    const resp: ProviderResponse = {
      provider: "Altán",
      result: {
        company: "Altán",
        lines: [],
        isRegistered: true,
        possibleProviders: ["Sky", "BienCel"],
      },
    };
    const lines = transformApiResponse([resp]);
    const possibles = lines.filter((l) => l.isPossible);
    expect(possibles).toHaveLength(2);
    expect(possibles.map((l) => l.operadora).sort()).toEqual(["BienCel", "Sky"]);
  });

  it("sorts: confirmed < possible < notFound < unavailable < error", () => {
    const lines = transformApiResponse([
      withError("E"),
      unavailable("U"),
      notFound("N"),
      confirmed("C", ["5550000000"]),
    ]);
    expect(lines[0].operadora).toBe("C");
    expect(lines[lines.length - 1].isError).toBe(true);
  });
});

describe("getRiskLevel", () => {
  it("returns Sin Registro when no lines", () => {
    const level = getRiskLevel([]);
    expect(level.label).toBe("Sin Registro");
  });

  it("returns Bajo for 1-2 confirmed lines", () => {
    const lines = transformApiResponse([confirmed("Telcel", ["5551234567"])]);
    expect(getRiskLevel(lines).label).toBe("Bajo");
  });

  it("returns Moderado for 3+ confirmed lines", () => {
    const lines = transformApiResponse([
      confirmed("Telcel", ["5550000001", "5550000002", "5550000003"]),
    ]);
    expect(getRiskLevel(lines).label).toBe("Moderado");
  });

  it("ignores notFound/error lines for risk calc", () => {
    const lines = transformApiResponse([notFound("AT&T"), withError("Movistar")]);
    expect(getRiskLevel(lines).label).toBe("Sin Registro");
  });
});
