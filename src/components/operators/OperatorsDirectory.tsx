"use client";

import { AlertTriangle, ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusChip } from "@/components/operators/StatusChip";
import type { OperatorStatusOverride } from "@/lib/api/status";
import type { OperatorDisplayStatus } from "@/lib/data/operators";
import type { OperatorNetwork } from "@/lib/operatorNetworks";
import type { OperatorView } from "@/lib/operatorPages";
import { cn } from "@/lib/utils";

type Filter = "all" | OperatorDisplayStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "supported", label: "Consulta directa" },
  { value: "unsupported", label: "Solo portal" },
  { value: "pending", label: "Pendiente" },
];

const NETWORKS: OperatorNetwork[] = [
  "Red Altán",
  "Freedompop",
  "Logística ACN",
  "Consulta propia",
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

/** Iniciales para el avatar: "Mega Móvil" → "MM", "2y2x" → "2". */
function initials(name: string): string {
  return name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function OperatorsDirectory({
  operators,
  networks = {},
  statusOverrides = [],
}: {
  operators: OperatorView[];
  /** Red por slug; la calcula el servidor (lib/operatorNetworks). */
  networks?: Record<string, OperatorNetwork | null>;
  statusOverrides?: OperatorStatusOverride[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [network, setNetwork] = useState<"" | OperatorNetwork>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return operators.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (network && networks[o.slug] !== network) return false;
      if (q && !o.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [operators, networks, query, filter, network]);

  const countFor = (f: Filter) =>
    f === "all"
      ? operators.length
      : operators.filter((o) => o.status === f).length;

  const degraded = statusOverrides.filter((o) => o.state !== "available");

  return (
    <div>
      {degraded.length > 0 ? (
        <div className="mb-5 flex gap-3 rounded-xl border border-possible/25 bg-possible-bg p-4 text-sm text-possible">
          <AlertTriangle className="mt-0.5 size-[18px] shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">
              Algunos operadores reportan incidencias
            </p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {degraded.map((o) => (
                <li key={o.operator_name}>
                  <strong>{o.operator_name}</strong>
                  {o.state === "paused" ? ", pausado" : ", no disponible"}
                  {o.note ? `: ${o.note}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft">
          <Search className="size-[18px] text-ink-faint" aria-hidden />
          <span className="sr-only">Buscar operador</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar operador o marca…"
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
        </label>

        <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Filtrar por estado</legend>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                filter === f.value
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums",
                  filter === f.value
                    ? "bg-paper/25 text-paper"
                    : "bg-surface-2 text-ink-faint",
                )}
              >
                {countFor(f.value)}
              </span>
            </button>
          ))}
        </fieldset>

        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value as "" | OperatorNetwork)}
          aria-label="Filtrar por red"
          className="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
        >
          <option value="">Todas las redes</option>
          {NETWORKS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 mb-3 text-xs text-ink-faint tabular-nums">
        {filtered.length} de {operators.length} operadores
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-soft">
          No se encontraron operadores con ese criterio.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => {
            const override = findOverride(statusOverrides, o.name);
            const isDown = override && override.state !== "available";
            const net = networks[o.slug];
            const portal = o.consultaUrl ?? o.website;
            return (
              <li key={o.slug}>
                <article
                  className={cn(
                    "flex h-full flex-col gap-2.5 rounded-xl border bg-surface p-4 transition hover:border-line-strong hover:shadow-card",
                    isDown ? "border-possible/45" : "border-line",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                        o.status === "supported"
                          ? "bg-accent-soft text-accent"
                          : "bg-surface-2 text-ink-faint",
                      )}
                      aria-hidden
                    >
                      {initials(o.name)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="leading-tight font-semibold text-ink">
                        {o.name}
                      </h2>
                      {net ? (
                        <p className="mt-0.5 text-xs text-ink-faint">{net}</p>
                      ) : null}
                      <StatusChip status={o.status} className="mt-1.5" />
                    </div>
                  </div>

                  {o.status !== "supported" && o.reason ? (
                    <p className="text-xs leading-relaxed text-ink-faint">
                      {o.reason}
                    </p>
                  ) : null}

                  {isDown ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-possible">
                      <AlertTriangle className="size-3" aria-hidden />
                      {override.state === "paused"
                        ? "Pausado"
                        : "No disponible"}
                      {override.note ? `: ${override.note}` : ""}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-2.5">
                    <Link
                      href={`/operadores/${o.slug}`}
                      className="inline-flex min-h-9 items-center rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong"
                    >
                      Ver ficha
                    </Link>
                    {portal ? (
                      <a
                        href={portal}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong"
                      >
                        Portal oficial
                        <ArrowUpRight className="size-3.5" aria-hidden />
                        <span className="sr-only">
                          {" "}
                          (se abre en otra pestaña)
                        </span>
                      </a>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
