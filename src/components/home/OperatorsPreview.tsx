"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SUPPORTED_PROVIDERS, TOTAL_PROVIDERS } from "@/lib/data/content";
import { getOperatorDisplayStatus, OPERATORS } from "@/lib/data/operators";
import { slugify } from "@/lib/operatorPages";
import { cn } from "@/lib/utils";

type Filter = "all" | "ok" | "manual";

// Las que más busca la gente, mezclando consulta directa y manual para que la
// cobertura real se vea sin entrar al directorio.
const FEATURED = [
  "Telcel",
  "Bait",
  "Netwey",
  "Virgin Mobile",
  "Weex",
  "Viasat",
  "AT&T / Unefon / WIM",
  "Telefónica Movistar",
  "Mega Móvil",
  "Oxio",
  "OXXO CEL",
  "Vinoc",
];
const LIMIT = 12;

const ALL = OPERATORS.map((o) => ({
  name: o.name,
  slug: slugify(o.name),
  ok: getOperatorDisplayStatus(o) === "supported",
}));

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "ok", label: "Se consultan" },
  { key: "manual", label: "Consulta manual" },
];

export function OperatorsPreview() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pass = (o: (typeof ALL)[number]) =>
      (filter === "all" || (filter === "ok") === o.ok) &&
      (!q || o.name.toLowerCase().includes(q));
    // Sin búsqueda se muestran las destacadas; con búsqueda, todo el catálogo.
    const base = q
      ? ALL
      : [
          ...FEATURED.map((n) => ALL.find((o) => o.name === n)).filter(
            (o): o is (typeof ALL)[number] => !!o,
          ),
          ...ALL.filter((o) => !FEATURED.includes(o.name)),
        ];
    return base.filter(pass).slice(0, LIMIT);
  }, [query, filter]);

  return (
    <section
      id="operadoras"
      aria-labelledby="operadoras-heading"
      className="scroll-mt-20 border-t border-line"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
        <div className="mb-7 max-w-2xl">
          <h2
            id="operadoras-heading"
            className="text-2xl font-semibold tracking-tight text-ink"
          >
            Operadoras
          </h2>
          <p className="mt-2 text-ink-faint">
            {`Consultamos ${SUPPORTED_PROVIDERS} de ${TOTAL_PROVIDERS} marcas. AT&T, Unefon, Bait y Movistar, entre otras, no se pueden consultar desde aquí; para esas te dejamos su portal oficial.`}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="flex min-h-12 min-w-0 flex-[1_1_240px] items-center gap-2 rounded-xl border border-line bg-surface px-3.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft">
            <Search className="size-[18px] text-ink-faint" aria-hidden />
            <span className="sr-only">Buscar operadora</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar operadora"
              className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
            />
          </label>
          <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
            <legend className="sr-only">Estado</legend>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "min-h-10 rounded-full border px-3.5 text-sm transition-colors",
                  filter === f.key
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </fieldset>
        </div>

        {list.length ? (
          <ul className="grid gap-2 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3 lg:gap-3">
            {list.map((o) => (
              <li key={o.slug}>
                {/* El borde izquierdo indica el estado; la etiqueta lo repite en texto. */}
                <Link
                  href={`/operadores/${o.slug}`}
                  className={cn(
                    "group flex min-h-[52px] items-center gap-2.5 rounded-[10px] border border-l-[3px] border-line bg-surface py-2.5 pr-3 pl-3.5 transition hover:-translate-y-px hover:border-line-strong hover:shadow-card motion-reduce:hover:translate-y-0",
                    o.ok
                      ? "border-l-confirmed hover:border-l-confirmed"
                      : "border-l-danger hover:border-l-danger",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-ink group-hover:text-accent">
                    {o.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      o.ok
                        ? "bg-confirmed-bg text-confirmed"
                        : "bg-error-bg text-error",
                    )}
                  >
                    {o.ok ? "Se consulta" : "Consulta manual"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-3 text-ink-faint">
            No hay operadoras con ese nombre. Revisa la ortografía.
          </p>
        )}

        <Link
          href="/operadores"
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
        >
          Ver las {TOTAL_PROVIDERS} operadoras
        </Link>
      </div>
    </section>
  );
}
