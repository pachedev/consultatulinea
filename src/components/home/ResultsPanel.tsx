"use client";

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Flag,
  Info,
  MessageSquareWarning,
  Search,
} from "lucide-react";
import { useState } from "react";
import { FilterTabs } from "@/components/home/FilterTabs";
import { ReportModal } from "@/components/home/ReportModal";
import { ResultsHeader } from "@/components/home/ResultsHeader";
import { ResultsList } from "@/components/home/ResultsList";
import { getOperatorDisplayStatus, OPERATORS } from "@/lib/data/operators";
import { SITE } from "@/lib/data/site";
import {
  buildCsvExport,
  buildExportEvidencePayload,
  buildJsonExport,
  getExportFilename,
} from "@/lib/export";
import type { DisplayLine, ExportIntegrity, FilterTab } from "@/types";

// Marcas que la gente más espera ver y que hoy no se consultan en automático.
// Se nombran arriba de los resultados para que una línea que no aparece no se
// lea como "no está registrada".
const UNCOVERED_POPULAR = OPERATORS.filter(
  (op) =>
    getOperatorDisplayStatus(op) !== "supported" &&
    /AT&T|Unefon|Bait|Movistar/i.test(op.name),
).map((op) => op.name);

type Props = {
  results: DisplayLine[];
  curp: string;
  loading: boolean;
  scannedCount: number;
  providersDone: number;
  queryTime: Date | null;
  /** Error o tiempo agotado con resultados parciales ya en pantalla. */
  error?: string | null;
  timedOut?: boolean;
  onNuevaConsulta: () => void;
};

export function ResultsPanel({
  results,
  curp,
  loading,
  scannedCount,
  providersDone,
  queryTime,
  error = null,
  timedOut = false,
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

  // Incidente = un operador que falló o no respondió. "Sin registro"
  // (isNotFound) es una respuesta válida: antes contaba aquí y el aviso de
  // "uno o más operadores no respondieron" salía en casi todas las consultas.
  const hasIncidents =
    errors.length > 0 || results.some((l) => l.isUnavailable);
  const detected = confirmed.length + possible.length;

  const showEmpty = !loading && detected === 0;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
      {/* ── General: resumen, acciones y avisos ── */}
      <div className="space-y-4">
        {error || timedOut ? (
          <div
            role="alert"
            className="flex gap-3 rounded-xl bg-error-bg p-4 text-sm text-error"
          >
            <AlertCircle className="mt-0.5 size-[18px] shrink-0" aria-hidden />
            <div>
              <p>
                {timedOut
                  ? "La consulta tardó demasiado y algunos operadores no alcanzaron a responder."
                  : error}
              </p>
              <button
                type="button"
                onClick={onNuevaConsulta}
                className="mt-1 font-semibold underline underline-offset-2"
              >
                Consultar de nuevo
              </button>
            </div>
          </div>
        ) : null}

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
          <div className="rounded-xl border border-possible/25 bg-possible-bg px-4 py-3 text-sm text-possible">
            {exportMessage}
          </div>
        ) : null}

        {/* Fraude: siempre al portal oficial (CRT), nunca a nuestro backend. */}
        {!loading && detected > 0 ? (
          <div className="grid gap-3 rounded-xl border border-danger/25 bg-error-bg p-4 sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-1">
            <div>
              <p className="font-semibold text-ink">
                ¿Alguna línea no es tuya?
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Repórtala como uso indebido en el portal oficial de la Comisión
                Reguladora de Telecomunicaciones. También puedes pedir la baja
                directamente a la operadora.
              </p>
            </div>
            <a
              href={SITE.reportFraud}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 justify-self-start rounded-xl bg-danger px-4 text-sm font-semibold text-danger-ink transition hover:brightness-105"
            >
              Reportar fraude en la CRT
              <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </div>
        ) : null}

        {!loading && hasIncidents ? (
          <div className="flex gap-3 rounded-xl border border-possible/25 bg-possible-bg p-4 text-sm text-possible">
            <MessageSquareWarning
              className="mt-0.5 size-[18px] shrink-0"
              aria-hidden
            />
            <p>
              Uno o más operadores no respondieron.{" "}
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="font-semibold underline underline-offset-2"
              >
                Repórtalo aquí
              </button>{" "}
              para que lo revisemos.
            </p>
          </div>
        ) : null}

        {!loading && UNCOVERED_POPULAR.length > 0 ? (
          <div
            role="note"
            className="flex gap-3 rounded-xl border border-accent/25 bg-accent-soft p-4 text-sm text-ink-soft"
          >
            <Info
              className="mt-0.5 size-[18px] shrink-0 text-accent"
              aria-hidden
            />
            <p>
              Este resultado no cubre {UNCOVERED_POPULAR.join(", ")}: hoy no
              podemos consultarlas en automático. Si tu línea es de alguna de
              ellas, que no aparezca aquí no significa que no esté registrada;
              verifícalo en su portal oficial.
            </p>
          </div>
        ) : null}

        {!loading && results.length > 0 ? (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-left text-sm text-ink-faint transition-colors hover:border-line-strong hover:bg-surface"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-faint transition-colors group-hover:text-ink">
              <Flag className="size-4" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-ink">
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

      {/* ── Específico: detalle por línea. Destino de "Ver detalle de líneas". ── */}
      <section
        id="detalle-resultados"
        tabIndex={-1}
        aria-label="Detalle de resultados"
        className="scroll-mt-20 space-y-4 outline-none"
      >
        {showEmpty ? (
          <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-confirmed-bg text-confirmed">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold text-ink">Sin líneas registradas</h2>
              <p className="mt-0.5 text-sm text-ink-faint">
                Ninguna de las operadoras que respondieron tiene líneas a tu
                nombre. Revisa abajo las que no pudimos consultar en automático.
              </p>
            </div>
          </div>
        ) : (
          <>
            <FilterTabs
              tabs={tabs}
              active={activeFilter}
              onChange={setActiveFilter}
            />

            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft">
              <Search className="size-4 text-ink-faint" aria-hidden />
              <span className="sr-only">Buscar en resultados</span>
              <input
                type="search"
                placeholder="Buscar operador o número…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink outline-none placeholder:text-ink-faint"
              />
            </label>
          </>
        )}

        <ResultsList
          loading={loading}
          visibleResults={visibleResults}
          collapsedNotFound={collapsedNotFound}
          activeFilter={activeFilter}
          activeResultsCount={visibleResults.length + collapsedNotFound.length}
          searchQuery={searchQuery}
        />
      </section>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
