"use client";

import { ExternalLink, Phone } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/ui/CopyButton";
import { getConsultaUrl } from "@/lib/data/consultaUrls";
import { getProviderWebsite } from "@/lib/data/providerWebsites";
import { slugify } from "@/lib/operatorPages";
import { cn } from "@/lib/utils";
import type { DisplayLine } from "@/types";

type State = "confirmed" | "possible" | "error" | "unavailable" | "none";

function stateOf(line: DisplayLine): State {
  if (line.isError) return "error";
  if (line.isUnavailable) return "unavailable";
  if (line.isNotFound) return "none";
  if (line.isPossible) return "possible";
  return "confirmed";
}

const BADGE: Record<State, { label: string; cls: string }> = {
  confirmed: { label: "Registrada", cls: "bg-confirmed-bg text-confirmed" },
  possible: { label: "Posible", cls: "bg-possible-bg text-possible" },
  error: { label: "Error", cls: "bg-error-bg text-error" },
  unavailable: { label: "No disponible", cls: "bg-possible-bg text-possible" },
  none: { label: "Sin registro", cls: "bg-none-bg text-none" },
};

export function LineCard({ line }: { line: DisplayLine }) {
  const state = stateOf(line);
  const badge = BADGE[state];

  const hasVisibleNumber =
    line.numero !== "Número no confirmado" &&
    line.numero !== "Número oculto" &&
    state === "confirmed";

  // Preferimos el portal que adjunta la API (provider que falló); si no, la URL
  // oficial de consulta; si no, el sitio del operador.
  const portalUrl =
    line.portalUrl ??
    getConsultaUrl(line.operadora) ??
    getProviderWebsite(line.operadora);
  // La consulta manual aplica a líneas que no pudimos confirmar o que fallaron.
  const showManualConsult =
    state === "possible" || state === "error" || state === "unavailable";

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2">
            <Phone className="size-5 text-ink-faint" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink">{line.operadora}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  badge.cls,
                )}
              >
                {badge.label}
              </span>
            </div>
            <p
              className={cn(
                "tabular mt-0.5 text-ink-soft",
                hasVisibleNumber
                  ? "text-base"
                  : "text-sm text-ink-faint italic",
              )}
            >
              {line.numero}
            </p>
            {line.disclaimer ? (
              <p className="mt-1 max-w-prose text-xs text-possible">
                {line.disclaimer}
              </p>
            ) : null}
          </div>
        </div>

        {hasVisibleNumber ? (
          <div className="flex shrink-0 items-center gap-1">
            <CopyButton text={line.numero} />
            {portalUrl ? (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`Sitio oficial de ${line.operadora}`}
                title="Sitio oficial"
                className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Consulta manual para posibles / errores */}
      {showManualConsult ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <p className="text-xs text-ink-faint">
            {state === "error"
              ? "No pudimos consultar este operador."
              : state === "unavailable"
                ? "Consulta automática no disponible por ahora."
                : "Resultado no confirmado."}{" "}
            Verifica directamente:
          </p>
          {portalUrl ? (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Consultar en el portal
            </a>
          ) : (
            <Link
              href={`/operadores/${slugify(line.operadora)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong"
            >
              Ver ficha del operador
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
