import { describe, expect, it } from "vitest";
import {
  describeShape,
  maskMsisdn,
  maskPhones,
  stripCURPs,
  toPublicResult,
} from "@/lib/sanitize";

const REAL_CURP = "HEGG560427MVZRRL04";
const REDACTED = "[CURP]";

describe("stripCURPs", () => {
  it("redacts CURP in a plain string", () => {
    expect(stripCURPs(`Consultando ${REAL_CURP} ahora`)).toBe(
      `Consultando ${REDACTED} ahora`,
    );
  });

  it("passes through strings without CURP", () => {
    expect(stripCURPs("sin CURP aquí")).toBe("sin CURP aquí");
    expect(stripCURPs("")).toBe("");
  });

  it("redacts CURP in object values", () => {
    const result = stripCURPs({ curp: REAL_CURP, other: "datos" }) as Record<string, string>;
    expect(result.curp).toBe(REDACTED);
    expect(result.other).toBe("datos");
  });

  it("redacts CURP in nested objects", () => {
    const input = { nested: { curp: REAL_CURP } };
    const result = stripCURPs(input) as { nested: { curp: string } };
    expect(result.nested.curp).toBe(REDACTED);
  });

  it("redacts CURP in array elements", () => {
    const result = stripCURPs([REAL_CURP, "otro"]) as string[];
    expect(result[0]).toBe(REDACTED);
    expect(result[1]).toBe("otro");
  });

  it("redacts multiple CURPs in one string", () => {
    const result = stripCURPs(`${REAL_CURP} y AAAA000101HDFBBB01`) as string;
    expect(result).toBe(`${REDACTED} y ${REDACTED}`);
  });

  // MisLíneas 102e857: los logs tampoco deben llevar teléfonos completos.
  it("enmascara teléfonos en texto y en números JSON, recursivamente", () => {
    const out = stripCURPs({
      a: "5512346789",
      b: ["tel 55 1234 6789", { c: "+52 55-1234-6789" }],
      d: 5512346789,
      e: "******6789",
      f: 1700000000000,
      g: 525512346789,
    }) as Record<string, unknown>;
    expect(out.a).toBe("******6789");
    expect((out.b as unknown[])[0]).toBe("tel ******6789");
    expect(((out.b as unknown[])[1] as { c: string }).c).toBe("******6789");
    expect(out.d).toBe("******6789");
    expect(out.e).toBe("******6789");
    expect(out.f).toBe(1700000000000);
    expect(out.g).toBe("******6789");
  });

  it("passes through numbers and null", () => {
    expect(stripCURPs(42)).toBe(42);
    expect(stripCURPs(null)).toBeNull();
    expect(stripCURPs(true)).toBe(true);
  });
});

describe("maskPhones", () => {
  it("deja solo los últimos 4 dígitos", () => {
    expect(maskPhones("5512346789")).toBe("******6789");
    expect(maskPhones("55 1234 6789")).toBe("******6789");
    expect(maskPhones("+52 55-1234-6789")).toBe("******6789");
  });

  it("no toca números ya enmascarados ni textos cortos", () => {
    expect(maskPhones("Telcel: ******0414")).toBe("Telcel: ******0414");
    expect(maskPhones("Validation failed (503)")).toBe(
      "Validation failed (503)",
    );
  });
});

describe("toPublicResult", () => {
  const leaky = {
    company: "Logistica ACN",
    lines: ["Logistica ACN: 5512340414"],
    isRegistered: true,
    possibleProviders: ["FedeGo!"],
    rawApiResponse: [
      {
        nombre: "PERSONA DE PRUEBA",
        dn: "5512340414",
        curp: REAL_CURP,
        responseRenapo: '{"fechNac":"01/01/1970"}',
      },
    ],
    campoNuevoDelProvider: { dn: "5512340414" },
  };

  it("descarta rawApiResponse y cualquier campo no permitido", () => {
    const out = toPublicResult(leaky) as Record<string, unknown>;
    expect(out).not.toHaveProperty("rawApiResponse");
    expect(out).not.toHaveProperty("campoNuevoDelProvider");
    expect(Object.keys(out).sort()).toEqual(
      ["company", "isRegistered", "lines", "possibleProviders"].sort(),
    );
  });

  it("no deja salir el teléfono completo, el nombre ni la CURP", () => {
    const wire = JSON.stringify(toPublicResult(leaky));
    expect(wire).not.toContain("5512340414");
    expect(wire).not.toContain("PERSONA DE PRUEBA");
    expect(wire).not.toContain(REAL_CURP);
    expect(wire).toContain("******0414");
  });

  it("conserva los campos que la interfaz sí usa", () => {
    const out = toPublicResult({
      company: "Telcel",
      lines: [],
      error: `Lookup failed: ${REAL_CURP}`,
      temporaryUnavailable: true,
      portalUrl: "https://example.com",
      notFoundProviders: ["A"],
      possibleDisclaimer: "nota",
    });
    expect(out.error).toBe("Lookup failed: [CURP]");
    expect(out.temporaryUnavailable).toBe(true);
    expect(out.portalUrl).toBe("https://example.com");
    expect(out.notFoundProviders).toEqual(["A"]);
    expect(out.possibleDisclaimer).toBe("nota");
  });
});

describe("describeShape", () => {
  it("lista llaves y tipos sin ningún valor", () => {
    const out = describeShape({
      nombre: "PERSONA DE PRUEBA",
      dn: "5512340414",
      lineas: [{ msisdn: "5512340414" }],
      total: 1,
    });
    expect(out).toBe(
      "{nombre: string, dn: string, lineas: [{msisdn: string} ×1], total: number}",
    );
    expect(out).not.toContain("5512340414");
    expect(out).not.toContain("PERSONA");
  });
});

describe("números en `lines`", () => {
  it("maskMsisdn deja siempre el formato ******1234", () => {
    expect(maskMsisdn("5512340414")).toBe("******0414");
    expect(maskMsisdn("+52 55 1234 0414")).toBe("******0414");
    expect(maskMsisdn("******0414")).toBe("******0414");
    expect(maskMsisdn(5512340414)).toBe("******0414");
    expect(maskMsisdn(null)).toBe("******");
  });

  it("la frontera enmascara cualquier tira de 5+ dígitos en una línea", () => {
    const out = toPublicResult({
      company: "X",
      lines: [
        "Marca: 5512340414",
        "Marca: 12340414",
        "Marca: 55-1234-0414",
        "Marca: ******0414",
        "Spot 1: ******0414",
      ],
    });
    expect(out.lines).toEqual([
      "Marca: ******0414",
      "Marca: ******0414",
      "Marca: ******0414",
      "Marca: ******0414",
      "Spot 1: ******0414",
    ]);
  });
});
