// CURP: 18 chars, letter+digit pattern defined by RENAPO
const CURP_RE = /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/gi;

export function stripCURPs(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(CURP_RE, "[CURP]");
  }
  if (Array.isArray(value)) {
    return value.map(stripCURPs);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        stripCURPs(v),
      ]),
    );
  }
  return value;
}
