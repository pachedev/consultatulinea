import type { LineResult, PublicLineResult } from "@/types";

// CURP: 18 chars, letter+digit pattern defined by RENAPO
const CURP_RE = /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/gi;

// Un número JSON que parece teléfono mexicano: 10 dígitos, opcionalmente con
// el 52 delante. Más estricto que PHONE_RE para no tocar ids ni timestamps.
const PHONE_NUMBER_RE = /^(?:52)?\d{10}$/;

/**
 * Quita CURPs y enmascara teléfonos (deja los últimos 4 dígitos) en cualquier
 * valor, recorriendo objetos y arreglos. Pensado para lo que va a los logs del
 * servidor; lo que sale al navegador pasa además por `toPublicResult`.
 */
export function stripCURPs(value: unknown): unknown {
  if (typeof value === "string") {
    return maskPhones(value.replace(CURP_RE, "[CURP]"));
  }
  if (typeof value === "number") {
    // Hay operadores que mandan el número como número JSON, no como texto.
    const text = String(value);
    return PHONE_NUMBER_RE.test(text) ? maskPhones(text) : value;
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

// Teléfono: 10 a 15 dígitos seguidos, con o sin separadores y prefijo "+".
// Una CURP no encaja (solo trae 6 dígitos consecutivos) y un número ya
// enmascarado ("******0414") tampoco, así que aplicar esto dos veces es inocuo.
const PHONE_RE = /\+?\d(?:[\s.-]?\d){9,14}/g;

/** Deja visibles solo los últimos 4 dígitos de cualquier teléfono en el texto. */
export function maskPhones(text: string): string {
  return text.replace(
    PHONE_RE,
    (match) => `******${match.replace(/\D/g, "").slice(-4)}`,
  );
}

/**
 * Enmascara un número en el ORIGEN, dentro del provider: devuelve siempre
 * `******1234`. Úsalo en cuanto el operador entrega un número, para que el
 * valor completo no exista más allá de esa línea. Un número que ya venía
 * enmascarado queda igual.
 */
export function maskMsisdn(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  return `******${digits.slice(-4)}`;
}

// En `lines` no hay ningún motivo legítimo para una tira larga de dígitos: lo
// único numérico que se muestra son los últimos 4. Por eso aquí el umbral es
// 5 y no 10: cubre números cortos, parciales o con formato raro.
const LINE_DIGITS_RE = /\+?\d(?:[\s.-]?\d){4,}/g;

const cleanLine = (value: string): string =>
  (stripCURPs(value) as string).replace(
    LINE_DIGITS_RE,
    (match) => `******${match.replace(/\D/g, "").slice(-4)}`,
  );

const cleanText = (value: unknown): string =>
  maskPhones(stripCURPs(String(value ?? "")) as string);

const cleanList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v) => typeof v === "string").map(cleanText)
    : [];

/**
 * Convierte el resultado interno de un provider en lo ÚNICO que puede salir
 * del servidor (stream NDJSON y caché en memoria).
 *
 * Es una lista blanca, no una lista negra: se copia campo por campo y todo lo
 * demás se descarta. Los providers llegaron a adjuntar la respuesta cruda del
 * operador (`rawApiResponse`: nombre completo, fecha de nacimiento, teléfono
 * completo, datos de RENAPO) y eso salía al navegador. Ese campo ya no
 * existe, pero la regla se queda: si mañana un provider agrega otro campo con
 * datos crudos, tampoco sale; habría que añadirlo aquí a propósito.
 */
export function toPublicResult(result: LineResult): PublicLineResult {
  const out: PublicLineResult = {
    company: cleanText(result?.company),
    lines: Array.isArray(result?.lines)
      ? result.lines.filter((l) => typeof l === "string").map(cleanLine)
      : [],
  };
  if (typeof result?.isRegistered === "boolean") {
    out.isRegistered = result.isRegistered;
  }
  if (Array.isArray(result?.possibleProviders)) {
    out.possibleProviders = cleanList(result.possibleProviders);
  }
  if (typeof result?.possibleDisclaimer === "string") {
    out.possibleDisclaimer = cleanText(result.possibleDisclaimer);
  }
  if (Array.isArray(result?.notFoundProviders)) {
    out.notFoundProviders = cleanList(result.notFoundProviders);
  }
  if (typeof result?.error === "string") {
    out.error = cleanText(result.error);
  }
  if (result?.temporaryUnavailable === true) {
    out.temporaryUnavailable = true;
  }
  if (typeof result?.portalUrl === "string") {
    out.portalUrl = result.portalUrl;
  }
  return out;
}

/**
 * Describe la FORMA de una respuesta inesperada para el log, sin sus valores:
 * las respuestas de los operadores traen datos personales del titular.
 */
export function describeShape(value: unknown, depth = 0): string {
  if (Array.isArray(value)) {
    return value.length === 0
      ? "[]"
      : `[${describeShape(value[0], depth + 1)} ×${value.length}]`;
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as object);
    if (depth >= 3) return `{${keys.length} llaves}`;
    return `{${keys
      .slice(0, 20)
      .map(
        (k) =>
          `${k}: ${describeShape((value as Record<string, unknown>)[k], depth + 1)}`,
      )
      .join(", ")}}`;
  }
  return value === null ? "null" : typeof value;
}
