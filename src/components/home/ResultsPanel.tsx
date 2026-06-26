"use client";

import { RotateCw } from "lucide-react";
import { LineCard } from "@/components/ui/LineCard";
import { TOTAL_PROVIDERS } from "@/lib/data/content";
import type { UseLookupReturn } from "@/lib/hooks/useLookup";
import { getRiskLevel } from "@/lib/lookup";
import { cn } from "@/lib/utils";

export function ResultsPanel({ lookup }: { lookup: UseLookupReturn }) {
  const {
    loading,
    error,
    timedOut,
    results,
    scannedCount,
    liveMessage,
    queryTime,
    retry,
  } = lookup;

  // Aún no se ha consultado.
  if (results === null && !loading && !error && !timedOut) return null;

  return (
    <section className="mt-8 w-full" aria-label="Resultados de la consulta">
      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>

      {/* Barra de progreso */}
      {loading ? (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Escaneando operadores…</span>
            <span>
              {scannedCount} / {TOTAL_PROVIDERS}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${Math.min(100, (scannedCount / TOTAL_PROVIDERS) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Error / timeout */}
      {error || timedOut ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-700">
            {timedOut
              ? "La consulta tardó demasiado. Intenta de nuevo."
              : error}
          </p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
          >
            <RotateCw className="size-4" aria-hidden />
            Reintentar
          </button>
        </div>
      ) : null}

      {/* Resumen de riesgo */}
      {results && results.length > 0 ? (
        <RiskSummary lookupResults={results} />
      ) : null}

      {/* Lista de resultados */}
      {results && results.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {results.map((line) => (
            <LineCard key={line.id} line={line} />
          ))}
        </div>
      ) : null}

      {/* Vacío tras consulta completa */}
      {!loading && !error && !timedOut && results && results.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-medium text-slate-900">Sin líneas detectadas</p>
          <p className="mt-1 text-sm text-slate-500">
            No se encontraron líneas registradas con esta CURP en los operadores
            consultados.
          </p>
        </div>
      ) : null}

      {queryTime && !loading ? (
        <p className="mt-4 text-xs text-slate-400">
          Consulta realizada el {queryTime.toLocaleString("es-MX")}.
        </p>
      ) : null}
    </section>
  );
}

function RiskSummary({
  lookupResults,
}: {
  lookupResults: NonNullable<UseLookupReturn["results"]>;
}) {
  const risk = getRiskLevel(lookupResults);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span className={cn("size-3 rounded-full", risk.color)} aria-hidden />
      <div>
        <p className="font-medium text-slate-900">Nivel: {risk.label}</p>
        <p className="text-sm text-slate-500">{risk.description}</p>
      </div>
    </div>
  );
}
