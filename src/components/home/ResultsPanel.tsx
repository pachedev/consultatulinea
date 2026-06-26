"use client";

import { MessageSquareWarning, Search } from "lucide-react";
import { useState } from "react";
import { FilterTabs } from "@/components/home/FilterTabs";
import { ResultsHeader } from "@/components/home/ResultsHeader";
import { ResultsList } from "@/components/home/ResultsList";
import { SITE } from "@/lib/data/site";
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
  queryTime: Date | null;
  onNuevaConsulta: () => void;
};

export function ResultsPanel({
  results,
  curp,
  loading,
  scannedCount,
  queryTime,
  onNuevaConsulta,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

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
        scannedCount={scannedCount}
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
        <div className="flex gap-3 rounded-xl border border-line bg-surface-2 p-4 text-sm text-ink-soft">
          <MessageSquareWarning
            className="mt-0.5 size-5 shrink-0 text-ink-faint"
            aria-hidden
          />
          <p>
            ¿Una línea no aparece o un operador estuvo no disponible? Es un
            proyecto comunitario y dependemos de tu feedback.{" "}
            <a
              href={SITE.reportFraud}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline underline-offset-2"
            >
              Repórtalo aquí
            </a>
            .
          </p>
        </div>
      ) : null}

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
    </div>
  );
}
