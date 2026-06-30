import { describe, expect, it } from "vitest";
import { CURP_REGEX, getCurpValidationError } from "@/lib/curp";

const VALID_CURPS = [
  "HEGG560427MVZRRL04",
  "AAAA000101HDFBBB01",
  "ZZZZ991231MDFAAA01",
  "ABCD850615HDFXYZ09",
];

const INVALID_CURPS = [
  "HEGG560427MVZRRL0",  // 17 chars
  "1EGG560427MVZRRL04",  // starts with digit
  "HEGG560427XVZRRL04",  // sex char = X (valid with CURP_REGEX but check regex)
  "HEGG560427AVZRRL04",  // sex char = A (invalid)
  "hegg560427mvzrrl04",  // lowercase
  "",
  "ABCD",
];

describe("CURP_REGEX", () => {
  it("accepts valid CURPs", () => {
    for (const curp of VALID_CURPS) {
      expect(CURP_REGEX.test(curp), `expected ${curp} to match`).toBe(true);
    }
  });

  it("rejects CURPs with invalid sex character", () => {
    expect(CURP_REGEX.test("HEGG560427AVZRRL04")).toBe(false);
  });

  it("rejects lowercase", () => {
    expect(CURP_REGEX.test("hegg560427mvzrrl04")).toBe(false);
  });

  it("rejects short strings", () => {
    expect(CURP_REGEX.test("ABCD")).toBe(false);
    expect(CURP_REGEX.test("")).toBe(false);
  });
});

describe("getCurpValidationError", () => {
  it("returns null for empty string (no error yet)", () => {
    expect(getCurpValidationError("")).toBeNull();
  });

  it("returns null for partial input < 18 chars (typing in progress)", () => {
    expect(getCurpValidationError("HEGG560427")).toBeNull();
    expect(getCurpValidationError("HEGG560427MVZRRL0")).toBeNull();
  });

  it("returns null for valid 18-char CURP", () => {
    for (const curp of VALID_CURPS) {
      expect(getCurpValidationError(curp), `expected no error for ${curp}`).toBeNull();
    }
  });

  it("errors when first 4 chars are not letters", () => {
    const err = getCurpValidationError("1EGG560427MVZRRL04");
    expect(err).toBeTruthy();
    expect(err).toContain("4 caracteres");
  });

  it("errors when chars 5–10 are not date digits", () => {
    const err = getCurpValidationError("HEGGXX0427MVZRRL04");
    expect(err).toBeTruthy();
    expect(err).toContain("fecha");
  });

  it("errors when sex character is invalid", () => {
    const err = getCurpValidationError("HEGG560427AVZRRL04");
    expect(err).toBeTruthy();
    expect(err).toContain("H");
  });

  it("errors for general format mismatch at 18 chars", () => {
    const err = getCurpValidationError("HEGG560427MVZRRL0!");
    expect(err).toBeTruthy();
  });
});
