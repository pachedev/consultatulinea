"use client";

import { AlertTriangle, ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusChip } from "@/components/operators/StatusChip";
import type { OperatorStatusOverride } from "@/lib/api/status";
import type { OperatorDisplayStatus } from "@/lib/data/operators";
import type { OperatorView } from "@/lib/operatorPages";
import { cn } from "@/lib/utils";

type Filter = "all" | OperatorDisplayStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "supported", label: "Consulta directa" },
  { value: "unsupported", label: "Solo portal" },
  { value: "pending", label: "Pendiente" },
];

function findOverride(
  overrides: OperatorStatusOverride[],
  operatorName: string,
): OperatorStatusOverride | undefined {
  const n = operatorName.toLowerCase();
  return overrides.find((o) => {
    const k = o.operator_name.toLowerCase();
    return n.includes(k) || k.includes(n);
  });
}

export function OperatorsDirectory({
  operators,
  statusOverrides = [],
}: {
  operators: OperatorView[];
  statusOverrides?: OperatorStatusOverride[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return operators.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (q && !o.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [operators, query, filter]);

  const degraded = statusOverrides.filter((o) => o.state !== "available");

  return (
    <div>
      {degraded.length > 0 ? (
        <div className="mb-5 flex gap-3 rounded-xl border border-possible/30 bg-possible-bg p-4 text-sm text-possible">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Algunos operadores reportan incidencias</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {degraded.map((o) => (
                <li key={o.operator_name}>
                  <strong>{o.operator_name}</strong>
                  {o.state === "paused" ? " — pausado" : " — no disponible"}
                  {o.note ? `: ${o.note}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar operador o marca…"
            aria-label="Buscar operador"
            className="w-full rounded-lg border border-line bg-surface py-2.5 pr-4 pl-9 text-ink outline-none transition placeholder:text-ink-faint focus:border-line-strong focus:ring-2 focus:ring-ink/10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                filter === f.value
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="tabular mt-4 text-xs text-ink-faint">
        {filtered.length} de {operators.length} operadores
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line bg-surface p-8 text-center text-sm text-ink-soft">
          No se encontraron operadores con ese criterio.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {filtered.map((o) => {
            const override = findOverride(statusOverrides, o.name);
            const isDown = override && override.state !== "available";
            return (
              <li key={o.slug}>
                <Link
                  href={`/operadores/${o.slug}`}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-lg border bg-surface p-4 transition-colors hover:border-line-strong",
                    isDown ? "border-possible/40" : "border-line",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{o.name}</p>
                    <StatusChip status={o.status} className="mt-1.5" />
                    {isDown ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-possible">
                        <AlertTriangle className="size-3" aria-hidden />
                        {override.state === "paused" ? "Pausado" : "No disponible"}
                        {override.note ? ` — ${override.note}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-ink"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
