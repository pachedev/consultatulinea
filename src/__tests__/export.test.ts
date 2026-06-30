import { describe, expect, it } from "vitest";
import { buildExportEvidencePayload, toExportLineRecords } from "@/lib/export";
import type { DisplayLine } from "@/types";

function line(overrides: Partial<DisplayLine>): DisplayLine {
  return {
    id: "test-1",
    operadora: "Telcel",
    numero: "5551234567",
    ...overrides,
  };
}

describe("toExportLineRecords", () => {
  it("maps confirmed line", () => {
    const records = toExportLineRecords([line({})]);
    expect(records[0].estado).toBe("confirmada");
    expect(records[0].operadora).toBe("Telcel");
    expect(records[0].numero).toBe("5551234567");
  });

  it("maps error line", () => {
    const records = toExportLineRecords([line({ isError: true })]);
    expect(records[0].estado).toBe("error");
  });

  it("maps unavailable line", () => {
    const records = toExportLineRecords([line({ isUnavailable: true })]);
    expect(records[0].estado).toBe("no_disponible");
  });

  it("maps notFound line", () => {
    const records = toExportLineRecords([line({ isNotFound: true })]);
    expect(records[0].estado).toBe("sin_registro");
  });

  it("maps possible line", () => {
    const records = toExportLineRecords([line({ isPossible: true })]);
    expect(records[0].estado).toBe("posible");
  });

  it("isError takes priority over isUnavailable", () => {
    const records = toExportLineRecords([line({ isError: true, isUnavailable: true })]);
    expect(records[0].estado).toBe("error");
  });

  it("preserves disclaimer", () => {
    const records = toExportLineRecords([line({ disclaimer: "Número no confirmado" })]);
    expect(records[0].disclaimer).toBe("Número no confirmado");
  });
});

describe("buildExportEvidencePayload", () => {
  const curp = "HEGG560427MVZRRL04";

  it("sets schemaVersion = 1", () => {
    const p = buildExportEvidencePayload({ curp, queryTime: null, scannedCount: 10, results: [] });
    expect(p.schemaVersion).toBe(1);
  });

  it("uppercases CURP", () => {
    const p = buildExportEvidencePayload({ curp: curp.toLowerCase(), queryTime: null, scannedCount: 0, results: [] });
    expect(p.curp).toBe(curp.toUpperCase());
  });

  it("sets source = consultatulinea", () => {
    const p = buildExportEvidencePayload({ curp, queryTime: null, scannedCount: 0, results: [] });
    expect(p.source).toBe("consultatulinea");
  });

  it("sets totalResults from results array length", () => {
    const results = [line({}), line({ id: "test-2", operadora: "AT&T" })];
    const p = buildExportEvidencePayload({ curp, queryTime: null, scannedCount: 80, results });
    expect(p.totalResults).toBe(2);
    expect(p.scannedCount).toBe(80);
  });

  it("sets queryTime null when not provided", () => {
    const p = buildExportEvidencePayload({ curp, queryTime: null, scannedCount: 0, results: [] });
    expect(p.queryTime).toBeNull();
    expect(p.queryTimeLocal).toBeNull();
  });

  it("sets queryTime ISO string when provided", () => {
    const date = new Date("2025-01-15T12:00:00Z");
    const p = buildExportEvidencePayload({ curp, queryTime: date, scannedCount: 0, results: [] });
    expect(p.queryTime).toBe("2025-01-15T12:00:00.000Z");
  });

  it("generatedAt is a valid ISO string", () => {
    const p = buildExportEvidencePayload({ curp, queryTime: null, scannedCount: 0, results: [] });
    expect(() => new Date(p.generatedAt)).not.toThrow();
    expect(p.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
