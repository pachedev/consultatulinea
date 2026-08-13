"use client";

import { Flag, MessageSquareWarning, Search } from "lucide-react";
import { useState } from "react";
import { FilterTabs } from "@/components/home/FilterTabs";
import { ReportModal } from "@/components/home/ReportModal";
import { ResultsHeader } from "@/components/home/ResultsHeader";
import { ResultsList } from "@/components/home/ResultsList";
import {
  buildCsvExport,
  buildExportEvidencePayload,
  buildJsonExport,
  getExportFilename,
} from "@/lib/export";
import type { DisplayLine, ExportIntegrity, FilterTab } from "@/types";

type Props = {
  results: DisplayLine[];
  curp: string;
  loading: boolean;
  scannedCount: number;
  providersDone: number;
  queryTime: Date | null;
  onNuevaConsulta: () => void;
};

export function ResultsPanel({
  results,
  curp,
  loading,
  scannedCount,
  providersDone,
  queryTime,
  onNuevaConsulta,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const confirmed = results.filter(
    (l) => !l.isPossible && !l.isNotFound && !l.isError && !l.isUnavailable,
  );
  const possible = results.filter(
    (l) => l.isPossible && !l.isNotFound && !l.isError && !l.isUnavailable,
  );
  const errors = results.filter((l) => l.isError);
  const notFound = results.filter((l) => l.isNotFound);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: results.length },
    { key: "confirmed", label: "Confirmados", count: confirmed.length },
    { key: "possible", label: "Posibles", count: possible.length },
    { key: "errors", label: "Errores", count: errors.length },
  ];

  const byFilter = (): DisplayLine[] => {
    switch (activeFilter) {
      case "confirmed":
        return [...confirmed, ...notFound];
      case "possible":
        return possible;
      case "errors":
        return errors;
      default:
        return results;
    }
  };

  const matchesSearch = (l: DisplayLine) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.operadora.toLowerCase().includes(q) ||
      l.numero.toLowerCase().includes(q)
    );
  };

  const base = byFilter().filter(matchesSearch);
  const visibleResults =
    activeFilter === "all" ? base.filter((l) => !l.isNotFound) : base;
  const collapsedNotFound =
    activeFilter === "all" ? notFound.filter(matchesSearch) : [];

  const exportEnabled = !loading && !!queryTime;

  const download = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: "csv" | "json") => {
    if (!queryTime || exporting) return;
    setExporting(true);
    setExportMessage(null);
    try {
      const payload = buildExportEvidencePayload({
        curp,
        queryTime,
        scannedCount,
        results,
      });
      const res = await fetch("/api/export-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        throw new Error("No se pudo generar la firma del documento.");
      const integrity = (await res.json()) as ExportIntegrity;
      const content =
        format === "csv"
          ? buildCsvExport(payload, integrity)
          : buildJsonExport(payload, integrity);
      download(
        getExportFilename(curp, format),
        content,
        format === "csv" ? "text/csv;charset=utf-8" : "application/json",
      );
    } catch (err) {
      setExportMessage(
        err instanceof Error ? err.message : "No se pudo exportar el archivo.",
      );
    } finally {
      setExporting(false);
    }
  };

  const hasIncidents = errors.length > 0 || notFound.length > 0;

  return (
    <div className="space-y-5">
      <ResultsHeader
        results={results}
        curp={curp}
        loading={loading}
        providersDone={providersDone}
        queryTime={queryTime}
        onNuevaConsulta={onNuevaConsulta}
        onExportCsv={() => handleExport("csv")}
        onExportJson={() => handleExport("json")}
        exportEnabled={exportEnabled}
        exporting={exporting}
      />

      {exportMessage ? (
        <div className="rounded-xl border border-possible/30 bg-possible-bg px-4 py-3 text-sm text-possible">
          {exportMessage}
        </div>
      ) : null}

      {!loading && hasIncidents ? (
        <div className="flex gap-3 rounded-xl border border-possible/30 bg-possible-bg p-4 text-sm text-possible">
          <MessageSquareWarning
            className="mt-0.5 size-5 shrink-0"
            aria-hidden
          />
          <p>
            Uno o más operadores no respondieron.{" "}
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="font-medium underline underline-offset-2"
            >
              Repórtalo aquí
            </button>{" "}
            para que lo revisemos.
          </p>
        </div>
      ) : null}

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />

      <FilterTabs
        tabs={tabs}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      <div className="relative">
        <Search
          className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Buscar operador o número…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface py-2.5 pr-4 pl-10 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-line-strong focus:ring-2 focus:ring-ink/10"
        />
      </div>

      <ResultsList
        loading={loading}
        visibleResults={visibleResults}
        collapsedNotFound={collapsedNotFound}
        activeFilter={activeFilter}
        activeResultsCount={visibleResults.length + collapsedNotFound.length}
        searchQuery={searchQuery}
      />

      {!loading && results.length > 0 ? (
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="group flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-left text-sm text-ink-soft transition-colors hover:border-line-strong hover:bg-surface hover:text-ink"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-faint transition-colors group-hover:border-line-strong group-hover:text-ink">
            <Flag className="size-4" aria-hidden />
          </span>
          <span>
            <span className="block font-medium text-ink">
              ¿Algo no está bien?
            </span>
            <span className="text-xs">
              Reporta líneas incorrectas, operadores que fallan o cualquier
              problema con los resultados.
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
