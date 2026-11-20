"use client";

import {
  ArrowDown,
  Download,
  ListChecks,
  Loader2,
  RotateCcw,
  UserCheck,
} from "lucide-react";
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
  // contra el total de marcas: una sola petición (Red Altan) cubre 89 marcas, así
  // que dividir entre el total dejaba la barra clavada en ~19% al terminar.
  const pct = Math.min(100, (providersDone / ACTIVE_LOOKUP_PROVIDERS) * 100);

  const exportBtn =
    "inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="edge-card rounded-[18px] p-5 shadow-card">
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[1.44rem] font-semibold tracking-tight text-ink">
              {detected}{" "}
              {detected === 1 ? "línea detectada" : "líneas detectadas"}
            </h2>
            {loading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs text-ink-soft">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Consultando
              </span>
            ) : null}
          </div>
          <p className="tabular mt-2.5 inline-flex w-fit items-center gap-2 rounded-[10px] bg-surface-2 px-3 py-1.5 text-sm text-ink-soft">
            <UserCheck className="size-4" aria-hidden />
            {curp}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={!exportEnabled || exporting}
            className={exportBtn}
          >
            <Download className="size-4" aria-hidden /> CSV
          </button>
          <button
            type="button"
            onClick={onExportJson}
            disabled={!exportEnabled || exporting}
            className={exportBtn}
          >
            <Download className="size-4" aria-hidden /> JSON
          </button>
          <button
            type="button"
            onClick={onNuevaConsulta}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden /> Nueva consulta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-ink-faint">
            <span>Escaneando operadores…</span>
            <span className="tabular-nums">
              {providersDone}/{ACTIVE_LOOKUP_PROVIDERS} proveedores,{" "}
              {results.length} marcas
            </span>
          </div>
          <div className="scan-sweep relative h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-ink-faint">
              Estatus de riesgo
            </p>
            <p className="mt-0.5 font-semibold text-ink">{risk.label}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{risk.description}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-faint">
              {risk.reason}
            </p>
          </div>
          <span
            className={cn("size-3 shrink-0 rounded-full", risk.color)}
            aria-hidden
          />
        </div>
        <div className="rounded-xl border border-line bg-paper px-4 py-3.5">
          <p className="text-xs font-medium text-ink-faint">Hora de consulta</p>
          <p className="mt-0.5 font-semibold text-ink tabular-nums">
            {queryTime
              ? queryTime.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
      </div>

      <p className="mt-3.5 text-xs leading-relaxed text-ink-faint">
        El estatus de riesgo es una guía rápida basada en las líneas detectadas.
        No confirma fraude por sí solo; sirve para indicar si conviene revisar
        con más detalle.
      </p>

      {/* Atajo al detalle: entre avisos y CTA, en móvil la lista queda lejos. */}
      <button
        type="button"
        onClick={() => {
          const target = document.getElementById("detalle-resultados");
          if (!target) return;
          const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          target.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
          target.focus({ preventScroll: true });
        }}
        className="btn-primary-glow mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-105 sm:w-auto lg:hidden"
      >
        <ListChecks className="size-4" aria-hidden />
        Ver detalle de líneas
        <span className="rounded-full bg-accent-ink/20 px-2 py-px text-xs tabular-nums">
          {results.length}
        </span>
        <ArrowDown className="size-4" aria-hidden />
      </button>
    </div>
  );
}
