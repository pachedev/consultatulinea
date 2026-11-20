export type LineResult = {
  company: string;
  lines: string[];
  isRegistered?: boolean;
  possibleProviders?: string[];
  possibleDisclaimer?: string;
  notFoundProviders?: string[];
  error?: string;
  temporaryUnavailable?: boolean;
  /** Portal oficial para consulta manual cuando la consulta automática falla. */
  portalUrl?: string;
};

/**
 * Lo que sale del servidor hacia el navegador. Hoy tiene la misma forma que
 * `LineResult`, pero el nombre marca la frontera: un valor de este tipo ya
 * pasó por `toPublicResult` (lista blanca de campos, sin datos crudos).
 */
export type PublicLineResult = LineResult;

export interface DisplayLine {
  id: string;
  operadora: string;
  numero: string;
  disclaimer?: string;
  isPossible?: boolean;
  isNotFound?: boolean;
  isError?: boolean;
  isUnavailable?: boolean;
  portalUrl?: string;
}

export interface ExportLineRecord {
  operadora: string;
  numero: string;
  estado: "confirmada" | "posible" | "sin_registro" | "error" | "no_disponible";
  disclaimer?: string;
}

export interface ExportEvidencePayload {
  schemaVersion: 1;
  source: "consultatulinea";
  curp: string;
  generatedAt: string;
  generatedAtLocal: string;
  queryTime: string | null;
  queryTimeLocal: string | null;
  scannedCount: number;
  totalResults: number;
  lines: ExportLineRecord[];
}

export interface ExportIntegrity {
  signed: boolean;
  algorithm: "HMAC-SHA-256";
  payloadSha256: string;
  signature: string | null;
  signedAt: string;
  keyId: string;
}

export interface ProviderResult {
  company: string;
  lines: string[];
  isRegistered?: boolean;
  possibleProviders?: string[];
  possibleDisclaimer?: string;
  notFoundProviders?: string[];
  error?: string;
  temporaryUnavailable?: boolean;
  portalUrl?: string;
}

export interface ProviderResponse {
  provider: string;
  result: ProviderResult;
}

export type FilterTab = "all" | "confirmed" | "possible" | "errors";
