import { describe, expect, it } from "vitest";
import { stripCURPs } from "@/lib/sanitize";

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

  it("passes through numbers and null", () => {
    expect(stripCURPs(42)).toBe(42);
    expect(stripCURPs(null)).toBeNull();
    expect(stripCURPs(true)).toBe(true);
  });
});
