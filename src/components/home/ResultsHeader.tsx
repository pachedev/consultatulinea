"use client";

import { Download, Loader2, RotateCcw, UserCheck } from "lucide-react";
import { ACTIVE_LOOKUP_PROVIDERS } from "@/lib/data/content";
import { getRiskLevel } from "@/lib/lookup";
import { cn } from "@/lib/utils";
import type { DisplayLine } from "@/types";

type Props = {
  results: DisplayLine[];
  curp: string;
  loading: boolean;
  providersDone: number;
  queryTime: Date | null;
  onNuevaConsulta: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  exportEnabled: boolean;
  exporting: boolean;
};

export function ResultsHeader({
  results,
  curp,
  loading,
  providersDone,
  queryTime,
  onNuevaConsulta,
  onExportCsv,
  onExportJson,
  exportEnabled,
  exporting,
}: Props) {
  const detected = results.filter(
    (l) => !l.isNotFound && !l.isError && !l.isUnavailable,
  ).length;
  const risk = getRiskLevel(results);
  // El avance se mide contra los proveedores que realmente se consultan, no
  // contra las 104 marcas: una sola petición (Red Altan) cubre 65 marcas, así
  // que dividir entre el total dejaba la barra clavada en ~19% al terminar.
  const pct = Math.min(100, (providersDone / ACTIVE_LOOKUP_PROVIDERS) * 100);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              {detected}{" "}
              {detected === 1 ? "línea detectada" : "líneas detectadas"}
            </h2>
            {loading ? (
              <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs text-ink-soft">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Consultando
              </span>
            ) : null}
          </div>
          <div className="tabular mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm text-ink-soft">
            <UserCheck className="size-4" aria-hidden />
            {curp}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={!exportEnabled || exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" aria-hidden /> CSV
          </button>
          <button
            type="button"
            onClick={onExportJson}
            disabled={!exportEnabled || exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" aria-hidden /> JSON
          </button>
          <button
            type="button"
            onClick={onNuevaConsulta}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden /> Nueva consulta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-ink-soft">
            <span>Escaneando operadores…</span>
            <span className="tabular">
              {providersDone}/{ACTIVE_LOOKUP_PROVIDERS} proveedores ·{" "}
              {results.length} marcas
            </span>
          </div>
          <div className="scan-sweep relative h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ink transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2 p-4">
          <div>
            <p className="text-xs font-medium text-ink-soft">
              Estatus de riesgo
            </p>
            <p className="font-medium text-ink">{risk.label}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{risk.description}</p>
          </div>
          <span className={cn("size-3 rounded-full", risk.color)} aria-hidden />
        </div>
        <div className="rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-xs font-medium text-ink-soft">Hora de consulta</p>
          <p className="tabular font-medium text-ink">
            {queryTime
              ? queryTime.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        El estatus de riesgo es una guía rápida basada en las líneas detectadas.
        No confirma fraude por sí solo; sirve para indicar si conviene revisar
        con más detalle.
      </p>
    </div>
  );
}
