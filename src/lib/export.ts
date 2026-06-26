import type {
  DisplayLine,
  ExportEvidencePayload,
  ExportIntegrity,
  ExportLineRecord,
} from "@/types";

function getLineStatus(line: DisplayLine): ExportLineRecord["estado"] {
  if (line.isError) return "error";
  if (line.isUnavailable) return "no_disponible";
  if (line.isNotFound) return "sin_registro";
  if (line.isPossible) return "posible";
  return "confirmada";
}

export function toExportLineRecords(
  results: DisplayLine[],
): ExportLineRecord[] {
  return results.map((line) => ({
    operadora: line.operadora,
    numero: line.numero,
    estado: getLineStatus(line),
    disclaimer: line.disclaimer,
  }));
}

export function formatLocalTimestamp(
  date: Date | string | null,
): string | null {
  if (!date) return null;
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "America/Mexico_City",
  }).format(value);
}

export function buildExportEvidencePayload(params: {
  curp: string;
  queryTime: Date | null;
  scannedCount: number;
  results: DisplayLine[];
}): ExportEvidencePayload {
  const generatedAt = new Date();
  const lines = toExportLineRecords(params.results);

  return {
    schemaVersion: 1,
    source: "consultatulinea",
    curp: params.curp.toUpperCase(),
    generatedAt: generatedAt.toISOString(),
    generatedAtLocal:
      formatLocalTimestamp(generatedAt) ?? generatedAt.toISOString(),
    queryTime: params.queryTime?.toISOString() ?? null,
    queryTimeLocal: formatLocalTimestamp(params.queryTime),
    scannedCount: params.scannedCount,
    totalResults: lines.length,
    lines,
  };
}

function escapeCsvField(value: string): string {
  const normalized = value.replaceAll('"', '""');
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

export function buildCsvExport(
  payload: ExportEvidencePayload,
  integrity: ExportIntegrity,
): string {
  const metadataLines = [
    "# ConsultaTuLinea evidence export",
    `# schema_version: ${payload.schemaVersion}`,
    `# curp: ${payload.curp}`,
    `# generated_at: ${payload.generatedAt}`,
    `# generated_at_local: ${payload.generatedAtLocal}`,
    `# query_time: ${payload.queryTime ?? ""}`,
    `# query_time_local: ${payload.queryTimeLocal ?? ""}`,
    `# scanned_count: ${payload.scannedCount}`,
    `# total_results: ${payload.totalResults}`,
    `# signed: ${integrity.signed ? "true" : "false"}`,
    `# signed_at: ${integrity.signedAt}`,
    `# key_id: ${integrity.keyId}`,
    `# algorithm: ${integrity.algorithm}`,
    `# payload_sha256: ${integrity.payloadSha256}`,
    `# signature: ${integrity.signature ?? "UNSIGNED"}`,
  ];

  const header = "operadora,numero,estado,disclaimer";
  const rows = payload.lines.map((line) =>
    [
      escapeCsvField(line.operadora),
      escapeCsvField(line.numero),
      escapeCsvField(line.estado),
      escapeCsvField(line.disclaimer ?? ""),
    ].join(","),
  );

  return [...metadataLines, header, ...rows].join("\n");
}

export function buildJsonExport(
  payload: ExportEvidencePayload,
  integrity: ExportIntegrity,
): string {
  return JSON.stringify({ evidence: payload, integrity }, null, 2);
}

export function getExportFilename(
  curp: string,
  extension: "csv" | "json",
): string {
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  return `consultatulinea-${curp.toUpperCase()}-${timestamp}.${extension}`;
}
