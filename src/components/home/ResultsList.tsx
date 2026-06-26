"use client";

import { ChevronDown, ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { LineCard } from "@/components/home/LineCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { getConsultaUrl } from "@/lib/data/consultaUrls";
import { getOperatorDisplayStatus, OPERATORS } from "@/lib/data/operators";
import { getProviderWebsite } from "@/lib/data/providerWebsites";
import { cn } from "@/lib/utils";
import type { DisplayLine, FilterTab } from "@/types";

type Props = {
  loading: boolean;
  visibleResults: DisplayLine[];
  collapsedNotFound: DisplayLine[];
  activeFilter: FilterTab;
  activeResultsCount: number;
  searchQuery: string;
};

const unsupportedOperators = OPERATORS.filter(
  (op) => getOperatorDisplayStatus(op) !== "supported",
);

export function ResultsList({
  loading,
  visibleResults,
  collapsedNotFound,
  activeFilter,
  activeResultsCount,
  searchQuery,
}: Props) {
  const [notFoundOpen, setNotFoundOpen] = useState(false);
  const [unsupportedOpen, setUnsupportedOpen] = useState(false);

  if (loading && visibleResults.length === 0) {
    return (
      <div className="space-y-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!loading && activeResultsCount === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-line bg-surface p-8 text-center">
        <Search className="mb-3 size-7 text-ink-faint" aria-hidden />
        <p className="font-medium text-ink">Sin coincidencias</p>
        <p className="mt-1 text-sm text-ink-soft">
          {searchQuery
            ? `No hay resultados para "${searchQuery}"`
            : "No hay resultados en esta categoría."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visibleResults.map((line, i) => (
        <LineCard key={`${line.id}-${i}`} line={line} />
      ))}

      {/* Operadoras sin líneas registradas */}
      {activeFilter === "all" && collapsedNotFound.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <button
            type="button"
            onClick={() => setNotFoundOpen((v) => !v)}
            aria-expanded={notFoundOpen}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2"
          >
            <span>
              {collapsedNotFound.length} operadora
              {collapsedNotFound.length !== 1 ? "s" : ""} sin líneas registradas
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform",
                notFoundOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {notFoundOpen ? (
            <div className="max-h-72 space-y-1 overflow-y-auto border-t border-line px-5 py-3">
              {collapsedNotFound.map((line, i) => (
                <div
                  key={`${line.id}-${i}`}
                  className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0"
                >
                  <span className="text-ink-soft">{line.operadora}</span>
                  <span className="text-xs text-ink-faint italic">
                    Sin registro
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Operadoras no disponibles (consulta automática) → consulta manual */}
      {activeFilter === "all" &&
      !searchQuery &&
      unsupportedOperators.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-possible/30 bg-possible-bg/40">
          <button
            type="button"
            onClick={() => setUnsupportedOpen((v) => !v)}
            aria-expanded={unsupportedOpen}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-possible transition-colors hover:bg-possible-bg"
          >
            <span>
              {unsupportedOperators.length} operadora
              {unsupportedOperators.length !== 1 ? "s" : ""} requieren consulta
              manual
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform",
                unsupportedOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {unsupportedOpen ? (
            <div className="max-h-80 space-y-2 overflow-y-auto border-t border-possible/20 px-5 py-3">
              {unsupportedOperators.map((op) => {
                const website =
                  getConsultaUrl(op.name) ?? getProviderWebsite(op.name);
                return (
                  <div
                    key={op.name}
                    className="flex items-center justify-between gap-3 border-b border-possible/15 py-2 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{op.name}</p>
                      {op.reason ? (
                        <p className="text-xs text-ink-soft">{op.reason}</p>
                      ) : null}
                    </div>
                    {website ? (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong"
                      >
                        <ExternalLink className="size-3.5" aria-hidden />
                        Portal
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
