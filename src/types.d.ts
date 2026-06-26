export type LineResult = {
  company: string;
  lines: string[];
  isRegistered?: boolean;
  possibleProviders?: string[];
  possibleDisclaimer?: string;
  notFoundProviders?: string[];
  error?: string;
  temporaryUnavailable?: boolean;
  rawApiResponse?: unknown;
};

export interface DisplayLine {
  id: string;
  operadora: string;
  numero: string;
  disclaimer?: string;
  isPossible?: boolean;
  isNotFound?: boolean;
  isError?: boolean;
  isUnavailable?: boolean;
}

export interface ExportLineRecord {
  operadora: string;
  numero: string;
  estado: "confirmada" | "posible" | "sin_registro" | "error" | "no_disponible";
  disclaimer?: string;
}

export interface ExportEvidencePayload {
  schemaVersion: 1;
  source: "mislineas";
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
  rawApiResponse?: unknown;
}

export interface ProviderResponse {
  provider: string;
  result: ProviderResult;
}

export type FilterTab = "all" | "confirmed" | "possible" | "errors";
