"use client";

import { ArrowUpRight, Phone } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/ui/CopyButton";
import { getConsultaUrl } from "@/lib/data/consultaUrls";
import { getProviderWebsite } from "@/lib/data/providerWebsites";
import { SITE } from "@/lib/data/site";
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

  const iconTone =
    state === "confirmed"
      ? "bg-confirmed-bg text-confirmed"
      : state === "possible" || state === "unavailable"
        ? "bg-possible-bg text-possible"
        : state === "error"
          ? "bg-error-bg text-error"
          : "bg-surface-2 text-ink-faint";

  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              iconTone,
            )}
          >
            <Phone className="size-[18px]" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">{line.operadora}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  badge.cls,
                )}
              >
                {badge.label}
              </span>
            </div>
            <p
              className={cn(
                "mt-0.5",
                hasVisibleNumber
                  ? "tabular text-base text-ink"
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
          <div className="flex shrink-0 items-center gap-0.5">
            <CopyButton text={line.numero} />
            {portalUrl ? (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`Sitio oficial de ${line.operadora} (se abre en otra pestaña)`}
                title="Sitio oficial"
                className="inline-flex size-9 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Fraude: al portal oficial de la CRT, no a nuestro reporte */}
      {state === "confirmed" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-ink-faint">
          ¿No reconoces esta línea?
          <a
            href={SITE.reportFraud}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-danger underline underline-offset-2"
          >
            Reportar fraude en la CRT
            <ArrowUpRight className="size-3" aria-hidden />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </div>
      ) : null}

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
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:border-line-strong"
            >
              Consultar en el portal
              <ArrowUpRight className="size-3.5" aria-hidden />
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          ) : (
            <Link
              href={`/operadores/${slugify(line.operadora)}`}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:border-line-strong"
            >
              Ver ficha del operador
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
